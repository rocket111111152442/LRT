'use strict';

const { availability, BOOKING, isValidDate, query, send } = require('./_lib');

/** GET /api/availability?date=YYYY-MM-DD — créneaux libres du jour. */
module.exports = async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Méthode non autorisée.' });
  const date = query(req).get('date') || '';
  if (!isValidDate(date)) return send(res, 400, { error: 'Date invalide.' });
  try {
    send(res, 200, { date, duration: BOOKING.duration, slots: await availability(date) });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: 'Impossible de charger les disponibilités.' });
  }
};
