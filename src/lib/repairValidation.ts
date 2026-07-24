export const REPAIR_STATUSES = [
  "PAS_ENCORE_RECU_CLIENT",
  "PAS_ENCORE_EN_REPARATION",
  "EN_REPARATION",
  "EN_ATTENTE_PIECE",
  "PRET",
  "RECUPERE",
  "ANNULE",
] as const;

export const PART_STATUSES = ["NONE", "ORDERED", "RECEIVED", "INSTALLED"] as const;
export const REPAIR_PAYMENT_STATUSES = [
  "NON_PAYE",
  "ACOMPTE",
  "PAYE",
  "REMBOURSE",
] as const;
export const CUSTOMER_TYPES = ["STANDARD", "VIP", "PRO"] as const;

export type RepairStatus = (typeof REPAIR_STATUSES)[number];
export type PartStatus = (typeof PART_STATUSES)[number];
export type RepairPaymentStatus = (typeof REPAIR_PAYMENT_STATUSES)[number];
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export type RepairInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  deviceType: string;
  brand: string;
  model: string;
  issueDescription: string;
  unlockCodeOrNote?: string;
  photos?: string[];
  customerDropOffSignature?: string;
  requestedAppointmentAt?: string;
  wantsPriceBeforeDeposit?: boolean;
};

export type RepairInputErrors = Partial<Record<keyof RepairInput, string>>;

type ValidationResult =
  | { ok: true; data: RepairInput }
  | { ok: false; errors: RepairInputErrors };

const requiredFields: Array<
  keyof Omit<
    RepairInput,
    | "unlockCodeOrNote"
    | "photos"
    | "customerDropOffSignature"
    | "requestedAppointmentAt"
    | "wantsPriceBeforeDeposit"
  >
> = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "deviceType",
  "brand",
  "model",
  "issueDescription",
];

const fieldLabels: Record<keyof RepairInput, string> = {
  firstName: "Le prenom",
  lastName: "Le nom",
  phone: "Le telephone",
  email: "L'email",
  deviceType: "Le type d'appareil",
  brand: "La marque",
  model: "Le modele",
  issueDescription: "La description du probleme",
  unlockCodeOrNote: "Le code ou la note de deverrouillage",
  photos: "Les photos",
  customerDropOffSignature: "La signature client",
  requestedAppointmentAt: "Le creneau demande",
  wantsPriceBeforeDeposit: "La demande de prix",
};

const textLimits: Partial<Record<keyof RepairInput, number>> = {
  firstName: 80,
  lastName: 80,
  phone: 40,
  email: 254,
  deviceType: 80,
  brand: 80,
  model: 120,
  issueDescription: 5000,
  unlockCodeOrNote: 500,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(source: Record<string, unknown>, key: keyof RepairInput) {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

function readDataUrls(source: Record<string, unknown>, key: keyof RepairInput) {
  const value = source[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function readBoolean(source: Record<string, unknown>, key: keyof RepairInput) {
  return source[key] === true || source[key] === "true";
}

function readOptionalDateString(
  source: Record<string, unknown>,
  key: keyof RepairInput,
) {
  const value = readText(source, key);

  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isImageDataUrl(value: string) {
  return /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(
    value,
  );
}

export function emptyRepairInput(): RepairInput {
  return {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    deviceType: "",
    brand: "",
    model: "",
    issueDescription: "",
    unlockCodeOrNote: "",
    photos: [],
    customerDropOffSignature: "",
    requestedAppointmentAt: "",
    wantsPriceBeforeDeposit: true,
  };
}

export function validateRepairInput(input: unknown): ValidationResult {
  if (!isRecord(input)) {
    return {
      ok: false,
      errors: {
        firstName: "Les donnees envoyees sont invalides.",
      },
    };
  }

  const data: RepairInput = {
    firstName: readText(input, "firstName"),
    lastName: readText(input, "lastName"),
    phone: readText(input, "phone"),
    email: readText(input, "email"),
    deviceType: readText(input, "deviceType"),
    brand: readText(input, "brand"),
    model: readText(input, "model"),
    issueDescription: readText(input, "issueDescription"),
    unlockCodeOrNote: readText(input, "unlockCodeOrNote") || undefined,
    photos: readDataUrls(input, "photos"),
    customerDropOffSignature:
      readText(input, "customerDropOffSignature") || undefined,
    requestedAppointmentAt: readOptionalDateString(input, "requestedAppointmentAt"),
    wantsPriceBeforeDeposit: readBoolean(input, "wantsPriceBeforeDeposit"),
  };

  const errors: RepairInputErrors = {};

  for (const field of requiredFields) {
    if (!data[field]) {
      errors[field] = `${fieldLabels[field]} est requis.`;
    }
  }

  for (const [field, limit] of Object.entries(textLimits) as Array<
    [keyof RepairInput, number]
  >) {
    const value = data[field];

    if (typeof value === "string" && value.length > limit) {
      errors[field] = `${fieldLabels[field]} est trop long (${limit} caracteres maximum).`;
    }
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = "L'email doit etre valide.";
  }

  if (data.phone && data.phone.replace(/\D/g, "").length < 6) {
    errors.phone = "Le telephone doit contenir au moins 6 chiffres.";
  }

  if (data.issueDescription && data.issueDescription.length < 10) {
    errors.issueDescription =
      "La description doit contenir au moins 10 caracteres.";
  }

  if (
    data.photos?.some(
      (photo) => !isImageDataUrl(photo) || photo.length > 700000,
    )
  ) {
    errors.photos = "Ajoutez 3 photos maximum, au format image.";
  }

  if (
    data.customerDropOffSignature &&
    (!isImageDataUrl(data.customerDropOffSignature) ||
      data.customerDropOffSignature.length > 300000)
  ) {
    errors.customerDropOffSignature = "Signature invalide.";
  }

  if (data.requestedAppointmentAt) {
    const requestedAt = new Date(data.requestedAppointmentAt);

    if (
      Number.isNaN(requestedAt.getTime()) ||
      requestedAt <= new Date() ||
      requestedAt.getTime() > Date.now() + 366 * 24 * 60 * 60 * 1000
    ) {
      errors.requestedAppointmentAt = "Choisissez un creneau futur.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data };
}
