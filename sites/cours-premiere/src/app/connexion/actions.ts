"use server";

import { redirect } from "next/navigation";
import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SignInState = { error?: string };

export async function signInAction(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/profil");

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !valid) {
    return { error: "Email ou mot de passe incorrect." };
  }

  await createSession(user.id);
  redirect(next.startsWith("/") ? next : "/profil");
}
