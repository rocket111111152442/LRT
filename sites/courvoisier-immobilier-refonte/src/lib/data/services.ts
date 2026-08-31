import type { Service } from "./types";

/** Métiers sourcés — voir docs/courvoisier-audit.md §3. */
export const services: Service[] = [
  {
    number: "01",
    slug: "estimation",
    title: "Estimation",
    short: "Trois façons de connaître la valeur de votre bien.",
    description:
      "En vrai, en visio ou en ligne : chaque estimation s’appuie sur l’emplacement, l’état général, la surface, l’année de construction, la taille du terrain et le potentiel de valorisation du bien.",
    points: [
      "Estimation en vrai, avec déplacement d’un courtier",
      "Estimation en visioconférence, sans rendez-vous à domicile",
      "Première estimation en ligne, en quelques clics",
    ],
  },
  {
    number: "02",
    slug: "courtage",
    title: "Courtage",
    short: "Vente et location, résidentielles et commerciales.",
    description:
      "Nos courtiers accompagnent acheteurs et vendeurs à chaque étape : positionnement du bien, valorisation, diffusion, visites, négociation et suivi jusqu’à l’acte notarié.",
    points: [
      "Vente résidentielle et commerciale",
      "Location résidentielle et commerciale",
      "Vente d’immeubles de rendement",
    ],
  },
  {
    number: "03",
    slug: "promotion",
    title: "Promotion",
    short: "Le développement de projets, de l’étude à la livraison.",
    description:
      "Courvoisier accompagne promoteurs, investisseurs et propriétaires fonciers à travers toutes les étapes du développement immobilier : étude, acquisition, développement, permis, construction, commercialisation.",
    points: [
      "Étude de faisabilité et acquisition",
      "Développement et suivi de chantier",
      "Commercialisation des lots",
    ],
  },
  {
    number: "04",
    slug: "conseil",
    title: "Conseil",
    short: "Financement, fiscalité et potentiel d’un bien.",
    description:
      "Un conseil indépendant sur le financement, l’optimisation fiscale, la transformation ou la division d’un bien, et la mise en relation avec des partenaires et architectes de confiance.",
    points: [
      "Financement et fiscalité",
      "Potentiel de transformation et de division",
      "Réseau de partenaires et d’architectes",
    ],
  },
  {
    number: "05",
    slug: "gerance",
    title: "Gérance",
    short: "La gestion locative de votre patrimoine, au quotidien.",
    description:
      "Gestion locative complète d’immeubles, d’appartements ou de propriétés privées : relations locataires, suivi administratif, comptable et technique, valorisation dans la durée.",
    points: [
      "Relations avec les locataires",
      "Suivi administratif, comptable et technique",
      "Valorisation patrimoniale sur le long terme",
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
