export const site = {
  name: "votrecourtier.ch",
  legalName: "votrecourtier.ch SA",
  tagline: "Courtage et développement immobilier — Vaud & Fribourg",
  description:
    "Agence de courtage et de développement immobilier basée à Crissier et Marly. Estimation, vente de biens résidentiels, de terrains et de projets neufs, accompagnement par un développeur immobilier breveté depuis 2006.",
  url: "https://votrecourtier.ch",
  foundedContext: 2006,
  companySince: 2016,
  locales: ["fr"] as const,
} as const;

export const offices = [
  {
    id: "lausanne",
    label: "Lausanne — Crissier",
    city: "Crissier",
    canton: "VD",
    street: "Rue de Cossonay 5",
    postalCode: "1023",
    phone: "+41 21 701 26 26",
    phoneDisplay: "021 701 26 26",
    email: "lausanne@votrecourtier.ch",
  },
  {
    id: "fribourg",
    label: "Fribourg — Marly",
    city: "Marly",
    canton: "FR",
    street: "Chemin du Publiet 60",
    postalCode: "1723",
    phone: "+41 26 430 01 84",
    phoneDisplay: "026 430 01 84",
    email: "fribourg@votrecourtier.ch",
  },
] as const;

export const expert = {
  name: "Alexandre Mirfassihi",
  role: "Développeur immobilier — membre du conseil d'administration",
  credentials: [
    "Développeur immobilier avec brevet fédéral",
    "Ingénieur agronome HES",
    "Courtier qualifié USPI",
    "Expert en estimations immobilières avec brevet fédéral, membre CEI",
  ],
} as const;
