import type { PlaceholderTone } from "@/components/PlaceholderVisual";

export const nav = [
  { label: "Services", href: "#services" },
  { label: "Biens", href: "#biens" },
  { label: "Projets", href: "#projets" },
  { label: "Équipe", href: "#equipe" },
  { label: "Contact", href: "#contact" },
];

export const company = {
  name: "énéo conseil en immobilier SA",
  address: "Rue de la Mairie 17",
  city: "1207 Genève",
  phone: "+41 22 700 68 63",
  phoneHref: "+41227006863",
  email: "info@eneo-immobilier.ch",
};

export type Service = {
  id: string;
  index: string;
  title: string;
  description: string;
  tone: PlaceholderTone;
};

export const services: Service[] = [
  {
    id: "gerance",
    index: "01",
    title: "Gérance",
    description:
      "Une gestion rigoureuse et transparente de vos biens : suivi locatif, entretien, comptabilité et relation avec les locataires, pour un patrimoine serein et pérenne.",
    tone: "forest",
  },
  {
    id: "courtage",
    index: "02",
    title: "Courtage",
    description:
      "Une estimation juste, une mise en marché soignée et un accompagnement sur mesure jusqu'à la signature, pour vendre ou acquérir au meilleur prix.",
    tone: "ink",
  },
  {
    id: "renovation",
    index: "03",
    title: "Rénovation",
    description:
      "De la transformation ciblée à la rénovation complète, nous pilotons vos projets avec des artisans de confiance pour révéler tout le potentiel de vos biens.",
    tone: "gold",
  },
];

export type Property = {
  id: string;
  category: "vente" | "location";
  type: string;
  title: string;
  location: string;
  surface: string;
  price?: string;
  tone: PlaceholderTone;
};

export const properties: Property[] = [
  {
    id: "villa-cologny",
    category: "vente",
    type: "Villa",
    title: "Villa contemporaine",
    location: "Cologny, Genève",
    surface: "320 m²",
    price: "Sur demande",
    tone: "forest",
  },
  {
    id: "maison-village-jussy",
    category: "vente",
    type: "Maison de village",
    title: "Maison de village rénovée",
    location: "Jussy, Genève",
    surface: "210 m²",
    price: "CHF 2 450 000.–",
    tone: "stone",
  },
  {
    id: "appartement-eaux-vives",
    category: "location",
    type: "Appartement",
    title: "Appartement 4.5 pièces",
    location: "Eaux-Vives, Genève",
    surface: "125 m²",
    price: "CHF 3 800.– / mois",
    tone: "gold",
  },
  {
    id: "arcade-plainpalais",
    category: "location",
    type: "Arcade / fonds de commerce",
    title: "Arcade commerciale",
    location: "Plainpalais, Genève",
    surface: "95 m²",
    price: "Sur demande",
    tone: "ink",
  },
];

export type TeamMember = {
  id: string;
  initials: string;
  name: string;
  role: string;
};

export const team: TeamMember[] = [
  {
    id: "maurice-cerato",
    initials: "MC",
    name: "Maurice Cerato",
    role: "Directeur et fondateur",
  },
  {
    id: "severine-cerato",
    initials: "SC",
    name: "Séverine Cerato",
    role: "Services RH et comptabilité",
  },
  {
    id: "marina-huggel",
    initials: "MH",
    name: "Marina Huggel",
    role: "Service comptabilité",
  },
  {
    id: "clothilde-zegrir",
    initials: "CZ",
    name: "Clothilde Zegrir",
    role: "Service gérance",
  },
];
