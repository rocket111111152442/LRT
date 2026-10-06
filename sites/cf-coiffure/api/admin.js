'use strict';

const {
  store, STAFF, createBooking, cancelBooking, findBooking, saveBooking, createBlock, deleteBlock, notifyCancelled,
  ConflictError, UserError, isAdmin, isValidDate, addDays, readBody, query, send, clean, validateContact,
} = require('./_lib');

const STATUSES = ['confirmed', 'done', 'noshow'];

async function readAll(prefix) {
  const paths = await store.list(prefix);
  const items = await Promise.all(paths.map((p) => store.get(p).catch(() => null)));
  return items.filter(Boolean);
}

function strip(b) {
  const { token, locks, ...rest } = b; // eslint-disable-line no-unused-vars
  return rest;
}

/**
 * Espace salon, protégé par l'en-tête x-admin-key (= ADMIN_PASSWORD).
 * GET  /api/admin?from=YYYY-MM-DD&days=N     rendez-vous et indisponibilités
 * POST /api/admin { action, ... }             create | cancel | status | note | block | unblock
 */
module.exports = async (req, res) => {
  if (!process.env.ADMIN_PASSWORD) return send(res, 503, { error: 'ADMIN_PASSWORD n’est pas configuré sur le serveur.' });
  if (!isAdmin(req)) {
    await new Promise((r) => setTimeout(r, 400)); // freine les essais de mot de passe
    return send(res, 401, { error: 'Mot de passe incorrect.' });
  }

  try {
    if (req.method === 'GET') {
      const q = query(req);
      const from = q.get('from');
      const days = Math.min(Math.max(Number(q.get('days')) || 1, 1), 31);
      if (!isValidDate(from || '')) return send(res, 400, { error: 'Date invalide.' });
      const dates = Array.from({ length: days }, (_, i) => addDays(from, i));
      const [bookings, blocks] = await Promise.all([
        Promise.all(dates.map((d) => readAll(`bookings/${d}/`))).then((x) => x.flat()),
        Promise.all(dates.map((d) => readAll(`blocks/${d}/`))).then((x) => x.flat()),
      ]);
      bookings.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      return send(res, 200, { staff: STAFF, bookings: bookings.map(strip), blocks: blocks.map(({ locks, ...b }) => b) }); // eslint-disable-line no-unused-vars
    }

    if (req.method !== 'POST') return send(res, 405, { error: 'Méthode non autorisée.' });
    const body = await readBody(req);

    switch (body.action) {
      case 'create': {
        const contact = { name: clean(body.name, 80), phone: clean(body.phone, 20), email: clean(body.email, 160).toLowerCase(), note: clean(body.note, 400) };
        if (!contact.phone) contact.phone = '0000000000';
        const invalid = validateContact(contact);
        if (invalid) return send(res, 400, { error: invalid });
        const b = await createBooking({ services: body.services, staff: body.staff, date: body.date, time: body.time, ...contact, source: 'salon' });
        return send(res, 201, { booking: strip(b) });
      }
      case 'cancel': {
        const b = await findBooking(body.id);
        if (!b) return send(res, 404, { error: 'Introuvable.' });
        await cancelBooking(b, 'le salon');
        if (body.notify) await notifyCancelled(b);
        return send(res, 200, { booking: strip(b) });
      }
      case 'status': {
        const b = await findBooking(body.id);
        if (!b) return send(res, 404, { error: 'Introuvable.' });
        if (!STATUSES.includes(body.status) || b.status === 'cancelled') return send(res, 400, { error: 'Statut invalide.' });
        b.status = body.status;
        b.history.push({ at: new Date().toISOString(), what: 'statut → ' + body.status });
        await saveBooking(b);
        return send(res, 200, { booking: strip(b) });
      }
      case 'note': {
        const b = await findBooking(body.id);
        if (!b) return send(res, 404, { error: 'Introuvable.' });
        b.salonNote = clean(body.salonNote, 400);
        await saveBooking(b);
        return send(res, 200, { booking: strip(b) });
      }
      case 'block': {
        const staff = body.staff === 'all' ? 'all' : String(body.staff || '');
        const block = await createBlock({ date: body.date, staff, start: body.start, end: body.end, reason: body.reason });
        const { locks, ...rest } = block; // eslint-disable-line no-unused-vars
        return send(res, 201, { block: rest });
      }
      case 'unblock': {
        const ok = await deleteBlock(String(body.date || ''), String(body.id || ''));
        return send(res, ok ? 200 : 404, ok ? { ok } : { error: 'Introuvable.' });
      }
      default:
        return send(res, 400, { error: 'Action inconnue.' });
    }
  } catch (err) {
    if (err instanceof ConflictError) return send(res, 409, { error: 'Ce créneau est déjà occupé.' });
    if (err instanceof UserError) return send(res, 400, { error: err.message });
    console.error(err);
    send(res, 500, { error: 'Erreur serveur.' });
  }
};
