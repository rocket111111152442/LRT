'use strict';

const {
  createBooking, publicBooking, notifyCreated, ConflictError, UserError, readBody, send, clean, validateContact,
} = require('./_lib');

/**
 * POST /api/book — réservation client.
 * Corps : { date, time, name, phone, website (piège à robots, doit rester vide) }
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Méthode non autorisée.' });
  let body;
  try { body = await readBody(req); } catch (_) { return send(res, 400, { error: 'Requête invalide.' }); }
  if (body.website) return send(res, 400, { error: 'Requête refusée.' });

  const contact = { name: clean(body.name, 80), phone: clean(body.phone, 20) };
  const invalid = validateContact(contact);
  if (invalid) return send(res, 400, { error: invalid });

  try {
    const b = await createBooking({ date: body.date, time: body.time, ...contact, source: 'web' });
    await notifyCreated(b);
    send(res, 201, { booking: publicBooking(b), token: b.token });
  } catch (err) {
    if (err instanceof ConflictError) return send(res, 409, { error: 'Ce créneau vient d’être pris. Choisissez-en un autre.' });
    if (err instanceof UserError) return send(res, 400, { error: err.message });
    console.error(err);
    send(res, 500, { error: 'La réservation a échoué. Réessayez ou passez au salon.' });
  }
};
