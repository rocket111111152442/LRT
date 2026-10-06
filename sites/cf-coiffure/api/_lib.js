/**
 * Moteur de réservation partagé par les fonctions serverless.
 *
 * Stockage : Vercel Blob en accès privé (variable BLOB_READ_WRITE_TOKEN, injectée
 * automatiquement par Vercel quand le store est relié au projet). En local, sans
 * jeton, les données vont dans le dossier .data/ pour pouvoir tester.
 *
 * Organisation des données :
 *   bookings/{date}/{id}.json      un rendez-vous
 *   ids/{id}.json                  { date } — retrouve un rendez-vous par son code
 *   blocks/{date}/{id}.json        une indisponibilité posée par le salon
 *   locks/{date}/{staff}/{HHMM}    un créneau de 15 min occupé
 *
 * Les verrous sont créés un par un sans écrasement possible : si deux clients
 * visent le même créneau au même instant, le second échoue proprement (409).
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { SALON, STEP, RULES, HOURS, STAFF, SERVICES } = require('./_config');

/* ------------------------------------------------------------------ store */

const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
let blob = null;
if (useBlob) blob = require('@vercel/blob');
const LOCAL_DIR = path.join(process.cwd(), '.data');

class ConflictError extends Error {}
/** Erreur de saisie, dont le message peut être montré tel quel au visiteur. */
class UserError extends Error {}

const store = {
  async put(pathname, data, { overwrite = true } = {}) {
    const body = typeof data === 'string' ? data : JSON.stringify(data);
    if (useBlob) {
      try {
        await blob.put(pathname, body, {
          access: 'private',
          addRandomSuffix: false,
          allowOverwrite: overwrite,
          contentType: 'application/json',
          cacheControlMaxAge: 60,
        });
      } catch (err) {
        if (!overwrite && /already exists/i.test(String(err && err.message))) throw new ConflictError(pathname);
        throw err;
      }
      return;
    }
    const file = path.join(LOCAL_DIR, pathname);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    try {
      fs.writeFileSync(file, body, { flag: overwrite ? 'w' : 'wx' });
    } catch (err) {
      if (err.code === 'EEXIST') throw new ConflictError(pathname);
      throw err;
    }
  },

  async get(pathname) {
    if (useBlob) {
      const res = await blob.get(pathname, { access: 'private', useCache: false });
      if (!res || res.statusCode !== 200 || !res.stream) return null;
      const text = await new Response(res.stream).text();
      return JSON.parse(text);
    }
    const file = path.join(LOCAL_DIR, pathname);
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  },

  async list(prefix) {
    if (useBlob) {
      const out = [];
      let cursor;
      do {
        const res = await blob.list({ prefix, cursor, limit: 1000 });
        res.blobs.forEach((b) => out.push(b.pathname));
        cursor = res.hasMore ? res.cursor : undefined;
      } while (cursor);
      return out;
    }
    const dir = path.join(LOCAL_DIR, prefix);
    const out = [];
    const walk = (d) => {
      if (!fs.existsSync(d)) return;
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else out.push(path.relative(LOCAL_DIR, p).split(path.sep).join('/'));
      }
    };
    walk(dir);
    return out;
  },

  async del(pathnames) {
    const list = [].concat(pathnames).filter(Boolean);
    if (!list.length) return;
    if (useBlob) {
      for (let i = 0; i < list.length; i += 100) await blob.del(list.slice(i, i + 100));
      return;
    }
    list.forEach((p) => {
      try { fs.unlinkSync(path.join(LOCAL_DIR, p)); } catch (_) { /* déjà supprimé */ }
    });
  },
};

/* ------------------------------------------------------------------- time */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function toMin(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function toHHMM(min) {
  return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
}
function key(min) {
  return toHHMM(min).replace(':', '');
}

/** Date et minute courantes à Paris. */
function parisNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SALON.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return { date: `${get('year')}-${get('month')}-${get('day')}`, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

function addDays(date, n) {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function weekday(date) {
  return new Date(date + 'T12:00:00Z').getUTCDay();
}
function daysBetween(a, b) {
  return Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000);
}
function isValidDate(date) {
  if (!DATE_RE.test(date)) return false;
  return new Date(date + 'T12:00:00Z').toISOString().slice(0, 10) === date;
}

/** Minutes écoulées avant un rendez-vous (négatif s'il est passé). */
function minutesUntil(date, time) {
  const now = parisNow();
  return daysBetween(now.date, date) * 1440 + toMin(time) - now.minutes;
}

/* --------------------------------------------------------------- services */

function resolveServices(ids) {
  if (!Array.isArray(ids) || !ids.length || ids.length > RULES.maxServices) return null;
  const uniq = [...new Set(ids)];
  const list = uniq.map((id) => SERVICES.find((s) => s.id === id));
  if (list.some((s) => !s)) return null;
  return {
    items: list.map(({ id, name, duration, price }) => ({ id, name, duration, price })),
    duration: list.reduce((n, s) => n + s.duration, 0),
    price: list.reduce((n, s) => n + s.price, 0),
  };
}

/* ----------------------------------------------------------- availability */

async function occupied(date) {
  const paths = await store.list(`locks/${date}/`);
  const set = new Set();
  paths.forEach((p) => {
    const [, , staff, hhmm] = p.split('/');
    set.add(staff + '/' + hhmm.replace(/\.json$/, ''));
  });
  return set;
}

function dayIsBookable(date) {
  const now = parisNow();
  const diff = daysBetween(now.date, date);
  return diff >= 0 && diff <= RULES.maxDaysAhead && (HOURS[weekday(date)] || []).length > 0;
}

/**
 * Créneaux disponibles pour une durée donnée.
 * @returns [{ time: 'HH:MM', staff: [ids] }]
 */
async function availability(date, duration, staffPref) {
  if (!dayIsBookable(date)) return [];
  const taken = await occupied(date);
  const now = parisNow();
  const earliest = date === now.date ? now.minutes + RULES.minNoticeMinutes : -1;
  const staffList = staffPref && staffPref !== 'any' ? STAFF.filter((s) => s.id === staffPref) : STAFF;
  const slots = new Map();

  for (const [open, close] of HOURS[weekday(date)]) {
    for (let t = toMin(open); t + duration <= toMin(close); t += STEP) {
      if (t < earliest) continue;
      for (const s of staffList) {
        let free = true;
        for (let m = t; m < t + duration; m += STEP) {
          if (taken.has(s.id + '/' + key(m))) { free = false; break; }
        }
        if (free) {
          const hh = toHHMM(t);
          if (!slots.has(hh)) slots.set(hh, []);
          slots.get(hh).push(s.id);
        }
      }
    }
  }
  return [...slots.entries()].map(([time, staff]) => ({ time, staff }));
}

/** Pose les verrous d'un intervalle ; annule tout si un créneau est déjà pris. */
async function claim(date, staff, start, duration, owner) {
  const made = [];
  try {
    for (let m = toMin(start); m < toMin(start) + duration; m += STEP) {
      const p = `locks/${date}/${staff}/${key(m)}.json`;
      await store.put(p, owner, { overwrite: false });
      made.push(p);
    }
    return made;
  } catch (err) {
    await store.del(made);
    throw err;
  }
}

/* --------------------------------------------------------------- bookings */

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newCode() {
  const bytes = crypto.randomBytes(6);
  let s = '';
  for (const b of bytes) s += CODE_CHARS[b % CODE_CHARS.length];
  return 'CF-' + s;
}
function newToken() {
  return crypto.randomBytes(24).toString('base64url');
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

async function findBooking(id) {
  if (!/^CF-[A-Z0-9]{6}$/.test(String(id))) return null;
  const ref = await store.get(`ids/${id}.json`);
  if (!ref) return null;
  return store.get(`bookings/${ref.date}/${id}.json`);
}

async function saveBooking(b) {
  b.updatedAt = new Date().toISOString();
  await store.put(`bookings/${b.date}/${b.id}.json`, b);
}

/**
 * Crée un rendez-vous. Lève ConflictError si le créneau vient d'être pris.
 * @param input { services, staff, date, time, name, phone, email, note, source }
 */
async function createBooking(input) {
  const svc = resolveServices(input.services);
  if (!svc) throw new UserError('Prestations invalides.');
  const { date, time } = input;
  if (!isValidDate(date) || !TIME_RE.test(time)) throw new UserError('Date ou heure invalide.');

  const isAdmin = input.source === 'salon';
  if (!isAdmin) {
    if (!dayIsBookable(date)) throw new UserError('Ce jour n’est pas réservable.');
    if (minutesUntil(date, time) < RULES.minNoticeMinutes) throw new UserError('Ce créneau est trop proche.');
    const inHours = (HOURS[weekday(date)] || []).some(([o, c]) => toMin(time) >= toMin(o) && toMin(time) + svc.duration <= toMin(c));
    if (!inHours || toMin(time) % STEP) throw new UserError('Créneau hors des horaires d’ouverture.');
  }

  // Choix du fauteuil : celui demandé, sinon le moins chargé de la journée parmi les libres.
  let candidates;
  if (input.staff && input.staff !== 'any') {
    if (!STAFF.some((s) => s.id === input.staff)) throw new UserError('Fauteuil inconnu.');
    candidates = [input.staff];
  } else {
    const taken = await occupied(date);
    const load = (id) => [...taken].filter((k) => k.startsWith(id + '/')).length;
    candidates = STAFF.map((s) => s.id).sort((a, b) => load(a) - load(b) || Math.random() - 0.5);
  }

  const id = newCode();
  let locks = null;
  let staff = null;
  for (const c of candidates) {
    try {
      locks = await claim(date, c, time, svc.duration, { booking: id });
      staff = c;
      break;
    } catch (err) {
      if (!(err instanceof ConflictError)) throw err;
    }
  }
  if (!locks) throw new ConflictError('slot');

  const booking = {
    id,
    token: newToken(),
    status: 'confirmed',
    date,
    time,
    end: toHHMM(toMin(time) + svc.duration),
    duration: svc.duration,
    price: svc.price,
    services: svc.items,
    staff,
    staffRequested: input.staff || 'any',
    name: input.name,
    phone: input.phone,
    email: input.email || '',
    note: input.note || '',
    source: input.source || 'web',
    locks,
    createdAt: new Date().toISOString(),
    history: [{ at: new Date().toISOString(), what: 'créé (' + (input.source || 'web') + ')' }],
  };
  await saveBooking(booking);
  await store.put(`ids/${id}.json`, { date });
  return booking;
}

async function cancelBooking(b, by) {
  if (b.status === 'cancelled') return b;
  await store.del(b.locks || []);
  b.status = 'cancelled';
  b.locks = [];
  b.history = (b.history || []).concat({ at: new Date().toISOString(), what: 'annulé par ' + by });
  await saveBooking(b);
  return b;
}

/** Version publique (sans jeton ni verrous). */
function publicBooking(b) {
  const staff = STAFF.find((s) => s.id === b.staff);
  return {
    id: b.id, status: b.status, date: b.date, time: b.time, end: b.end,
    duration: b.duration, price: b.price, services: b.services,
    staff: b.staff, staffName: staff ? staff.name : b.staff,
    name: b.name, phone: b.phone, email: b.email, note: b.note,
    canCancel: b.status === 'confirmed' && minutesUntil(b.date, b.time) >= RULES.cancelNoticeHours * 60,
  };
}

/* ----------------------------------------------------------------- blocks */

async function createBlock({ date, staff, start, end, reason }) {
  if (!isValidDate(date) || !TIME_RE.test(start) || !TIME_RE.test(end) || toMin(end) <= toMin(start)) {
    throw new UserError('Plage invalide.');
  }
  const targets = staff === 'all' ? STAFF.map((s) => s.id) : [staff];
  if (targets.some((t) => !STAFF.some((s) => s.id === t))) throw new UserError('Fauteuil inconnu.');
  const id = 'BL-' + crypto.randomBytes(4).toString('hex');
  const locks = [];
  const s0 = Math.floor(toMin(start) / STEP) * STEP;
  for (const t of targets) {
    for (let m = s0; m < toMin(end); m += STEP) {
      const p = `locks/${date}/${t}/${key(m)}.json`;
      try {
        await store.put(p, { block: id }, { overwrite: false });
        locks.push(p);
      } catch (err) {
        if (!(err instanceof ConflictError)) throw err; // déjà occupé : on laisse
      }
    }
  }
  const block = { id, date, staff, start, end, reason: String(reason || '').slice(0, 120), locks, createdAt: new Date().toISOString() };
  await store.put(`blocks/${date}/${id}.json`, block);
  return block;
}

async function deleteBlock(date, id) {
  const p = `blocks/${date}/${id}.json`;
  const block = await store.get(p);
  if (!block) return false;
  await store.del(block.locks || []);
  await store.del(p);
  return true;
}

/* ------------------------------------------------------------------ email */

function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function frDate(date) {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(date + 'T12:00:00Z'));
}

async function sendMail(to, subject, html) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from || !to) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    return res.ok;
  } catch (_) {
    return false;
  }
}

function mailTemplate(title, body) {
  return `<div style="font-family:Arial,sans-serif;background:#1c1512;padding:24px">
  <div style="max-width:520px;margin:auto;background:#f3e6c9;border-radius:12px;overflow:hidden">
    <div style="background:#0f2f5c;color:#f3e6c9;padding:18px 24px;border-bottom:6px solid #d6262c">
      <div style="font-size:22px;font-weight:bold;letter-spacing:2px">CF COIFFURE</div>
      <div style="font-size:13px;opacity:.8">${escapeHtml(SALON.city)}</div>
    </div>
    <div style="padding:24px;color:#1c1512;font-size:15px;line-height:1.5">
      <h2 style="margin:0 0 12px;color:#9b3b2a">${escapeHtml(title)}</h2>${body}
    </div>
  </div></div>`;
}

function bookingSummaryHtml(b) {
  const staff = STAFF.find((s) => s.id === b.staff);
  return `<p><strong>${escapeHtml(frDate(b.date))}</strong> à <strong>${escapeHtml(b.time)}</strong> (${b.duration} min)<br>
  ${b.services.map((s) => escapeHtml(s.name)).join(' + ')}<br>
  ${staff ? escapeHtml(staff.name) + '<br>' : ''}Total indicatif : ${b.price} €<br>Code : <strong>${escapeHtml(b.id)}</strong></p>`;
}

function siteUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

async function notifyCreated(b, req) {
  const link = `${siteUrl(req)}/rdv.html?id=${encodeURIComponent(b.id)}&t=${encodeURIComponent(b.token)}`;
  const tasks = [];
  if (b.email) {
    tasks.push(sendMail(b.email, `Rendez-vous confirmé — ${frDate(b.date)} à ${b.time}`, mailTemplate('C’est noté, à bientôt !',
      `<p>Bonjour ${escapeHtml(b.name)},</p>${bookingSummaryHtml(b)}
       <p>Adresse : ${escapeHtml(SALON.address)}</p>
       <p><a href="${link}" style="display:inline-block;background:#d6262c;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Gérer mon rendez-vous</a></p>`)));
  }
  if (process.env.SALON_EMAIL) {
    tasks.push(sendMail(process.env.SALON_EMAIL, `Nouveau RDV ${b.date} ${b.time} — ${b.name}`, mailTemplate('Nouveau rendez-vous',
      `${bookingSummaryHtml(b)}<p>${escapeHtml(b.name)} — ${escapeHtml(b.phone)} ${b.email ? '— ' + escapeHtml(b.email) : ''}</p>
       ${b.note ? `<p>Note : ${escapeHtml(b.note)}</p>` : ''}`)));
  }
  await Promise.all(tasks);
}

async function notifyCancelled(b) {
  const tasks = [];
  if (b.email) tasks.push(sendMail(b.email, `Rendez-vous annulé — ${frDate(b.date)} à ${b.time}`, mailTemplate('Rendez-vous annulé', bookingSummaryHtml(b))));
  if (process.env.SALON_EMAIL) tasks.push(sendMail(process.env.SALON_EMAIL, `Annulation ${b.date} ${b.time} — ${b.name}`, mailTemplate('Annulation', bookingSummaryHtml(b))));
  await Promise.all(tasks);
}

/* ------------------------------------------------------------------- http */

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (raw.length > 20000) throw new UserError('Requête trop volumineuse.');
  return raw ? JSON.parse(raw) : {};
}

function query(req) {
  return new URL(req.url, 'http://x').searchParams;
}

function isAdmin(req) {
  const expected = process.env.ADMIN_PASSWORD;
  const got = req.headers['x-admin-key'];
  return Boolean(expected && got && safeEqual(got, expected));
}

function clean(v, max) {
  return typeof v === 'string' ? v.replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, max) : '';
}

/** Valide les coordonnées client ; renvoie un message d'erreur ou null. */
function validateContact(c) {
  if (c.name.length < 2) return 'Merci d’indiquer votre nom.';
  if (!/^[+0-9 ().-]{8,20}$/.test(c.phone) || c.phone.replace(/\D/g, '').length < 9) return 'Numéro de téléphone invalide.';
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email)) return 'Adresse e-mail invalide.';
  return null;
}

module.exports = {
  SALON, STEP, RULES, HOURS, STAFF, SERVICES,
  store, ConflictError, UserError, availability, createBooking, cancelBooking, findBooking, saveBooking, publicBooking,
  createBlock, deleteBlock, resolveServices, notifyCreated, notifyCancelled,
  parisNow, addDays, isValidDate, minutesUntil, send, readBody, query, isAdmin, safeEqual, clean, validateContact,
  TIME_RE,
};
