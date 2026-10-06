'use strict';

const { findBooking, cancelBooking, publicBooking, notifyCancelled, safeEqual, query, readBody, send, RULES } = require('./_lib');

async function load(id, token) {
  const b = await findBooking(String(id || ''));
  if (!b || !safeEqual(b.token, String(token || ''))) return null;
  return b;
}

/**
 * GET  /api/booking?id=CF-XXXXXX&t=jeton            consulter son rendez-vous
 * POST /api/booking { id, token, action: 'cancel' }  l'annuler
 */
module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const q = query(req);
      const b = await load(q.get('id'), q.get('t'));
      if (!b) return send(res, 404, { error: 'Rendez-vous introuvable. Vérifiez le lien.' });
      return send(res, 200, { booking: publicBooking(b) });
    }
    if (req.method === 'POST') {
      const body = await readBody(req);
      const b = await load(body.id, body.token);
      if (!b) return send(res, 404, { error: 'Rendez-vous introuvable.' });
      if (body.action !== 'cancel') return send(res, 400, { error: 'Action inconnue.' });
      if (!publicBooking(b).canCancel) {
        return send(res, 409, { error: `L’annulation en ligne n’est plus possible à moins de ${RULES.cancelNoticeHours} h du rendez-vous. Prévenez directement le salon.` });
      }
      const updated = await cancelBooking(b.id, 'le client');
      await notifyCancelled(updated);
      return send(res, 200, { booking: publicBooking(updated) });
    }
    send(res, 405, { error: 'Méthode non autorisée.' });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: 'Erreur serveur.' });
  }
};
