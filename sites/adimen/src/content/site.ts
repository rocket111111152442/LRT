/**
 * Source unique de vérité pour toutes les données factuelles du site.
 *
 * Toute information affichée sur le site provient de ce fichier. Pour corriger une
 * coordonnée, un horaire ou un tarif, il suffit de modifier la valeur ici : elle est
 * répercutée sur l'ensemble des pages, des données structurées et du plan du site.
 *
 * Les champs marqués `verifie: false` n'ont pas pu être recoupés lors de l'audit
 * (voir docs/adimen-audit.md § 0). Ils sont listés dans CONTENU-A-VALIDER.md.
 */

export const SITE_URL = 'https://www.agence-adimen.ch';

export const agence = {
  nom: 'Agence ADIMEN',
  nomLegal: 'Adimen Sàrl',
  /** ⚠︎ À valider : deux entités figurent au registre (voir CONTENU-A-VALIDER.md). */
  ide: 'CHE-134.274.180',
  baseline: 'Renseignement privé et investigation en Suisse romande',
  email: 'info@agence-adimen.ch',
  telephonePrincipal: '+41 22 300 38 05',
  telephonePrincipalAffiche: '022 300 38 05',
  anneesExperience: 10,
  facebook: 'https://www.facebook.com/agenceadimen/',
} as const;

export type Bureau = {
  id: 'geneve' | 'lausanne' | 'montreux' | 'sion';
  ville: string;
  canton: string;
  rue: string;
  npa: string;
  localite: string;
  telephone: string | null;
  telephoneAffiche: string | null;
  /** Coordonnées géographiques, utilisées par la carte et les données structurées. */
  lat: number;
  lng: number;
  /** Position relative sur la carte stylisée de l'arc lémanique (0–1). */
  carte: { x: number; y: number };
  principal: boolean;
  intro: string;
};

const geneve: Bureau = {
  id: 'geneve',
  ville: 'Genève',
  canton: 'GE',
  rue: 'Rue du Grand-Bureau 11',
  npa: '1227',
  localite: 'Les Acacias',
  telephone: '+41 22 300 38 05',
  telephoneAffiche: '022 300 38 05',
  lat: 46.1912,
  lng: 6.1264,
  carte: { x: 0.1, y: 0.62 },
  principal: true,
  intro:
    "Siège de l'agence et centre de coordination des enquêtes. Les dossiers y sont ouverts, suivis et archivés.",
};

export const bureaux: readonly [Bureau, ...Bureau[]] = [
  geneve,
  {
    id: 'lausanne',
    ville: 'Lausanne',
    canton: 'VD',
    rue: 'Rue du Simplon 37',
    npa: '1006',
    localite: 'Lausanne',
    telephone: '+41 21 973 22 82',
    telephoneAffiche: '021 973 22 82',
    lat: 46.5155,
    lng: 6.6323,
    carte: { x: 0.42, y: 0.3 },
    principal: false,
    intro:
      "Antenne vaudoise. Elle couvre l'agglomération lausannoise, la Côte, le Gros-de-Vaud et le Nord vaudois.",
  },
  {
    id: 'montreux',
    ville: 'Montreux',
    canton: 'VD',
    rue: "Rue de l'Église Catholique 10",
    npa: '1820',
    localite: 'Montreux',
    telephone: null,
    telephoneAffiche: null,
    lat: 46.4312,
    lng: 6.9107,
    carte: { x: 0.7, y: 0.46 },
    principal: false,
    intro:
      'Antenne de la Riviera. Elle intervient de Vevey au Chablais, y compris sur la rive haut-savoyarde du lac.',
  },
  {
    id: 'sion',
    ville: 'Sion',
    canton: 'VS',
    rue: 'Case postale 2018',
    npa: '1950',
    localite: 'Sion 2',
    telephone: '+41 27 203 47 15',
    telephoneAffiche: '027 203 47 15',
    lat: 46.2311,
    lng: 7.359,
    carte: { x: 0.93, y: 0.74 },
    principal: false,
    intro:
      'Antenne valaisanne. Elle couvre la vallée du Rhône, de Martigny au Haut-Valais, ainsi que les stations.',
  },
];

export const bureauPrincipal = geneve;

export const horaires = {
  /** Accueil téléphonique et prise de rendez-vous. */
  accueil: 'Du lundi au vendredi, de 8 h à 20 h',
  /** Capacité d'intervention sur le terrain. */
  terrain: '7 jours sur 7, 24 heures sur 24',
  /**
   * ⚠︎ Contradiction relevée à l'audit : local.ch annonce une ouverture le samedi,
   * le site annonce lundi–vendredi. La valeur du site fait foi jusqu'à validation.
   */
  note: null as string | null,
} as const;

export const tarifs = {
  min: 90,
  max: 240,
  devise: 'CHF',
  unite: "de l'heure",
  forfaitAdministratif: true,
} as const;

/** Zones d'intervention, telles qu'annoncées par l'agence. */
export const zonesIntervention = [
  'Ensemble du territoire suisse',
  'Zone Europe',
  'Canada',
  'États-Unis',
] as const;

export const agrements = [
  {
    titre: "Agrément du Conseil d'État",
    detail:
      "L'agence est agréée par le Conseil d'État à Genève pour l'exercice de l'activité de détective privé.",
  },
  {
    titre: 'Autorisation DSE',
    detail:
      "Chaque agent est titulaire de l'autorisation délivrée par le Département de la sécurité et de l'économie.",
  },
] as const;
