export const REPAIR_STATUSES = [
  "PAS_ENCORE_EN_REPARATION",
  "EN_REPARATION",
  "EN_ATTENTE_PIECE",
  "PRET",
  "RECUPERE",
  "ANNULE",
] as const;

export type RepairStatus = (typeof REPAIR_STATUSES)[number];

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
};

export type RepairInputErrors = Partial<Record<keyof RepairInput, string>>;

type ValidationResult =
  | { ok: true; data: RepairInput }
  | { ok: false; errors: RepairInputErrors };

const requiredFields: Array<keyof Omit<RepairInput, "unlockCodeOrNote">> = [
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
  firstName: "Le prénom",
  lastName: "Le nom",
  phone: "Le téléphone",
  email: "L'email",
  deviceType: "Le type d'appareil",
  brand: "La marque",
  model: "Le modèle",
  issueDescription: "La description du problème",
  unlockCodeOrNote: "Le code ou la note de déverrouillage",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(source: Record<string, unknown>, key: keyof RepairInput) {
  const value = source[key];
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
  };
}

export function validateRepairInput(input: unknown): ValidationResult {
  if (!isRecord(input)) {
    return {
      ok: false,
      errors: {
        firstName: "Les données envoyées sont invalides.",
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
  };

  const errors: RepairInputErrors = {};

  for (const field of requiredFields) {
    if (!data[field]) {
      errors[field] = `${fieldLabels[field]} est requis.`;
    }
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = "L'email doit être valide.";
  }

  if (data.phone && data.phone.replace(/\D/g, "").length < 6) {
    errors.phone = "Le téléphone doit contenir au moins 6 chiffres.";
  }

  if (data.issueDescription && data.issueDescription.length < 10) {
    errors.issueDescription =
      "La description doit contenir au moins 10 caractères.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data };
}
