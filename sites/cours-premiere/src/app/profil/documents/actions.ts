"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidUserSubjectSlug } from "@/lib/subjects";

export type DocumentFormState = { error?: string };

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4 Mo, sous la limite des fonctions serverless.

export async function uploadDocumentAction(
  _prevState: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  const user = await requireCurrentUser();
  const subjectSlug = String(formData.get("subjectSlug") ?? "");
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choisis un fichier." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: "Fichier trop volumineux (4 Mo maximum)." };
  }
  if (subjectSlug && !isValidUserSubjectSlug(user.specialtySlugs, subjectSlug)) {
    return { error: "Matière invalide." };
  }

  const arrayBuffer = await file.arrayBuffer();

  await prisma.document.create({
    data: {
      userId: user.id,
      subjectSlug: subjectSlug || null,
      filename: file.name || "document",
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      data: Buffer.from(arrayBuffer),
    },
  });

  revalidatePath("/profil/documents");
  revalidatePath("/profil");
  return {};
}

export async function deleteDocumentAction(formData: FormData): Promise<void> {
  const user = await requireCurrentUser();
  const documentId = String(formData.get("documentId") ?? "");

  const existing = await prisma.document.findUnique({ where: { id: documentId } });
  if (existing && existing.userId === user.id) {
    await prisma.document.delete({ where: { id: documentId } });
  }

  revalidatePath("/profil/documents");
  revalidatePath("/profil");
}
