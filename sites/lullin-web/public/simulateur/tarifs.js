// Tarifs du simulateur de prix : copie exacte de la page /offres (formules, options,
// maintenance). À modifier ici ET dans src/content.ts si un prix change.
// Fichier partagé : importé par simulateur.js (navigateur) et par
// scripts/build-simulator.mjs (génération de la page au build).

export const FORMULES = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    type: 'Site Essentiel',
    price: 349,
    from: true,
    pages: 1,
    mails: 0,
    pitch: 'Une page complète pour présenter votre activité.',
  },
  {
    id: 'vitrine',
    name: 'Vitrine',
    type: 'Site Vitrine',
    price: 549,
    pages: 5,
    mails: 1,
    pitch: 'Jusqu’à 5 pages pour présenter vos services.',
  },
  {
    id: 'business',
    name: 'Business',
    type: 'Site Business',
    price: 799,
    pages: 8,
    mails: 1,
    pitch: 'Jusqu’à 8 pages, animations et référencement amélioré.',
  },
  {
    id: 'premium',
    name: 'Premium',
    type: 'Site Premium',
    price: 949,
    pages: 12,
    mails: 2,
    pitch: 'Jusqu’à 12 pages et fonctionnalités personnalisées.',
  },
  {
    id: 'boutique',
    name: 'Boutique en ligne',
    type: 'Projet personnalisé',
    quote: true,
    pages: 5,
    mails: 0,
    pitch: 'Sur devis : dépend des produits et des moyens de paiement.',
  },
];

export const PAGE = { title: 'Page supplémentaire', price: 49 };
export const MAIL = { title: 'Adresse mail professionnelle supplémentaire', price: 69 };

export const OPTIONS = [
  { id: 'google', title: 'Création ou optimisation Google Business', price: 79 },
  { id: 'seo', title: 'Optimisation SEO supplémentaire', price: 99, from: true },
  { id: 'reservation', title: 'Système de réservation', price: 99, from: true },
  { id: 'blog', title: 'Blog ou espace actualités', price: 129 },
  { id: 'langue', title: 'Langue supplémentaire', price: 149, from: true },
  { id: 'textes', title: 'Rédaction des textes', price: 59, from: true },
  { id: 'animations', title: 'Animations personnalisées', price: 79, from: true },
];

export const PRIORITY = { title: 'Livraison prioritaire', rate: 0.25 };

export const MAINTENANCE = [
  { id: 'aucune', value: 'Non, pas pour le moment', name: 'Sans maintenance', price: 0 },
  { id: 'essentielle', value: 'Maintenance Essentielle', name: 'Essentielle', price: 39 },
  { id: 'business', value: 'Maintenance Business', name: 'Business', price: 69, recommended: true },
  { id: 'visibilite', value: 'Visibilité', name: 'Visibilité', price: 119 },
];

export const LIMITS = { pagesMin: 1, pagesMax: 30, mailsMax: 5 };
