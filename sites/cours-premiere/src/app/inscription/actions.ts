"use server";

import { redirect } from "next/navigation";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidSpecialtySlug, MAX_SPECIALITES } from "@/lib/subjects";

export type SignUpState = { error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUpAction(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const specialtySlugs = formData.getAll("specialites").map(String);

  if (!EMAIL_RE.test(email)) {
    return { error: "Adresse email invalide." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }
  if (password !== confirmPassword) {
    return { error: "Les deux mots de passe ne correspondent pas." };
  }
  if (specialtySlugs.length === 0 || specialtySlugs.length > MAX_SPECIALITES) {
    return { error: `Choisis entre 1 et ${MAX_SPECIALITES} spécialités.` };
  }
  if (!specialtySlugs.every(isValidSpecialtySlug)) {
    return { error: "Spécialité invalide." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cette adresse email." };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: firstName || null,
      specialtySlugs,
    },
  });

  await createSession(user.id);
  redirect("/profil");
}
