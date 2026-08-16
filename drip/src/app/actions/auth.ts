"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  generateToken,
  getCurrentUser,
  hashPassword,
  hashToken,
  verifyPassword,
} from "@/lib/auth";
import { mergeGuestCartInto } from "@/lib/cart";
import { limitByIp } from "@/lib/rateLimit";
import {
  fieldErrors,
  forgotPasswordSchema,
  loginSchema,
  passwordChangeSchema,
  profileSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validation";

export type FormState = {
  errors?: Record<string, string>;
  message?: string;
  success?: boolean;
};

/** Empêche une redirection ouverte : on n'accepte que des chemins internes. */
function safeRedirect(target: string | null | undefined) {
  if (!target) return "/compte";
  if (!target.startsWith("/") || target.startsWith("//")) return "/compte";
  return target;
}

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const limit = await limitByIp("register", 5, 900);

  if (!limit.ok) {
    return { errors: { form: "Trop de tentatives. Réessayez dans quelques minutes." } };
  }

  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName") ?? "",
    email: formData.get("email"),
    password: formData.get("password"),
    acceptsMarketing: formData.get("acceptsMarketing") === "on",
    acceptsTerms: formData.get("acceptsTerms") === "on",
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existing) {
    return {
      errors: { email: "Un compte existe déjà avec cette adresse." },
    };
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName || null,
      acceptsMarketing: Boolean(parsed.data.acceptsMarketing),
      lastLoginAt: new Date(),
    },
  });

  if (parsed.data.acceptsMarketing) {
    await prisma.newsletterSubscriber.upsert({
      where: { email: user.email },
      create: { email: user.email, source: "inscription" },
      update: {},
    });
  }

  await createSession(user.id);
  await mergeGuestCartInto(user.id);

  redirect(safeRedirect(formData.get("suite") as string | null));
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const limit = await limitByIp("login", 10, 600);

  if (!limit.ok) {
    return { errors: { form: "Trop de tentatives. Réessayez dans quelques minutes." } };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  // Message identique que l'e-mail existe ou non : sans cela, le formulaire
  // permettrait d'énumérer les comptes clients.
  const invalid = { errors: { form: "E-mail ou mot de passe incorrect." } };

  if (!user) {
    // Coût de hachage payé quand même, pour que le temps de réponse ne trahisse
    // pas l'existence du compte.
    await verifyPassword(parsed.data.password, "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin");
    return invalid;
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return invalid;

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession(user.id);
  await mergeGuestCartInto(user.id);

  const suite = safeRedirect(formData.get("suite") as string | null);
  redirect(user.role === "ADMIN" && suite === "/compte" ? "/admin" : suite);
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const limit = await limitByIp("forgot", 5, 900);

  if (!limit.ok) {
    return { errors: { form: "Trop de demandes. Réessayez plus tard." } };
  }

  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (user) {
    const token = generateToken();

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    // L'envoi d'e-mail n'est pas branché : le lien est journalisé côté serveur
    // en attendant la configuration SMTP (voir README).
    console.info(
      `[drip] lien de réinitialisation pour ${parsed.data.email} : /reinitialiser-mot-de-passe?token=${token}`,
    );
  }

  // Réponse identique dans tous les cas : on ne révèle pas si l'adresse est
  // rattachée à un compte.
  return {
    success: true,
    message:
      "Si un compte existe pour cette adresse, un lien de réinitialisation vient d'être envoyé.",
  };
}

export async function resetPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { errors: { form: "Ce lien est expiré ou a déjà été utilisé." } };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        passwordHash: await hashPassword(parsed.data.password),
        // Invalide les sessions ouvertes ailleurs après un changement de mot
        // de passe.
        sessionsValidFrom: new Date(),
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect("/connexion?reinitialise=1");
}

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { errors: { form: "Session expirée." } };

  const parsed = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName") ?? "",
    phone: formData.get("phone") ?? "",
    acceptsMarketing: formData.get("acceptsMarketing") === "on",
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName || null,
      phone: parsed.data.phone || null,
      acceptsMarketing: Boolean(parsed.data.acceptsMarketing),
    },
  });

  revalidatePath("/compte");
  return { success: true, message: "Informations enregistrées." };
}

export async function changePasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { errors: { form: "Session expirée." } };

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!record) return { errors: { form: "Compte introuvable." } };

  const valid = await verifyPassword(parsed.data.currentPassword, record.passwordHash);

  if (!valid) {
    return { errors: { currentPassword: "Mot de passe actuel incorrect." } };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      sessionsValidFrom: new Date(),
    },
  });

  // La session courante a été émise avant sessionsValidFrom : on en recrée une
  // pour ne pas déconnecter la personne qui vient de changer son mot de passe.
  await createSession(user.id);

  return { success: true, message: "Mot de passe mis à jour." };
}
