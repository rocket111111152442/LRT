export const REPAIR_STATUSES = [
  "PAS_ENCORE_EN_REPARATION",
  "EN_REPARATION",
  "EN_ATTENTE_PIECE",
  "PRET",
  "RECUPERE",
  "ANNULE",
] as const;

export const PART_STATUSES = ["NONE", "ORDERED", "RECEIVED", "INSTALLED"] as const;

export type RepairStatus = (typeof REPAIR_STATUSES)[number];
export type PartStatus = (typeof PART_STATUSES)[number];

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
};

export type RepairInputErrors = Partial<Record<keyof RepairInput, string>>;

type ValidationResult =
  | { ok: true; data: RepairInput }
  | { ok: false; errors: RepairInputErrors };

const requiredFields: Array<
  keyof Omit<RepairInput, "unlockCodeOrNote" | "photos" | "customerDropOffSignature">
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

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isImageDataUrl(value: string) {
  return /^data:image\/(png|jpeg|jpg|webp);base64,/.test(value);
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
  };

  const errors: RepairInputErrors = {};

  for (const field of requiredFields) {
    if (!data[field]) {
      errors[field] = `${fieldLabels[field]} est requis.`;
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

  if (data.photos?.some((photo) => !isImageDataUrl(photo) || photo.length > 700000)) {
    errors.photos = "Ajoutez 3 photos maximum, au format image.";
  }

  if (
    data.customerDropOffSignature &&
    (!isImageDataUrl(data.customerDropOffSignature) ||
      data.customerDropOffSignature.length > 300000)
  ) {
    errors.customerDropOffSignature = "Signature invalide.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data };
}
