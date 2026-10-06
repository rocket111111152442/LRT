/**
 * Moteur de réservation partagé par les fonctions serverless.
 *
 * Stockage : Vercel Blob en accès privé (BLOB_READ_WRITE_TOKEN, injectée par Vercel quand
 * le store est relié au projet). En local, sans jeton, les données vont dans .data/.
 *
 * Un seul document par jour, `days/{date}.json` = { bookings: [...], blocks: [...] },
 * plus un pointeur `ids/{code}.json` = { date } pour retrouver un rendez-vous par son code.
 * Chaque écriture d'un jour est conditionnée à sa version (ETag) : si deux clients réservent
 * au même moment, le second relit le jour, voit le créneau pris et reçoit un refus propre.
 * Ce schéma limite le nombre d'opérations Blob (quota du plan gratuit).
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { SALON, STEP, BOOKING, RULES, HOURS, STAFF, SERVICES } = require('./_config');

class ConflictError extends Error {}
/** Erreur de saisie, dont le message peut être montré tel quel au visiteur. */
class UserError extends Error {}
/** La version du document a changé entre la lecture et l'écriture. */
class StaleError extends Error {}

/* ------------------------------------------------------------------ store */

const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const blob = useBlob ? require('@vercel/blob') : null;
const LOCAL_DIR = path.join(process.cwd(), '.data');

const store = {
  /** @returns {Promise<{ data: object, etag: string } | null>} */
  async get(pathname) {
    if (useBlob) {
      const res = await blob.get(pathname, { access: 'private', useCache: false });
      if (!res || res.statusCode !== 200 || !res.stream) return null;
      const text = await new Response(res.stream).text();
      return { data: JSON.parse(text), etag: res.blob.etag };
    }
    const file = path.join(LOCAL_DIR, pathname);
    if (!fs.existsSync(file)) return null;
    const text = fs.readFileSync(file, 'utf8');
    return { data: JSON.parse(text), etag: crypto.createHash('md5').update(text).digest('hex') };
  },

  /**
   * Écrit un document. `etag` : n'écrire que si la version n'a pas changé ;
   * `create` : n'écrire que si le document n'existe pas encore. Lève StaleError sinon.
   */
  async put(pathname, data, { etag, create } = {}) {
    const body = JSON.stringify(data);
    if (useBlob) {
      try {
        await blob.put(pathname, body, {
          access: 'private', addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 60,
          allowOverwrite: !create, ...(etag ? { ifMatch: etag } : {}),
        });
      } catch (err) {
        const msg = String(err && err.message);
        if (/precondition|already exists/i.test(msg) || (err && err.name === 'BlobPreconditionFailedError')) throw new StaleError(pathname);
        throw err;
      }
      return;
    }
    const file = path.join(LOCAL_DIR, pathname);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (create && fs.existsSync(file)) throw new StaleError(pathname);
    if (etag) {
      const cur = fs.existsSync(file) ? crypto.createHash('md5').update(fs.readFileSync(file, 'utf8')).digest('hex') : null;
      if (cur !== etag) throw new StaleError(pathname);
    }
    fs.writeFileSync(file, body);
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

/** Minutes restantes avant un rendez-vous (négatif s'il est passé). */
function minutesUntil(date, time) {
  const now = parisNow();
  return daysBetween(now.date, date) * 1440 + toMin(time) - now.minutes;
}

/* -------------------------------------------------------------------- day */

const dayPath = (date) => `days/${date}.json`;

async function loadDay(date) {
  const got = await store.get(dayPath(date));
  return got ? { day: got.data, etag: got.etag } : { day: { bookings: [], blocks: [] }, etag: null };
}

/**
 * Lit le jour, applique `fn(day)` puis réécrit à condition que personne n'ait écrit entre-temps ;
 * recommence sinon (jusqu'à 5 fois). Renvoie ce que renvoie `fn`.
 */
async function updateDay(date, fn) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { day, etag } = await loadDay(date);
    const result = await fn(day);
    try {
      await store.put(dayPath(date), day, etag ? { etag } : { create: true });
      return result;
    } catch (err) {
      if (!(err instanceof StaleError)) throw err;
      await new Promise((r) => setTimeout(r, 40 + Math.random() * 120));
    }
  }
  throw new ConflictError('busy');
}

/** Intervalles occupés [début, fin[ en minutes pour un poste. */
function busy(day, staff) {
  const out = [];
  day.bookings.forEach((b) => { if (b.staff === staff && b.status !== 'cancelled') out.push([toMin(b.time), toMin(b.end)]); });
  day.blocks.forEach((k) => { if (k.staff === staff || k.staff === 'all') out.push([toMin(k.start), toMin(k.end)]); });
  return out;
}
function isFree(day, staff, start, end) {
  return busy(day, staff).every(([a, b]) => end <= a || start >= b);
}

/* ----------------------------------------------------------- availability */

function dayIsBookable(date) {
  const diff = daysBetween(parisNow().date, date);
  return diff >= 0 && diff <= RULES.maxDaysAhead && (HOURS[weekday(date)] || []).length > 0;
}

/** Heures de début proposées en ligne : grille de `BOOKING.duration` depuis chaque ouverture. */
function gridStarts(date) {
  const out = [];
  for (const [open, close] of HOURS[weekday(date)] || []) {
    for (let t = toMin(open); t + BOOKING.duration <= toMin(close); t += BOOKING.duration) out.push(t);
  }
  return out;
}

/** Créneaux libres du jour (heures 'HH:MM'). */
async function availability(date) {
  if (!dayIsBookable(date)) return [];
  const { day } = await loadDay(date);
  const now = parisNow();
  const earliest = date === now.date ? now.minutes + RULES.minNoticeMinutes : -1;
  return gridStarts(date)
    .filter((t) => t >= earliest && STAFF.some((s) => isFree(day, s.id, t, t + BOOKING.duration)))
    .map(toHHMM);
}

/* --------------------------------------------------------------- bookings */

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newCode() {
  let s = '';
  for (const b of crypto.randomBytes(6)) s += CODE_CHARS[b % CODE_CHARS.length];
  return 'CF-' + s;
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
  const { day } = await loadDay(ref.data.date);
  return day.bookings.find((b) => b.id === id) || null;
}

/** Modifie un rendez-vous existant via `fn(booking)`. */
async function updateBooking(id, fn) {
  const ref = await store.get(`ids/${id}.json`);
  if (!ref) return null;
  return updateDay(ref.data.date, (day) => {
    const b = day.bookings.find((x) => x.id === id);
    if (!b) return null;
    fn(b);
    b.updatedAt = new Date().toISOString();
    return b;
  });
}

/**
 * Crée un rendez-vous. Lève ConflictError si le créneau n'est plus libre.
 * @param input { date, time, name, phone, note?, staff?, duration?, label?, source }
 */
async function createBooking(input) {
  const { date, time } = input;
  const isAdmin = input.source === 'salon';
  if (!isValidDate(date) || !TIME_RE.test(time) || toMin(time) % STEP) throw new UserError('Date ou heure invalide.');

  let duration = BOOKING.duration;
  if (isAdmin && input.duration) {
    duration = Number(input.duration);
    if (!Number.isInteger(duration) || duration < STEP || duration > 300 || duration % STEP) throw new UserError('Durée invalide.');
  }
  const start = toMin(time);
  const end = start + duration;
  if (end > 24 * 60) throw new UserError('Heure invalide.');

  if (!isAdmin) {
    if (!dayIsBookable(date)) throw new UserError('Ce jour n’est pas réservable.');
    if (!gridStarts(date).includes(start)) throw new UserError('Créneau hors des horaires d’ouverture.');
    if (minutesUntil(date, time) < RULES.minNoticeMinutes) throw new UserError('Ce créneau est trop proche.');
  }
  if (input.staff && input.staff !== 'any' && !STAFF.some((s) => s.id === input.staff)) throw new UserError('Poste inconnu.');

  const now = new Date().toISOString();
  const booking = await updateDay(date, (day) => {
    const wanted = input.staff && input.staff !== 'any' ? [input.staff] : STAFF.map((s) => s.id);
    const load = (id) => busy(day, id).reduce((n, [a, b]) => n + b - a, 0);
    const staff = wanted.filter((id) => isFree(day, id, start, end)).sort((a, b) => load(a) - load(b))[0];
    if (!staff) throw new ConflictError('slot');
    const b = {
      id: newCode(),
      token: crypto.randomBytes(24).toString('base64url'),
      status: 'confirmed',
      date, time, end: toHHMM(end), duration,
      label: clean(input.label, 80) || BOOKING.label,
      staff,
      name: input.name, phone: input.phone, note: input.note || '',
      source: input.source || 'web',
      createdAt: now, updatedAt: now,
      history: [{ at: now, what: 'créé (' + (input.source || 'web') + ')' }],
    };
    day.bookings.push(b);
    return b;
  });
  await store.put(`ids/${booking.id}.json`, { date });
  return booking;
}

async function cancelBooking(id, by) {
  return updateBooking(id, (b) => {
    if (b.status === 'cancelled') return;
    b.status = 'cancelled';
    b.history.push({ at: new Date().toISOString(), what: 'annulé par ' + by });
  });
}

/** Version publique (sans jeton). */
function publicBooking(b) {
  return {
    id: b.id, status: b.status, date: b.date, time: b.time, end: b.end, duration: b.duration, label: b.label,
    name: b.name, phone: b.phone,
    canCancel: b.status === 'confirmed' && minutesUntil(b.date, b.time) >= RULES.cancelNoticeHours * 60,
  };
}

/* ----------------------------------------------------------------- blocks */

async function createBlock({ date, staff, start, end, reason }) {
  if (!isValidDate(date) || !TIME_RE.test(start) || !TIME_RE.test(end) || toMin(end) <= toMin(start)) {
    throw new UserError('Plage invalide.');
  }
  if (staff !== 'all' && !STAFF.some((s) => s.id === staff)) throw new UserError('Poste inconnu.');
  const block = { id: 'BL-' + crypto.randomBytes(4).toString('hex'), date, staff, start, end, reason: clean(reason, 120), createdAt: new Date().toISOString() };
  await updateDay(date, (day) => { day.blocks.push(block); });
  return block;
}

async function deleteBlock(date, id) {
  if (!isValidDate(date)) return false;
  return updateDay(date, (day) => {
    const n = day.blocks.length;
    day.blocks = day.blocks.filter((k) => k.id !== id);
    return day.blocks.length !== n;
  });
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
  return `<p><strong>${escapeHtml(frDate(b.date))}</strong> à <strong>${escapeHtml(b.time)}</strong> (${b.duration} min)<br>
  ${escapeHtml(b.name)} — ${escapeHtml(b.phone)}<br>Code : ${escapeHtml(b.id)}</p>`;
}


/** Prévient le salon par e-mail (si Resend et SALON_EMAIL sont configurés). */
async function notifyCreated(b) {
  if (!process.env.SALON_EMAIL) return;
  await sendMail(process.env.SALON_EMAIL, `Nouveau RDV ${b.date} ${b.time} — ${b.name}`, mailTemplate('Nouveau rendez-vous', bookingSummaryHtml(b)));
}

async function notifyCancelled(b) {
  if (!process.env.SALON_EMAIL) return;
  await sendMail(process.env.SALON_EMAIL, `Annulation ${b.date} ${b.time} — ${b.name}`, mailTemplate('Rendez-vous annulé', bookingSummaryHtml(b)));
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
  return null;
}

module.exports = {
  SALON, STEP, BOOKING, RULES, HOURS, STAFF, SERVICES,
  ConflictError, UserError, availability, loadDay, createBooking, cancelBooking, findBooking, updateBooking, publicBooking,
  createBlock, deleteBlock, notifyCreated, notifyCancelled,
  parisNow, addDays, isValidDate, send, readBody, query, isAdmin, safeEqual, clean, validateContact,
};
