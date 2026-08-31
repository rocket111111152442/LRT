import type { Property, PropertyCategory, TransactionType } from "@/lib/data/types";

export interface PropertyFilters {
  transaction: TransactionType;
  locality?: string;
  category?: PropertyCategory | "Tous";
  minRooms?: number;
  maxPrice?: number;
}

export function filterProperties(properties: Property[], filters: PropertyFilters): Property[] {
  return properties.filter((property) => {
    if (property.transaction !== filters.transaction) return false;

    if (filters.locality) {
      const needle = filters.locality.trim().toLowerCase();
      if (needle && !property.locality.toLowerCase().includes(needle)) return false;
    }

    if (filters.category && filters.category !== "Tous" && property.category !== filters.category) {
      return false;
    }

    if (filters.minRooms && property.rooms < filters.minRooms) return false;

    if (filters.maxPrice && property.price !== null && property.price > filters.maxPrice) {
      return false;
    }

    return true;
  });
}

export const PROPERTY_CATEGORIES: (PropertyCategory | "Tous")[] = [
  "Tous",
  "Maison",
  "Appartement",
  "Immeuble",
  "Terrain",
  "Commercial",
];

export const BUDGET_STEPS_VENTE = [500_000, 800_000, 1_200_000, 1_800_000, 2_500_000, 4_000_000];
export const BUDGET_STEPS_LOCATION = [1_200, 1_800, 2_500, 3_500, 5_000];
