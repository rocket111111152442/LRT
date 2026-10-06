'use strict';

const { SALON, STEP, RULES, HOURS, STAFF, SERVICES, parisNow, send } = require('./_lib');

/** GET /api/config — prestations, équipe, horaires et règles (données publiques). */
module.exports = (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Méthode non autorisée.' });
  send(res, 200, { salon: SALON, step: STEP, rules: RULES, hours: HOURS, staff: STAFF, services: SERVICES, today: parisNow().date });
};
