"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser, verifyPassword, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ProfileFormState = { error?: string; success?: string };

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireCurrentUser();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const classe = String(formData.get("classe") ?? "").trim();

  await prisma.user.update({
    where: { id: user.id },
    data: { firstName: firstName || null, classe: classe || null },
  });

  revalidatePath("/profil");
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
