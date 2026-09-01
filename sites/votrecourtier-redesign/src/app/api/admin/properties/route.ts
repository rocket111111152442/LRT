import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/admin/auth";
import { createDynamicProperty, type CreatePropertyInput } from "@/lib/admin/blobStore";
import type { PropertyStatus, PropertyType } from "@/lib/data/properties";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_PHOTOS = 12;
const propertyTypes: PropertyType[] = ["maison", "appartement", "terrain", "projet-neuf", "investissement"];
const propertyStatuses: PropertyStatus[] = ["disponible", "sous-offre", "vendu"];

function requiredString(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Non authentifié." }, { status: 401 });
  }

  const form = await request.formData();

  const title = requiredString(form, "title");
  const type = requiredString(form, "type") as PropertyType;
  const status = requiredString(form, "status") as PropertyStatus;
  const canton = requiredString(form, "canton");
  const city = requiredString(form, "city");
  const priceChf = Number(requiredString(form, "priceChf"));
  const rooms = Number(requiredString(form, "rooms") || "0");
  const surfaceM2 = Number(requiredString(form, "surfaceM2") || "0");
  const landM2Raw = requiredString(form, "landM2");
  const yearAvailable = requiredString(form, "yearAvailable");
  const summary = requiredString(form, "summary");
  const description = parseLines(requiredString(form, "description"));
  const features = parseLines(requiredString(form, "features"));

  const errors: string[] = [];
  if (!title) errors.push("Le titre est requis.");
  if (!propertyTypes.includes(type)) errors.push("Type de bien invalide.");
  if (!propertyStatuses.includes(status)) errors.push("Statut invalide.");
  if (canton !== "VD" && canton !== "FR") errors.push("Canton invalide.");
  if (!city) errors.push("La localité est requise.");
  if (!Number.isFinite(priceChf) || priceChf <= 0) errors.push("Le prix doit être un nombre positif.");
  if (!summary) errors.push("Le résumé est requis.");
  if (description.length === 0) errors.push("Ajoutez au moins un paragraphe de description.");

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, error: errors.join(" ") }, { status: 400 });
  }

  const photoFiles = form
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)
    .slice(0, MAX_PHOTOS);

  for (const file of photoFiles) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ ok: false, error: `${file.name} n'est pas une image.` }, { status: 400 });
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ ok: false, error: `${file.name} dépasse 8 Mo.` }, { status: 400 });
    }
  }

  const input: CreatePropertyInput = {
    title,
    type,
    status,
    canton: canton as "VD" | "FR",
    city,
    priceChf,
    rooms,
    surfaceM2,
    landM2: landM2Raw ? Number(landM2Raw) : undefined,
    yearAvailable: yearAvailable || undefined,
    summary,
    description,
    features,
  };

  const result = await createDynamicProperty(input, photoFiles);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/tous-nos-biens");
  revalidatePath(`/tous-nos-biens/${result.property.slug}`);
  revalidatePath("/biens-residentiels");
  revalidatePath("/biens-dinvestissements");
  revalidatePath("/projets-neufs");
  revalidatePath("/admin");

  return NextResponse.json({ ok: true, property: result.property });
}
