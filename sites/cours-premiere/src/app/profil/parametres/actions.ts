"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser, verifyPassword, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidSpecialtySlug, MAX_SPECIALITES } from "@/lib/subjects";

export type ProfileFormState = { error?: string; success?: string };

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireCurrentUser();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const specialtySlugs = formData.getAll("specialites").map(String);

  if (specialtySlugs.length === 0 || specialtySlugs.length > MAX_SPECIALITES) {
    return { error: `Choisis entre 1 et ${MAX_SPECIALITES} spécialités.` };
  }
  if (!specialtySlugs.every(isValidSpecialtySlug)) {
    return { error: "Spécialité invalide." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { firstName: firstName || null, specialtySlugs },
  });

  revalidatePath("/profil");
  revalidatePath("/profil/matieres");
  revalidatePath("/profil/parametres");
  return { success: "Profil mis à jour." };
}

export async function changePasswordAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireCurrentUser();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return { error: "Mot de passe actuel incorrect." };
  if (newPassword.length < 8) {
    return { error: "Le nouveau mot de passe doit contenir au moins 8 caractères." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Les deux mots de passe ne correspondent pas." };
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: "Mot de passe modifié." };
}
