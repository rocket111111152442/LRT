"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type NoteFormState = { error?: string };

async function assertOwnedSubject(subjectId: string) {
  const user = await requireCurrentUser();
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject || subject.userId !== user.id) {
    return { user, ok: false as const };
  }
  return { user, ok: true as const };
}

export async function createNoteAction(
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const subjectId = String(formData.get("subjectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  const { ok } = await assertOwnedSubject(subjectId);
  if (!ok) return { error: "Matière invalide." };
  if (!title) return { error: "Le titre est requis." };

  const note = await prisma.note.create({
    data: { subjectId, title, content },
  });

  revalidatePath(`/profil/matieres/${subjectId}`);
  redirect(`/profil/matieres/${subjectId}/${note.id}`);
}

export async function updateNoteAction(
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const noteId = String(formData.get("noteId") ?? "");
  const subjectId = String(formData.get("subjectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  const { ok } = await assertOwnedSubject(subjectId);
  if (!ok) return { error: "Matière invalide." };
  if (!title) return { error: "Le titre est requis." };

  const existing = await prisma.note.findUnique({ where: { id: noteId } });
  if (!existing || existing.subjectId !== subjectId) {
    return { error: "Fiche introuvable." };
  }

  await prisma.note.update({ where: { id: noteId }, data: { title, content } });
  revalidatePath(`/profil/matieres/${subjectId}`);
  revalidatePath(`/profil/matieres/${subjectId}/${noteId}`);
  return {};
}

export async function deleteNoteAction(formData: FormData): Promise<void> {
  const noteId = String(formData.get("noteId") ?? "");
  const subjectId = String(formData.get("subjectId") ?? "");
  const { ok } = await assertOwnedSubject(subjectId);

  if (ok) {
    const existing = await prisma.note.findUnique({ where: { id: noteId } });
    if (existing && existing.subjectId === subjectId) {
      await prisma.note.delete({ where: { id: noteId } });
    }
  }

  revalidatePath(`/profil/matieres/${subjectId}`);
  redirect(`/profil/matieres/${subjectId}`);
}
