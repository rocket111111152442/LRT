/**
 * Configuration du salon — seul fichier à modifier pour changer prestations,
 * tarifs, horaires ou équipe. Le front la récupère via /api/config.
 *
 * ⚠ Les tarifs, durées, horaires et noms de fauteuils ci-dessous sont des valeurs
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

// Pas de la grille de réservation, en minutes. Toutes les durées en sont des multiples.
const STEP = 15;

// Règles de réservation en ligne.
const RULES = {
  minNoticeMinutes: 60,   // délai minimum avant un rendez-vous
  maxDaysAhead: 60,       // horizon de réservation
  cancelNoticeHours: 2,   // annulation en ligne possible jusqu'à N heures avant
  maxServices: 4,
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

const STAFF = [
  { id: 'route66', name: 'Fauteuil Route 66', tagline: 'Coupes, couleurs & mèches', color: '#d6262c' },
  { id: 'miami', name: 'Fauteuil Miami', tagline: 'Coupes courtes, dégradés & barbe', color: '#3d8fd1' },
];

const SERVICES = [
  { id: 'coupe-homme', cat: 'Homme', name: 'Coupe homme', duration: 30, price: 20, desc: 'Shampoing, coupe ciseaux ou tondeuse, coiffage.' },
  { id: 'degrade', cat: 'Homme', name: 'Dégradé / Fade', duration: 45, price: 25, desc: 'Dégradé américain travaillé à la tondeuse et au rasoir.' },
  { id: 'coupe-barbe', cat: 'Homme', name: 'Coupe + barbe', duration: 45, price: 30, desc: 'La totale : coupe, taille de barbe et contours.' },
  { id: 'barbe', cat: 'Homme', name: 'Taille de barbe', duration: 15, price: 12, desc: 'Taille, contours au rasoir, huile.' },
  { id: 'enfant', cat: 'Enfant', name: 'Coupe enfant (-12 ans)', duration: 30, price: 15, desc: 'Pour les petits rebelles.' },
  { id: 'coupe-courte', cat: 'Femme', name: 'Coupe & brushing — courts', duration: 45, price: 38, desc: 'Shampoing, soin, coupe, brushing. La spécialité de la maison.' },
  { id: 'coupe-longue', cat: 'Femme', name: 'Coupe & brushing — mi-longs / longs', duration: 60, price: 48, desc: 'Shampoing, soin, coupe, brushing.' },
  { id: 'brushing', cat: 'Femme', name: 'Shampoing & brushing', duration: 30, price: 25, desc: 'Mise en forme lisse ou wavy.' },
  { id: 'racines', cat: 'Couleur', name: 'Couleur racines', duration: 60, price: 40, desc: 'Application racines, temps de pose, shampoing.' },
  { id: 'couleur', cat: 'Couleur', name: 'Coloration complète', duration: 90, price: 58, desc: 'Couleur racines + longueurs, soin.' },
  { id: 'meches', cat: 'Couleur', name: 'Mèches / balayage', duration: 120, price: 80, desc: 'Éclaircissement sur mesure, patine incluse.' },
  { id: 'soin', cat: 'Soin', name: 'Soin profond', duration: 15, price: 10, desc: 'Masque nourrissant et massage du cuir chevelu.' },
];

module.exports = { SALON, STEP, RULES, HOURS, STAFF, SERVICES };
