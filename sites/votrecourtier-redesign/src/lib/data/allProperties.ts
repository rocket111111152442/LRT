import { properties as staticProperties, getPropertyBySlug, getSimilarProperties, type Property } from "./properties";
import { getDynamicProperties } from "@/lib/admin/blobStore";

/**
 * Combine les biens de démonstration (statiques) et les biens réellement
 * ajoutés depuis /admin (Vercel Blob). Les biens réels apparaissent en
 * premier — voir docs/votrecourtier-audit.md pour le principe des données
 * de démonstration.
 */
export async function getAllProperties(): Promise<Property[]> {
  const dynamic = await getDynamicProperties();
  return [...dynamic, ...staticProperties];
}

export async function findPropertyBySlug(slug: string) {
  const all = await getAllProperties();
  return getPropertyBySlug(slug, all);
}

export async function findSimilarProperties(current: Property) {
  const all = await getAllProperties();
  return getSimilarProperties(current, all);
}
