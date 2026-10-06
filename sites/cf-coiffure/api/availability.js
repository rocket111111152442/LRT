'use strict';

const { availability, resolveServices, isValidDate, query, send } = require('./_lib');

/** GET /api/availability?date=YYYY-MM-DD&services=a,b&staff=any|id */
module.exports = async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Méthode non autorisée.' });
  const q = query(req);
  const date = q.get('date') || '';
  const svc = resolveServices((q.get('services') || '').split(',').filter(Boolean));
  if (!isValidDate(date) || !svc) return send(res, 400, { error: 'Paramètres invalides.' });
  try {
    const slots = await availability(date, svc.duration, q.get('staff') || 'any');
    send(res, 200, { date, duration: svc.duration, slots });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: 'Impossible de charger les disponibilités.' });
  }
};
