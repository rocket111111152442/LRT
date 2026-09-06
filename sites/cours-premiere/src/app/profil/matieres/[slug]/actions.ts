"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidUserSubjectSlug } from "@/lib/subjects";

export type NoteFormState = { error?: string };

async function assertOwnedSubject(subjectSlug: string) {
  const user = await requireCurrentUser();
  if (!isValidUserSubjectSlug(user.specialtySlugs, subjectSlug)) {
    return { user, ok: false as const };
  }
  return { user, ok: true as const };
}

export async function createNoteAction(
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const subjectSlug = String(formData.get("subjectSlug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  const { user, ok } = await assertOwnedSubject(subjectSlug);
  if (!ok) return { error: "Matière invalide." };
  if (!title) return { error: "Le titre est requis." };

  const note = await prisma.note.create({
    data: { userId: user.id, subjectSlug, title, content },
  });

  revalidatePath(`/profil/matieres/${subjectSlug}`);
  redirect(`/profil/matieres/${subjectSlug}/${note.id}`);
}

export async function updateNoteAction(
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const noteId = String(formData.get("noteId") ?? "");
  const subjectSlug = String(formData.get("subjectSlug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  const { user, ok } = await assertOwnedSubject(subjectSlug);
  if (!ok) return { error: "Matière invalide." };
  if (!title) return { error: "Le titre est requis." };

  const existing = await prisma.note.findUnique({ where: { id: noteId } });
  if (!existing || existing.userId !== user.id) {
    return { error: "Fiche introuvable." };
  }

  await prisma.note.update({ where: { id: noteId }, data: { title, content } });
  revalidatePath(`/profil/matieres/${subjectSlug}`);
  revalidatePath(`/profil/matieres/${subjectSlug}/${noteId}`);
  return {};
}

export async function deleteNoteAction(formData: FormData): Promise<void> {
  const noteId = String(formData.get("noteId") ?? "");
  const subjectSlug = String(formData.get("subjectSlug") ?? "");
  const user = await requireCurrentUser();

  const existing = await prisma.note.findUnique({ where: { id: noteId } });
  if (existing && existing.userId === user.id) {
    await prisma.note.delete({ where: { id: noteId } });
  }

  revalidatePath(`/profil/matieres/${subjectSlug}`);
  redirect(`/profil/matieres/${subjectSlug}`);
}
