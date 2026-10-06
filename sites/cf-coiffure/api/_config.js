/**
 * Configuration du salon — seul fichier à modifier pour changer horaires,
 * durée des créneaux, postes ou liste des prestations. Le front la récupère via /api/config.
 *
 * ⚠ Les horaires, la durée d'un créneau et le nombre de postes ci-dessous sont des valeurs
 *   de départ à faire valider par le salon (voir README).
 */

'use strict';

const SALON = {
  name: 'CF Coiffure',
  city: 'Six-Fours-les-Plages',
  address: 'Imm. Le Beaugency, La Planche, 83140 Six-Fours-les-Plages',
  phone: '', // à compléter, ex. '04 94 00 00 00'
  timezone: 'Europe/Paris',
};

// Précision des horaires, en minutes (heures de début et durées en sont des multiples).
const STEP = 5;

// Réservation en ligne : le client choisit seulement le jour et l'heure.
// Chaque rendez-vous dure `duration` minutes ; les créneaux proposés s'enchaînent depuis
// l'heure d'ouverture (9h00, 9h35, 10h10…). Le salon peut saisir d'autres durées dans l'admin.
const BOOKING = { duration: 35, label: 'Rendez-vous coiffure' };

// Règles de réservation en ligne.
const RULES = {
  minNoticeMinutes: 60,   // délai minimum avant un rendez-vous
  maxDaysAhead: 60,       // horizon de réservation
  cancelNoticeHours: 2,   // annulation en ligne possible jusqu'à N heures avant
};

// Horaires d'ouverture par jour (0 = dimanche). Plusieurs plages possibles par jour.
const HOURS = {
  0: [],
  1: [],
  2: [['09:00', '19:00']],
  3: [['09:00', '19:00']],
  4: [['09:00', '19:00']],
  5: [['09:00', '19:00']],
  6: [['09:00', '18:00']],
};

// Postes de travail. Avec un seul poste, un seul client par créneau.
// Si deux personnes coiffent en même temps, ajouter un second poste : deux clients par créneau.
const STAFF = [
  { id: 'salon', name: 'Salon', color: '#c8312b' },
];

// Prestations affichées sur la page d'accueil (sans prix : tarifs au salon).
const SERVICES = [
  { cat: 'Femme', items: ['Coupe et brushing', 'Brushing', 'Coupes courtes'] },
  { cat: 'Homme', items: ['Coupe', 'Dégradé', 'Barbe'] },
  { cat: 'Enfant', items: ['Coupe enfant'] },
  { cat: 'Couleur', items: ['Coloration', 'Racines', 'Mèches et balayage'] },
];

module.exports = { SALON, STEP, BOOKING, RULES, HOURS, STAFF, SERVICES };
