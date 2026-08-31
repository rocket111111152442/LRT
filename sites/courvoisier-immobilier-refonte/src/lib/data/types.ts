export type TransactionType = "vente" | "location";

export type PropertyCategory =
  | "Maison"
  | "Appartement"
  | "Immeuble"
  | "Terrain"
  | "Commercial";

export interface Property {
  slug: string;
  transaction: TransactionType;
  category: PropertyCategory;
  title: string;
  locality: string;
  canton: "VD";
  price: number | null;
  priceOnRequest?: boolean;
  rooms: number;
  surface: number;
  landSurface?: number;
  yearBuilt?: number;
  description: string;
  highlights: string[];
  agencyId: Agency["id"];
  featured?: boolean;
  /** Contenu de démonstration — voir docs/courvoisier-audit.md §6. */
  isDemoContent: true;
}

export interface Promotion {
  slug: string;
  name: string;
  locality: string;
  status: "En construction" | "Livraison annoncée" | "Complet";
  delivery?: string;
  architect?: string;
  units?: string;
  roomsRange?: string;
  surfaceRange?: string;
  concept: string;
  description: string[];
  typologies?: { label: string; surface: string; availability?: string }[];
  sourceNote: string;
}

export interface Agency {
  id: "lausanne" | "rolle" | "lonay";
  name: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
  phoneHref: string;
  mapsHref: string;
  hours: string;
}

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  agency: Agency["id"] | "direction";
  bio: string;
}

export interface Testimonial {
  quote: string;
  attribution: string;
  context: string;
  isDemoContent: true;
}

export interface Service {
  number: string;
  slug: string;
  title: string;
  short: string;
  description: string;
  points: string[];
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readingTime: number;
  content: string[];
  isDemoContent: true;
}
