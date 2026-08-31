export type NavLeaf = {
  href: string;
  label: string;
  /** Courte description affichée dans le méga-menu et le menu mobile. */
  resume?: string;
};

export type NavItem = NavLeaf & { enfants?: readonly NavLeaf[] };

export const navigation: readonly NavItem[] = [
  {
    href: '/agence/',
    label: "L'agence",
    resume: 'Qui nous sommes, comment nous travaillons.',
    enfants: [
      { href: '/agence/', label: "L'agence", resume: 'Notre métier, notre cadre, notre méthode.' },
      { href: '/garanties/', label: 'Nos garanties', resume: 'Ce sur quoi nous nous engageons.' },
      { href: '/medias/', label: 'Médias', resume: "L'agence dans la presse et à la télévision." },
      { href: '/emplois/', label: 'Emplois', resume: 'Rejoindre nos équipes de terrain.' },
    ],
  },
  {
    href: '/services/particuliers/',
    label: 'Services',
    resume: 'Nos domaines d’intervention.',
    enfants: [
      {
        href: '/services/particuliers/',
        label: 'Particuliers',
        resume: 'Infidélité, moralité, garde d’enfant, recherche de personne.',
      },
      {
        href: '/services/entreprises/',
        label: 'Entreprises',
        resume: 'Solvabilité, réputation, arrêts de travail, assurance.',
      },
      {
        href: '/services/parents/',
        label: 'Parents',
        resume: 'Environnement d’un adolescent, alcool, stupéfiants.',
      },
      {
        href: '/services/contre-mesures/',
        label: 'Contre-mesures',
        resume: 'Détection de micros, caméras et balises de géolocalisation.',
      },
    ],
  },
  {
    href: '/detective-geneve/',
    label: 'Implantations',
    resume: 'Quatre bureaux, un réseau mondial.',
    enfants: [
      {
        href: '/detective-geneve/',
        label: 'Genève',
        resume: 'Siège et coordination des enquêtes.',
      },
      { href: '/detective-lausanne/', label: 'Lausanne', resume: 'Antenne vaudoise.' },
      {
        href: '/reseau-international/',
        label: 'Réseau international',
        resume: 'Europe, Canada, États-Unis.',
      },
    ],
  },
  { href: '/tarifs/', label: 'Tarifs', resume: 'Honoraires, forfaits et maîtrise du budget.' },
];

export const navigationPied = {
  agence: [
    { href: '/agence/', label: "L'agence" },
    { href: '/garanties/', label: 'Nos garanties' },
    { href: '/medias/', label: 'Médias' },
    { href: '/emplois/', label: 'Emplois' },
    { href: '/tarifs/', label: 'Tarifs' },
  ],
  services: [
    { href: '/services/particuliers/', label: 'Particuliers' },
    { href: '/services/entreprises/', label: 'Entreprises' },
    { href: '/services/parents/', label: 'Parents' },
    { href: '/services/contre-mesures/', label: 'Contre-mesures' },
  ],
  implantations: [
    { href: '/detective-geneve/', label: 'Détective privé à Genève' },
    { href: '/detective-lausanne/', label: 'Détective privé à Lausanne' },
    { href: '/reseau-international/', label: 'Réseau international' },
    { href: '/contact/', label: 'Contact' },
  ],
  legal: [
    { href: '/mentions-legales/', label: 'Mentions légales' },
    { href: '/politique-de-confidentialite/', label: 'Politique de confidentialité' },
    { href: '/gestion-des-cookies/', label: 'Gestion des cookies' },
  ],
} as const;
