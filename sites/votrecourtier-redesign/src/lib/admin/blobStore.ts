import { list, put } from "@vercel/blob";
import type { Property, PropertyStatus, PropertyType } from "@/lib/data/properties";
import type { SceneVariant } from "@/components/illustrations/ArchitecturalScene";

/**
 * Persistance des biens ajoutés depuis /admin, sur Vercel Blob : un fichier
 * JSON par bien (data/properties/<slug>.json), pas de base relationnelle —
 * volume attendu (quelques dizaines de mandats) ne justifie pas plus.
 * Nécessite qu'un Blob store soit connecté au projet Vercel
 * (variable d'environnement BLOB_READ_WRITE_TOKEN, ajoutée automatiquement
 * une fois le store créé et rattaché depuis le tableau de bord Vercel).
 */

const PREFIX = "data/properties/";

const typeToScene: Record<PropertyType, SceneVariant> = {
  maison: "villa",
  appartement: "appartement",
  terrain: "terrain",
  "projet-neuf": "projet-neuf",
  investissement: "investissement",
};

export function isBlobConfigured() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getDynamicProperties(): Promise<Property[]> {
  if (!isBlobConfigured()) return [];

  try {
    const { blobs } = await list({ prefix: PREFIX, limit: 200 });
    const records = await Promise.all(
      blobs
        .filter((b) => b.pathname.endsWith(".json"))
        .map(async (b) => {
          const res = await fetch(b.url, { cache: "no-store" });
          if (!res.ok) return null;
          return (await res.json()) as Property;
        }),
    );
    return records
      .filter((p): p is Property => !!p)
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  } catch (error) {
    console.error("[admin] Lecture des biens dynamiques impossible :", error);
    return [];
  }
}

export type CreatePropertyInput = {
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
};

export async function createDynamicProperty(
  input: CreatePropertyInput,
  photoFiles: File[],
): Promise<{ ok: true; property: Property } | { ok: false; error: string }> {
  if (!isBlobConfigured()) {
    return {
      ok: false,
      error:
        "Le stockage Vercel Blob n'est pas encore connecté à ce projet. Voir les instructions sous le formulaire.",
    };
  }

  const existing = await getDynamicProperties();
  let slug = slugify(`${input.title}-${input.city}`) || slugify(input.title) || `bien-${Date.now()}`;
  if (existing.some((p) => p.slug === slug)) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  let photos: string[] = [];
  try {
    const uploads = await Promise.all(
      photoFiles.map((file, i) =>
        put(`${PREFIX}${slug}/photo-${i + 1}-${file.name}`, file, {
          access: "public",
          addRandomSuffix: true,
          contentType: file.type || "image/jpeg",
        }),
      ),
    );
    photos = uploads.map((u) => u.url);
  } catch (error) {
    console.error("[admin] Échec de l'upload des photos :", error);
    return { ok: false, error: "L'envoi des photos a échoué. Réessayez, ou ajoutez le bien sans photo." };
  }

  const scene = typeToScene[input.type];
  const property: Property = {
    slug,
    title: input.title,
    type: input.type,
    status: input.status,
    canton: input.canton,
    city: input.city,
    priceChf: input.priceChf,
    rooms: input.rooms,
    surfaceM2: input.surfaceM2,
    landM2: input.landM2,
    yearAvailable: input.yearAvailable,
    summary: input.summary,
    description: input.description,
    features: input.features,
    scene,
    gallery: [scene],
    photos,
    createdAt: new Date().toISOString(),
  };

  try {
    await put(`${PREFIX}${slug}.json`, JSON.stringify(property), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (error) {
    console.error("[admin] Échec de l'enregistrement du bien :", error);
    return { ok: false, error: "L'enregistrement du bien a échoué. Réessayez." };
  }

  return { ok: true, property };
}
