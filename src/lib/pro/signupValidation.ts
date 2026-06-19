export type ProSignupInput = {
  companyName: string;
  slug: string;
  ownerEmail: string;
  password: string;
  firebaseApiKey: string;
  firebaseProjectId: string;
  firebaseAppId: string;
  shopAddress?: string;
  shopPostalCode?: string;
  shopCity?: string;
  shopCountry?: string;
  shopPhone?: string;
  shopEmail?: string;
  shopOpeningHours?: string;
  shopLatitude?: string;
  shopLongitude?: string;
  shopCapacityPerDay?: string;
  promoCode?: string;
  emailCode?: string;
  emailVerificationId?: string;
};

export type ProSignupErrors = Partial<Record<keyof ProSignupInput, string>>;

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(source: Record<string, unknown>, key: keyof ProSignupInput) {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

export function validateProSignupInput(input: unknown):
  | { ok: true; data: ProSignupInput }
  | { ok: false; errors: ProSignupErrors } {
  if (!isRecord(input)) {
    return { ok: false, errors: { companyName: "Donnees invalides." } };
  }

  const data: ProSignupInput = {
    companyName: readText(input, "companyName"),
    slug: normalizeSlug(readText(input, "slug")),
    ownerEmail: readText(input, "ownerEmail").toLowerCase(),
    password: readText(input, "password"),
    firebaseApiKey: readText(input, "firebaseApiKey") || "managed-by-Qoravo",
    firebaseProjectId: readText(input, "firebaseProjectId") || "managed-by-Qoravo",
    firebaseAppId: readText(input, "firebaseAppId") || "managed-by-Qoravo",
    shopAddress: readText(input, "shopAddress") || undefined,
    shopPostalCode: readText(input, "shopPostalCode") || undefined,
    shopCity: readText(input, "shopCity") || undefined,
    shopCountry: readText(input, "shopCountry") || undefined,
    shopPhone: readText(input, "shopPhone") || undefined,
    shopEmail: readText(input, "shopEmail") || undefined,
    shopOpeningHours: readText(input, "shopOpeningHours") || undefined,
    shopLatitude: readText(input, "shopLatitude") || undefined,
    shopLongitude: readText(input, "shopLongitude") || undefined,
    shopCapacityPerDay: readText(input, "shopCapacityPerDay") || undefined,
    promoCode: readText(input, "promoCode").toUpperCase() || undefined,
    emailCode: readText(input, "emailCode").replace(/\D/g, "").slice(0, 6),
    emailVerificationId: readText(input, "emailVerificationId") || undefined,
  };

  const errors: ProSignupErrors = {};

  if (!data.companyName) {
    errors.companyName = "Nom de societe requis.";
  }

  if (!data.slug || data.slug.length < 3) {
    errors.slug = "Identifiant requis, 3 caracteres minimum.";
  }

  if (!data.ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.ownerEmail)) {
    errors.ownerEmail = "Email invalide.";
  }

  if (data.password.length < 8) {
    errors.password = "Mot de passe requis, 8 caracteres minimum.";
  }

  const capacity = Number(data.shopCapacityPerDay ?? "8");

  if (data.shopCapacityPerDay && (!Number.isInteger(capacity) || capacity < 1)) {
    errors.shopCapacityPerDay = "Capacite invalide.";
  }

  for (const key of ["shopLatitude", "shopLongitude"] as const) {
    if (data[key] && Number.isNaN(Number(data[key]))) {
      errors[key] = "Coordonnee invalide.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data };
}
