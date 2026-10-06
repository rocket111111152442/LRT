'use strict';

const {
  createBooking, findBooking, cancelBooking, publicBooking, notifyCreated, safeEqual,
  ConflictError, UserError, readBody, send, clean, validateContact,
} = require('./_lib');

/**
 * POST /api/book — réservation client.
 * Corps : { services[], staff, date, time, name, phone, email?, note?, website (piège à robots),
 *           replace?: { id, token } pour déplacer un rendez-vous existant }
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Méthode non autorisée.' });
  let body;
  try { body = await readBody(req); } catch (_) { return send(res, 400, { error: 'Requête invalide.' }); }

  if (body.website) return send(res, 400, { error: 'Requête refusée.' });
  if (body.consent !== true) return send(res, 400, { error: 'Merci d’accepter l’utilisation de vos données pour ce rendez-vous.' });

  const contact = {
    name: clean(body.name, 80),
    phone: clean(body.phone, 20),
    email: clean(body.email, 160).toLowerCase(),
    note: clean(body.note, 400),
  };
  const invalid = validateContact(contact);
  if (invalid) return send(res, 400, { error: invalid });

  // Déplacement : l'ancien rendez-vous doit exister et le jeton correspondre.
  let previous = null;
  if (body.replace && body.replace.id) {
    previous = await findBooking(String(body.replace.id));
    if (!previous || !safeEqual(previous.token, String(body.replace.token || '')) || previous.status !== 'confirmed') {
      return send(res, 403, { error: 'Rendez-vous à déplacer introuvable.' });
    }
  }

  try {
    const b = await createBooking({
      services: body.services, staff: body.staff, date: body.date, time: body.time, ...contact, source: 'web',
    });
    if (previous) {
      await cancelBooking(previous, 'client (déplacé vers ' + b.id + ')');
      b.history.push({ at: new Date().toISOString(), what: 'remplace ' + previous.id });
    }
    await notifyCreated(b, req);
    send(res, 201, { booking: publicBooking(b), token: b.token });
  } catch (err) {
    if (err instanceof ConflictError) return send(res, 409, { error: 'Oups, ce créneau vient d’être réservé. Choisissez-en un autre.' });
    if (err instanceof UserError) return send(res, 400, { error: err.message });
    console.error(err);
    send(res, 500, { error: 'La réservation a échoué, réessayez ou appelez le salon.' });
  }
};
