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
  shopSlotDurationMinutes?: string;
  shopMaxAppointmentsPerSlot?: string;
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
    slug:
      normalizeSlug(readText(input, "slug")) ||
      normalizeSlug(readText(input, "companyName")),
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
    shopSlotDurationMinutes:
      readText(input, "shopSlotDurationMinutes") || undefined,
    shopMaxAppointmentsPerSlot:
      readText(input, "shopMaxAppointmentsPerSlot") || undefined,
    promoCode: readText(input, "promoCode").toUpperCase() || undefined,
    emailCode: readText(input, "emailCode").replace(/\D/g, "").slice(0, 6),
    emailVerificationId: readText(input, "emailVerificationId") || undefined,
  };

  const errors: ProSignupErrors = {};

  if (!data.companyName) {
    errors.companyName = "Nom de societe requis.";
  } else if (data.companyName.length > 160) {
    errors.companyName = "Nom de societe trop long.";
  }

  if (!data.slug || data.slug.length < 3) {
    errors.slug = "Identifiant requis, 3 caracteres minimum.";
  }

  if (
    !data.ownerEmail ||
    data.ownerEmail.length > 320 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.ownerEmail)
  ) {
    errors.ownerEmail = "Email invalide.";
  }

  const textLimits: Array<[keyof ProSignupInput, number]> = [
    ["firebaseApiKey", 500],
    ["firebaseProjectId", 253],
    ["firebaseAppId", 500],
    ["shopAddress", 500],
    ["shopPostalCode", 30],
    ["shopCity", 120],
    ["shopCountry", 120],
    ["shopPhone", 50],
    ["shopEmail", 320],
    ["shopOpeningHours", 10_000],
    ["promoCode", 100],
    ["emailVerificationId", 2_000],
  ];

  for (const [field, maxLength] of textLimits) {
    const value = data[field];

    if (typeof value === "string" && value.length > maxLength) {
      errors[field] = "Valeur trop longue.";
    }
  }

  if (
    data.shopEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.shopEmail)
  ) {
    errors.shopEmail = "Email du magasin invalide.";
  }

  if (
    data.password.length < 12 ||
    data.password.length > 128 ||
    !/[A-Za-z]/.test(data.password) ||
    !/\d/.test(data.password)
  ) {
    errors.password =
      "12 caracteres minimum avec au moins une lettre et un chiffre.";
  }

  const capacity = Number(data.shopCapacityPerDay ?? "8");

  if (
    data.shopCapacityPerDay &&
    (!Number.isInteger(capacity) || capacity < 1 || capacity > 10_000)
  ) {
    errors.shopCapacityPerDay = "Capacite invalide.";
  }

  const slotDuration = Number(data.shopSlotDurationMinutes ?? "60");

  if (
    data.shopSlotDurationMinutes &&
    (!Number.isInteger(slotDuration) || slotDuration < 15 || slotDuration > 240)
  ) {
    errors.shopSlotDurationMinutes = "Duree de creneau invalide.";
  }

  const maxAppointments = Number(data.shopMaxAppointmentsPerSlot ?? "1");

  if (
    data.shopMaxAppointmentsPerSlot &&
    (!Number.isInteger(maxAppointments) || maxAppointments < 1 || maxAppointments > 20)
  ) {
    errors.shopMaxAppointmentsPerSlot = "Nombre de rendez-vous invalide.";
  }

  const latitude = data.shopLatitude ? Number(data.shopLatitude) : null;
  const longitude = data.shopLongitude ? Number(data.shopLongitude) : null;

  if (
    latitude !== null &&
    (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)
  ) {
    errors.shopLatitude = "Latitude invalide.";
  }

  if (
    longitude !== null &&
    (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)
  ) {
    errors.shopLongitude = "Longitude invalide.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data };
}
