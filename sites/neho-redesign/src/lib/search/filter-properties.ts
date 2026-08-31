import type { Property, PropertyType } from "@/lib/data/types";
import { getCommuneBySlug } from "@/lib/data/communes";

export interface PropertyFilters {
  location?: string; // slug de commune ou de canton
  type?: PropertyType | "";
  priceMin?: number;
  priceMax?: number;
  roomsMin?: number;
  surfaceMin?: number;
  landOnly?: boolean;
  availability?: "disponible" | "";
  sort?: "pertinence" | "prix-asc" | "prix-desc" | "surface" | "recent";
}

export function parseFiltersFromSearchParams(sp: Record<string, string | string[] | undefined>): PropertyFilters {
  const get = (key: string) => (Array.isArray(sp[key]) ? sp[key]?.[0] : (sp[key] as string | undefined));
  return {
    location: get("localisation") ?? "",
    type: (get("type") as PropertyType | undefined) ?? "",
    priceMin: get("prixMin") ? Number(get("prixMin")) : undefined,
    priceMax: get("prixMax") ? Number(get("prixMax")) : undefined,
    roomsMin: get("pieces") ? Number(get("pieces")) : undefined,
    surfaceMin: get("surface") ? Number(get("surface")) : undefined,
    landOnly: get("terrain") === "1",
    availability: (get("dispo") as "disponible" | undefined) ?? "",
    sort: (get("tri") as PropertyFilters["sort"]) ?? "pertinence",
  };
}

export function filtersToSearchParams(filters: PropertyFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.location) params.set("localisation", filters.location);
  if (filters.type) params.set("type", filters.type);
  if (filters.priceMin) params.set("prixMin", String(filters.priceMin));
  if (filters.priceMax) params.set("prixMax", String(filters.priceMax));
  if (filters.roomsMin) params.set("pieces", String(filters.roomsMin));
  if (filters.surfaceMin) params.set("surface", String(filters.surfaceMin));
  if (filters.landOnly) params.set("terrain", "1");
  if (filters.availability) params.set("dispo", filters.availability);
  if (filters.sort && filters.sort !== "pertinence") params.set("tri", filters.sort);
  return params;
}

export function filterProperties(properties: Property[], filters: PropertyFilters): Property[] {
  let result = properties.filter((p) => {
    if (filters.location) {
      const commune = getCommuneBySlug(p.commune);
      const matchesCommune = p.commune === filters.location;
      const matchesCanton = p.canton === filters.location;
      const matchesName = commune?.name.toLowerCase().includes(filters.location.toLowerCase());
      if (!matchesCommune && !matchesCanton && !matchesName) return false;
    }
    if (filters.type && p.type !== filters.type) return false;
    if (filters.priceMin && p.price < filters.priceMin) return false;
    if (filters.priceMax && p.price > filters.priceMax) return false;
    if (filters.roomsMin && p.rooms < filters.roomsMin) return false;
    if (filters.surfaceMin && p.surface < filters.surfaceMin) return false;
    if (filters.landOnly && (!p.landSurface || p.landSurface <= 0)) return false;
    if (filters.availability && p.availability !== filters.availability) return false;
    return true;
  });

  switch (filters.sort) {
    case "prix-asc":
      result = result.slice().sort((a, b) => a.price - b.price);
      break;
    case "prix-desc":
      result = result.slice().sort((a, b) => b.price - a.price);
      break;
    case "surface":
      result = result.slice().sort((a, b) => b.surface - a.surface);
      break;
    case "recent":
      result = result.slice().sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
      break;
    default:
      result = result.slice().sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  return result;
}
