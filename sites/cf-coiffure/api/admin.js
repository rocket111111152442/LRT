'use strict';

const {
  STAFF, loadDay, createBooking, cancelBooking, updateBooking, createBlock, deleteBlock,
  ConflictError, UserError, isAdmin, isValidDate, addDays, readBody, query, send, clean, validateContact,
} = require('./_lib');

const STATUSES = ['confirmed', 'done', 'noshow'];

function strip(b) {
  const { token, ...rest } = b; // eslint-disable-line no-unused-vars
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
      const loaded = await Promise.all(Array.from({ length: days }, (_, i) => loadDay(addDays(from, i))));
      const bookings = loaded.flatMap(({ day }) => day.bookings).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      const blocks = loaded.flatMap(({ day }) => day.blocks);
      return send(res, 200, { staff: STAFF, bookings: bookings.map(strip), blocks });
    }

    if (req.method !== 'POST') return send(res, 405, { error: 'Méthode non autorisée.' });
    const body = await readBody(req);
    const id = String(body.id || '');

    switch (body.action) {
      case 'create': {
        const contact = { name: clean(body.name, 80), phone: clean(body.phone, 20), note: clean(body.note, 400) };
        if (!contact.phone) contact.phone = '0000000000';
        const invalid = validateContact(contact);
        if (invalid) return send(res, 400, { error: invalid });
        const b = await createBooking({
          date: body.date, time: body.time, staff: body.staff, duration: body.duration, label: body.label, ...contact, source: 'salon',
        });
        return send(res, 201, { booking: strip(b) });
      }
      case 'cancel': {
        const b = await cancelBooking(id, 'le salon');
        return b ? send(res, 200, { booking: strip(b) }) : send(res, 404, { error: 'Introuvable.' });
      }
      case 'status': {
        if (!STATUSES.includes(body.status)) return send(res, 400, { error: 'Statut invalide.' });
        const b = await updateBooking(id, (x) => {
          if (x.status === 'cancelled') throw new UserError('Ce rendez-vous est annulé.');
          x.status = body.status;
          x.history.push({ at: new Date().toISOString(), what: 'statut → ' + body.status });
        });
        return b ? send(res, 200, { booking: strip(b) }) : send(res, 404, { error: 'Introuvable.' });
      }
      case 'note': {
        const b = await updateBooking(id, (x) => { x.salonNote = clean(body.salonNote, 400); });
        return b ? send(res, 200, { booking: strip(b) }) : send(res, 404, { error: 'Introuvable.' });
      }
      case 'block': {
        const staff = body.staff === 'all' ? 'all' : String(body.staff || '');
        const block = await createBlock({ date: body.date, staff, start: body.start, end: body.end, reason: body.reason });
        return send(res, 201, { block });
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
