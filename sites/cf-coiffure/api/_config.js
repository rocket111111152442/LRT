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
  address: '273 avenue Joseph Raynaud, 83140 Six-Fours-les-Plages',
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

// Grille tarifaire affichée sur le site (page Tarifs et aperçu sur l'accueil).
// ⚠ PRIX PROVISOIRES : moyennes du secteur dans le Var, à remplacer par les tarifs réels du salon.
// `from: true` affiche « dès » devant le prix.
const PRICES = [
  { cat: 'Femme', note: 'Shampoing, soin et coiffage compris.', items: [
    { name: 'Coupe et brushing — cheveux courts', price: 35 },
    { name: 'Coupe et brushing — cheveux mi-longs', price: 42 },
    { name: 'Coupe et brushing — cheveux longs', price: 49 },
    { name: 'Shampoing et brushing — courts', price: 22 },
    { name: 'Shampoing et brushing — mi-longs / longs', price: 28 },
    { name: 'Coupe seule, sans brushing', price: 25 },
  ] },
  { cat: 'Homme', note: 'Shampoing compris.', items: [
    { name: 'Coupe homme', price: 20 },
    { name: 'Dégradé / fade', price: 23 },
    { name: 'Coupe et barbe', price: 30 },
    { name: 'Taille de barbe et contours', price: 12 },
  ] },
  { cat: 'Enfant', note: '', items: [
    { name: 'Coupe enfant (moins de 10 ans)', price: 13 },
    { name: 'Coupe junior (10 à 15 ans)', price: 16 },
  ] },
  { cat: 'Couleur', note: 'Prix selon la longueur et l’épaisseur des cheveux.', items: [
    { name: 'Couleur racines', price: 39, from: true },
    { name: 'Coloration complète', price: 49, from: true },
    { name: 'Mèches / balayage', price: 65, from: true },
    { name: 'Patine / gloss', price: 20 },
  ] },
  { cat: 'Soins et coiffage', note: '', items: [
    { name: 'Soin profond', price: 10 },
    { name: 'Chignon / coiffure d’événement', price: 40, from: true },
  ] },
];

module.exports = { SALON, STEP, BOOKING, RULES, HOURS, STAFF, PRICES };
