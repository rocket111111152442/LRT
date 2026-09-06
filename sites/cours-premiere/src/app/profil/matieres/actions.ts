"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SubjectFormState = { error?: string };

export async function createSubjectAction(
  _prevState: SubjectFormState,
  formData: FormData,
): Promise<SubjectFormState> {
  const user = await requireCurrentUser();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) return { error: "Le nom de la matière est requis." };

  await prisma.subject.create({ data: { userId: user.id, name } });

  revalidatePath("/profil/matieres");
  revalidatePath("/profil");
  return {};
}

export async function deleteSubjectAction(formData: FormData): Promise<void> {
  const user = await requireCurrentUser();
  const subjectId = String(formData.get("subjectId") ?? "");

  const existing = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (existing && existing.userId === user.id) {
    await prisma.subject.delete({ where: { id: subjectId } });
  }

  revalidatePath("/profil/matieres");
  revalidatePath("/profil");
}
