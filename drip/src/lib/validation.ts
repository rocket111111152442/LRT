import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, "Adresse e-mail invalide.")
  .max(180, "Adresse e-mail trop longue.")
  .email("Adresse e-mail invalide.");

// 10 caractères minimum : au-delà de la longueur, on refuse surtout les mots de
// passe évidents plutôt que d'imposer des règles de composition illisibles.
const password = z
  .string()
  .min(10, "Le mot de passe doit contenir au moins 10 caractères.")
  .max(200, "Mot de passe trop long.");

const WEAK_PASSWORDS = new Set([
  "motdepasse",
  "password12",
  "azertyuiop",
  "1234567890",
  "qwertyuiop",
  "motdepasse1",
  "password123",
]);

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis.").max(80),
  lastName: z.string().trim().max(80).optional().or(z.literal("")),
  email,
  password: password.refine(
    (value) => !WEAK_PASSWORDS.has(value.toLowerCase()),
    "Ce mot de passe est trop courant.",
  ),
  acceptsMarketing: z.boolean().optional(),
  acceptsTerms: z.literal(true, {
    message: "Vous devez accepter les conditions générales de vente.",
  }),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Mot de passe requis.").max(200),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().min(10).max(200),
  password,
});

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis.").max(80),
  lastName: z.string().trim().max(80).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  acceptsMarketing: z.boolean().optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis."),
  password,
});

export const addressSchema = z.object({
  label: z.string().trim().max(40).optional().or(z.literal("")),
  fullName: z.string().trim().min(2, "Nom complet requis.").max(120),
  line1: z.string().trim().min(3, "Adresse requise.").max(180),
  line2: z.string().trim().max(180).optional().or(z.literal("")),
  postalCode: z.string().trim().min(2, "Code postal requis.").max(20),
  city: z.string().trim().min(1, "Ville requise.").max(120),
  country: z.string().trim().length(2, "Pays invalide.").toUpperCase(),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  isDefault: z.boolean().optional(),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  orderId: z.string().min(1).optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1, "Note requise.").max(5),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  body: z
    .string()
    .trim()
    .min(10, "Votre avis doit faire au moins 10 caractères.")
    .max(2000, "Votre avis ne peut pas dépasser 2000 caractères."),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Nom requis.").max(120),
  email,
  subject: z.string().trim().min(2, "Sujet requis.").max(160),
  message: z
    .string()
    .trim()
    .min(10, "Votre message doit faire au moins 10 caractères.")
    .max(4000),
});

export const newsletterSchema = z.object({
  email,
  source: z.string().trim().max(60).optional(),
});

/** Transforme une erreur zod en dictionnaire champ -> message. */
export function fieldErrors(error: z.ZodError) {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!result[key]) result[key] = issue.message;
  }

  return result;
}
