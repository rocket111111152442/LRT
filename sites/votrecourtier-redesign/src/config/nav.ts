export type NavLink = {
  label: string;
  href: string;
  description?: string;
};

export type NavGroup = {
  label: string;
  href: string;
  columns: {
    heading: string;
    links: NavLink[];
  }[];
  featured: NavLink & { eyebrow: string };
};

export const primaryNav: NavGroup[] = [
  {
    label: "Acheter",
    href: "/tous-nos-biens",
    columns: [
      {
        heading: "Biens à vendre",
        links: [
          { label: "Tous nos biens", href: "/tous-nos-biens", description: "Appartements, maisons, terrains" },
          { label: "Biens résidentiels", href: "/biens-residentiels", description: "Maisons et appartements" },
          { label: "Biens d'investissement", href: "/biens-dinvestissements", description: "Rendement locatif" },
        ],
      },
      {
        heading: "Constructions",
        links: [
          { label: "Projets neufs", href: "/projets-neufs", description: "Vente sur plan, Vaud & Fribourg" },
        ],
      },
    ],
    featured: {
      eyebrow: "Nouveau",
      label: "Projets neufs à Fribourg et dans le canton de Vaud",
      href: "/projets-neufs",
    },
  },
  {
    label: "Vendre",
    href: "/estimation-immobiliere",
    columns: [
      {
        heading: "Estimer et vendre",
        links: [
          { label: "Estimation gratuite", href: "/estimation-immobiliere", description: "Réponse d'un expert breveté" },
          { label: "Vendre mon bien résidentiel", href: "/vendre-mon-bien-residentiel", description: "Maison, appartement" },
          { label: "Vendre mon terrain", href: "/vendre-mon-terrain", description: "Analyse de potentiel constructible" },
          { label: "Vendre mon projet neuf", href: "/vendre-mon-projet-neuf", description: "Commercialisation sur plan" },
        ],
      },
      {
        heading: "Développement",
        links: [
          { label: "Développement foncier", href: "/developpement-foncier", description: "Acquisition et valorisation de terrains" },
        ],
      },
    ],
    featured: {
      eyebrow: "Gratuit, sans engagement",
      label: "Recevez une estimation détaillée par un expert breveté",
      href: "/estimation-immobiliere",
    },
  },
];

export const secondaryNav: NavLink[] = [
  { label: "Références", href: "/references" },
  { label: "À propos", href: "/a-propos" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const footerLocalities = [
  { label: "Lausanne", href: "/agence-immobiliere-a-lausanne" },
  { label: "Fribourg", href: "/agence-immobiliere-a-fribourg" },
  { label: "Marly", href: "/agence-immobiliere-a-marly" },
  { label: "Nyon", href: "/agence-immobiliere-a-nyon" },
  { label: "Morat", href: "/agence-immobiliere-a-morat" },
  { label: "Lutry", href: "/agence-immobiliere-a-lutry" },
];
