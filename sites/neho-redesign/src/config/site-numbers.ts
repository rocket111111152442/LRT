/**
 * Fichier central de tous les chiffres affichés sur le site.
 *
 * Règle du projet : AUCUN chiffre ne doit être écrit en dur dans un
 * composant. Tout composant qui affiche une statistique, un prix ou un
 * pourcentage importe sa valeur depuis ce fichier.
 *
 * Chaque entrée porte :
 * - `value`   : la valeur affichée
 * - `verified`: `true` seulement si confirmée de façon indépendante lors de
 *   l'audit (voir docs/neho-audit.md) — actuellement AUCUN chiffre n'a pu
 *   être vérifié en direct sur neho.ch depuis cet environnement de travail
 *   (accès réseau bloqué), donc tout est `false` jusqu'à vérification
 *   humaine.
 * - `source`  : d'où vient la valeur (audit, commande du projet, hypothèse)
 *
 * Avant toute diffusion publique : relire ce fichier avec un accès direct
 * à neho.ch et passer chaque `verified` à `true` une fois confirmé, ou
 * corriger la valeur.
 */

export interface VerifiableNumber {
  value: string;
  verified: boolean;
  source: string;
}

export const companyStats = {
  averageRating: {
    value: "4,7 / 5",
    verified: false,
    source:
      "Extrait de recherche mentionnant '4,7/5' et '500+ clients' (docs/neho-audit.md §5) — à confirmer sur /fr/testimonials",
  } satisfies VerifiableNumber,
  satisfiedClients: {
    value: "500+",
    verified: false,
    source: "Extrait de recherche tiers (docs/neho-audit.md §5)",
  } satisfies VerifiableNumber,
  cantonsCovered: {
    value: "6",
    verified: false,
    source: "Genève, Vaud, Fribourg, Valais, Neuchâtel, Jura confirmés en Suisse romande ; présence alémanique partielle observée (docs/neho-audit.md §1, §5)",
  } satisfies VerifiableNumber,
  averageSavings: {
    value: "CHF 25’000",
    verified: false,
    source:
      "Titre de page blog 'Économisez en moyenne CHF 25'000' pour Neuchâtel uniquement — à confirmer comme moyenne nationale avant réutilisation (docs/neho-audit.md §4 et §6)",
  } satisfies VerifiableNumber,
  minimumFlatFee: {
    value: "CHF 12’000",
    verified: false,
    source: "Répété sur plusieurs pages locales indexées (Vaud, Valais, Genève, Neuchâtel) — plancher 'dès', variable selon région (docs/neho-audit.md §4)",
  } satisfies VerifiableNumber,
} as const;

/**
 * Formules commerciales du concept de refonte.
 *
 * Les noms « Essential / Serenity / Privilege » et les montants ci-dessous
 * proviennent de la commande initiale de ce projet. Ils n'ont pas pu être
 * confirmés de façon indépendante (accès direct à neho.ch bloqué dans cet
 * environnement — voir docs/neho-audit.md §4). Seul le palier plancher
 * (CHF 12'000) est cohérent avec plusieurs sources indépendantes.
 * NE PAS diffuser publiquement sans vérification humaine préalable.
 */
export const pricingTiers = [
  {
    id: "essential",
    name: "Essential",
    price: "CHF 12’000",
    priceVerified: false,
    tagline: "L'essentiel pour vendre en toute transparence.",
    recommended: false,
  },
  {
    id: "serenity",
    name: "Serenity",
    price: "CHF 14’500",
    priceVerified: false,
    tagline: "Un accompagnement renforcé et des outils premium.",
    recommended: true,
  },
  {
    id: "privilege",
    name: "Privilege",
    price: "CHF 25’000",
    priceVerified: false,
    tagline: "Le service complet pour les biens d'exception.",
    recommended: false,
  },
] as const;

export type PricingTierId = (typeof pricingTiers)[number]["id"];

/** Grille de prestations par formule — voir /offres pour l'affichage. */
export const pricingFeatureMatrix: {
  category: string;
  feature: string;
  essential: boolean;
  serenity: boolean;
  privilege: boolean;
}[] = [
  { category: "Accompagnement", feature: "Courtier local dédié", essential: true, serenity: true, privilege: true },
  { category: "Accompagnement", feature: "Estimation professionnelle affinée", essential: true, serenity: true, privilege: true },
  { category: "Accompagnement", feature: "Suivi en ligne du dossier", essential: true, serenity: true, privilege: true },
  { category: "Accompagnement", feature: "Conseil juridique et fiscal", essential: false, serenity: true, privilege: true },
  { category: "Mise en valeur", feature: "Photographies HD professionnelles", essential: true, serenity: true, privilege: true },
  { category: "Mise en valeur", feature: "Visite virtuelle 360°", essential: false, serenity: true, privilege: true },
  { category: "Mise en valeur", feature: "Plans et relevés laser", essential: false, serenity: true, privilege: true },
  { category: "Mise en valeur", feature: "Brochure de vente premium", essential: true, serenity: true, privilege: true },
  { category: "Mise en valeur", feature: "Vidéo et prise de vue drone", essential: false, serenity: false, privilege: true },
  { category: "Diffusion", feature: "Publication sur les portails suisses", essential: true, serenity: true, privilege: true },
  { category: "Diffusion", feature: "Accès au réseau d'acheteurs qualifiés", essential: true, serenity: true, privilege: true },
  { category: "Diffusion", feature: "Diffusion internationale", essential: false, serenity: false, privilege: true },
  { category: "Diffusion", feature: "Organisation des visites", essential: true, serenity: true, privilege: true },
  { category: "Négociation", feature: "Négociation des offres", essential: true, serenity: true, privilege: true },
  { category: "Négociation", feature: "Accompagnement jusqu'au notaire", essential: true, serenity: true, privilege: true },
  { category: "Négociation", feature: "Service de conciergerie premium", essential: false, serenity: false, privilege: true },
];
