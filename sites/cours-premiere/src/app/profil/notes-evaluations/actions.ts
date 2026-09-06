"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidUserSubjectSlug } from "@/lib/subjects";

export type GradeFormState = { error?: string };

export async function createGradeAction(
  _prevState: GradeFormState,
  formData: FormData,
): Promise<GradeFormState> {
  const user = await requireCurrentUser();
  const subjectSlug = String(formData.get("subjectSlug") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const value = Number(formData.get("value"));
  const maxValue = Number(formData.get("maxValue") || 20);
  const coefficient = Number(formData.get("coefficient") || 1);
  const dateRaw = String(formData.get("date") ?? "");

  if (!isValidUserSubjectSlug(user.specialtySlugs, subjectSlug)) {
    return { error: "Matière invalide." };
  }
  if (!label) return { error: "L'intitulé est requis." };
  if (!Number.isFinite(value) || value < 0) return { error: "Note invalide." };
  if (!Number.isFinite(maxValue) || maxValue <= 0) return { error: "Barème invalide." };
  if (value > maxValue) return { error: "La note ne peut pas dépasser le barème." };
  if (!Number.isFinite(coefficient) || coefficient <= 0) return { error: "Coefficient invalide." };

  const date = dateRaw ? new Date(dateRaw) : new Date();
  if (Number.isNaN(date.getTime())) return { error: "Date invalide." };

  await prisma.grade.create({
    data: { userId: user.id, subjectSlug, label, value, maxValue, coefficient, date },
  });

  revalidatePath("/profil/notes-evaluations");
  revalidatePath("/profil");
  return {};
}

export async function deleteGradeAction(formData: FormData): Promise<void> {
  const user = await requireCurrentUser();
  const gradeId = String(formData.get("gradeId") ?? "");

  const existing = await prisma.grade.findUnique({ where: { id: gradeId } });
  if (existing && existing.userId === user.id) {
    await prisma.grade.delete({ where: { id: gradeId } });
  }

  revalidatePath("/profil/notes-evaluations");
  revalidatePath("/profil");
}
