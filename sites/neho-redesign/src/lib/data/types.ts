import type { CantonSlug } from "@/config/site";

export interface Commune {
  slug: string;
  name: string;
  canton: CantonSlug;
  postalCode: string;
  population: number;
  averagePricePerSqm: number; // CHF/m², donnée de démonstration
  priceTrendPercent: number; // variation annuelle indicative, démonstration
  averageDaysOnMarket: number; // démonstration
  description: string;
}

export interface Canton {
  slug: CantonSlug;
  name: string;
  region: "Suisse romande";
  heroFact: string;
  description: string;
  communesCount: number; // total réel indicatif (pas toutes générées en pages)
  stats: {
    averagePricePerSqm: number;
    medianSaleDays: number;
    activeListings: number;
  };
}

export interface Agent {
  slug: string;
  name: string;
  role: string;
  canton: CantonSlug;
  communes: string[]; // slugs de communes couvertes
  yearsExperience: number;
  bio: string;
  languages: string[];
  phoneDemo: string;
  emailDemo: string;
  photoTone: "warm" | "cool" | "neutral"; // pour l'illustration générée (avatar géométrique)
  initials: string;
}

export type PropertyType = "appartement" | "maison" | "villa" | "terrain" | "immeuble";
export type PropertyCondition = "neuf" | "excellent" | "bon" | "a-renover";
export type PropertyAvailability = "disponible" | "sous-offre" | "vendu";

export interface Property {
  slug: string;
  title: string;
  type: PropertyType;
  price: number; // CHF
  commune: string; // slug
  canton: CantonSlug;
  rooms: number;
  surface: number; // m²
  landSurface?: number; // m²
  parkingSpaces: number;
  yearBuilt: number;
  condition: PropertyCondition;
  availability: PropertyAvailability;
  hasVirtualTour: boolean;
  hasFloorPlans: boolean;
  amenities: string[];
  description: string;
  agentSlug: string;
  featured: boolean;
  /** Affiche un badge « Nouveau ». Valeur figée dans les données de
   * démonstration plutôt que calculée depuis la date courante, pour éviter
   * tout écart de rendu serveur/client (voir règle de pureté React). */
  isNew: boolean;
  publishedAt: string; // ISO date, démonstration
  illustration: "villa" | "chalet" | "appartement" | "immeuble" | "terrain";
}

export interface Testimonial {
  slug: string;
  authorName: string;
  role: "Vendeur" | "Acheteur";
  commune: string;
  canton: CantonSlug;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  verified: boolean;
  date: string;
}

export interface LocalFaqItem {
  question: string;
  answer: string;
}
