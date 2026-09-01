import type { SceneVariant } from "@/components/illustrations/ArchitecturalScene";

/**
 * Jeu de données de démonstration. Biens fictifs — aucune donnée réelle de
 * vente, de client ou de prix n'est utilisée. Voir docs/votrecourtier-audit.md.
 * Les biens sont illustrés par des relevés architecturaux au trait
 * (ArchitecturalScene), jamais par des photographies de stock : voir la
 * note d'intention dans src/components/illustrations/ArchitecturalScene.tsx.
 */

export type PropertyStatus = "disponible" | "sous-offre" | "vendu";
export type PropertyType = "maison" | "appartement" | "terrain" | "projet-neuf" | "investissement";

export type Property = {
  slug: string;
  title: string;
  type: PropertyType;
  status: PropertyStatus;
  canton: "VD" | "FR";
  city: string;
  priceChf: number;
  rooms: number;
  surfaceM2: number;
  landM2?: number;
  yearAvailable?: string;
  summary: string;
  description: string[];
  features: string[];
  scene: SceneVariant;
  gallery: SceneVariant[];
  /** Vraies photographies (Vercel Blob), pour les biens ajoutés depuis /admin. */
  photos?: string[];
  /** Présent uniquement sur les biens ajoutés depuis /admin. */
  createdAt?: string;
};

export const properties: Property[] = [
  {
    slug: "villa-contemporaine-lutry",
    title: "Villa contemporaine avec vue sur le Léman",
    type: "maison",
    status: "disponible",
    canton: "VD",
    city: "Lutry",
    priceChf: 3450000,
    rooms: 6.5,
    surfaceM2: 280,
    landM2: 850,
    summary: "Volumes généreux, matériaux nobles et vue dégagée sur le lac depuis les trois niveaux.",
    description: [
      "Construite en 2019 sur une parcelle arborée dominant le lac, cette villa conjugue une architecture épurée et des prestations haut de gamme : béton ciré, menuiseries en chêne massif, baies vitrées toute hauteur.",
      "Le séjour traversant de 68 m² s'ouvre sur une terrasse abritée et un jardin paysager. La suite parentale occupe seule le dernier niveau, avec dressing et salle de bain privative.",
    ],
    features: ["Vue lac dégagée", "Garage double + 2 places extérieures", "Pompe à chaleur géothermique", "Cave à vin climatisée"],
    scene: "villa",
    gallery: ["villa", "paysage", "bureau"],
  },
  {
    slug: "attique-marly-vue-imprenable",
    title: "Attique 5.5 pièces avec terrasse panoramique",
    type: "appartement",
    status: "disponible",
    canton: "FR",
    city: "Marly",
    priceChf: 1290000,
    rooms: 5.5,
    surfaceM2: 165,
    summary: "Dernier étage d'une résidence de standing, terrasse de 90 m² orientée sud-ouest.",
    description: [
      "Cet attique occupe la totalité du dernier étage d'une résidence de six unités livrée en 2021. La terrasse de 90 m², accessible depuis le séjour et la chambre principale, offre un dégagement sans vis-à-vis sur la campagne fribourgeoise.",
      "Prestations : sol en chêne fumé, cuisine ouverte équipée Miele, deux places de parc intérieures et un ascenseur privatif desservant l'appartement.",
    ],
    features: ["Terrasse 90 m²", "Ascenseur privatif", "2 places de parc intérieures", "Label Minergie"],
    scene: "appartement",
    gallery: ["appartement", "paysage"],
  },
  {
    slug: "parcelle-constructible-corminboeuf",
    title: "Parcelle constructible en zone villa",
    type: "terrain",
    status: "disponible",
    canton: "FR",
    city: "Corminboeuf",
    priceChf: 620000,
    rooms: 0,
    surfaceM2: 0,
    landM2: 720,
    summary: "720 m², indice d'utilisation 0.45, étude de faisabilité disponible sur demande.",
    description: [
      "Terrain plat en zone villa, viabilisé, situé dans un quartier résidentiel calme à quinze minutes du centre de Fribourg.",
      "Une étude de potentiel constructible réalisée par notre développeur breveté est remise à tout acquéreur sérieux : implantation possible, gabarit maximal, contraintes du plan d'aménagement.",
    ],
    features: ["Terrain viabilisé", "Étude de faisabilité incluse", "IUS 0.45", "Orientation sud"],
    scene: "terrain",
    gallery: ["terrain", "paysage"],
  },
  {
    slug: "residence-les-jardins-nyon",
    title: "Résidence Les Jardins — vente sur plan",
    type: "projet-neuf",
    status: "disponible",
    canton: "VD",
    city: "Nyon",
    priceChf: 890000,
    rooms: 3.5,
    surfaceM2: 92,
    yearAvailable: "Livraison estimée 2027",
    summary: "12 appartements du 2.5 au 5.5 pièces, à dix minutes à pied de la gare de Nyon.",
    description: [
      "Programme de 12 logements répartis sur trois niveaux, conçu pour un usage familial : balcons filants, caves et locaux à vélos, parking souterrain.",
      "Choix des finitions possible jusqu'à un stade avancé du chantier. Notaire et plan de vente PPE disponibles sur demande auprès de notre équipe.",
    ],
    features: ["Choix des finitions", "Parking souterrain", "Local à vélos sécurisé", "Proche gare CFF"],
    scene: "projet-neuf",
    gallery: ["projet-neuf", "appartement", "paysage"],
  },
  {
    slug: "immeuble-rendement-lausanne",
    title: "Immeuble de rendement — centre-ville",
    type: "investissement",
    status: "sous-offre",
    canton: "VD",
    city: "Lausanne",
    priceChf: 5200000,
    rooms: 0,
    surfaceM2: 640,
    summary: "8 appartements loués, rendement brut 4.1%, entièrement rénové en 2020.",
    description: [
      "Immeuble de rapport de huit appartements entièrement rénové, situé à proximité immédiate du centre-ville et des transports publics.",
      "État locatif à jour et rapport de rendement détaillé transmis sous accord de confidentialité aux investisseurs qualifiés.",
    ],
    features: ["Rendement brut 4.1%", "Rénové en 2020", "État locatif à jour", "Proche transports publics"],
    scene: "investissement",
    gallery: ["investissement", "paysage"],
  },
  {
    slug: "maison-familiale-neyruz",
    title: "Maison familiale mitoyenne avec jardin",
    type: "maison",
    status: "vendu",
    canton: "FR",
    city: "Neyruz",
    priceChf: 980000,
    rooms: 5.5,
    surfaceM2: 148,
    landM2: 310,
    summary: "Vendue en 21 jours — mandat exclusif avec estimation détaillée.",
    description: [
      "Maison mitoyenne de 2016, quatre chambres, jardin clos orienté ouest. Vendue au prix d'estimation initial après diffusion ciblée et trois visites organisées.",
    ],
    features: ["Jardin clos", "4 chambres", "Garage fermé", "Quartier résidentiel calme"],
    scene: "villa",
    gallery: ["villa", "terrain"],
  },
];

export const propertyTypeLabels: Record<PropertyType, string> = {
  maison: "Maison",
  appartement: "Appartement",
  terrain: "Terrain",
  "projet-neuf": "Projet neuf",
  investissement: "Investissement",
};

export const propertyStatusLabels: Record<PropertyStatus, string> = {
  disponible: "Disponible",
  "sous-offre": "Sous offre",
  vendu: "Vendu",
};

export function formatChf(value: number) {
  return new Intl.NumberFormat("fr-CH", { maximumFractionDigits: 0 }).format(value);
}

export function getPropertyBySlug(slug: string, list: Property[] = properties) {
  return list.find((p) => p.slug === slug);
}

export function getSimilarProperties(current: Property, list: Property[] = properties, limit = 3) {
  return list
    .filter((p) => p.slug !== current.slug && (p.type === current.type || p.canton === current.canton))
    .slice(0, limit);
}
