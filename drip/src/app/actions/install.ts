"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { checkInstallKey, readInstallState, runSchema } from "@/lib/install";
import { registerSchema } from "@/lib/validation";
import { fieldErrors } from "@/lib/validation";
import type { FormState } from "@/lib/formAction";

/**
 * Les deux actions refusent de s'exécuter dès qu'un compte existe : passé ce
 * point l'installation est terminée et la page n'est plus une porte ouverte.
 */
async function assertOuverte(cle: string | null) {
  if (!checkInstallKey(cle)) {
    throw new Error("Clé d'installation invalide.");
  }

  const etat = await readInstallState();
  if (!etat.ouverte) {
    throw new Error("Installation déjà effectuée.");
  }
  return etat;
}

export async function createTablesAction(cle: string): Promise<FormState> {
  try {
    await assertOuverte(cle);
    await runSchema();
    revalidatePath("/installation");
    return { success: true, message: "Les tables sont en place." };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[installation] création des tables :", error);
    return {
      errors: {
        form:
          error instanceof Error
            ? error.message
            : "La création des tables a échoué.",
      },
    };
  }
}

export async function createAdminAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const etat = await assertOuverte(
      typeof formData.get("cle") === "string" ? String(formData.get("cle")) : null,
    );

    if (!etat.tablesCreees) {
      return { errors: { form: "Créez d'abord les tables (étape au-dessus)." } };
    }

    const parsed = registerSchema.safeParse({
      firstName: formData.get("firstName"),
      lastName: "",
      email: formData.get("email"),
      password: formData.get("password"),
      acceptsMarketing: false,
      acceptsTerms: true,
    });

    if (!parsed.success) {
      return {
        errors: fieldErrors(parsed.error),
        values: {
          firstName: String(formData.get("firstName") ?? ""),
          email: String(formData.get("email") ?? ""),
        },
      };
    }

    await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash: await hashPassword(parsed.data.password),
        firstName: parsed.data.firstName,
        role: "ADMIN",
      },
    });

    revalidatePath("/installation");
    return {
      success: true,
      message: "Compte administrateur créé. Vous pouvez vous connecter.",
    };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[installation] création de l'administrateur :", error);
    return { errors: { form: "La création du compte a échoué." } };
  }
}
