import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubjectName, isValidUserSubjectSlug } from "@/lib/subjects";
import { NoteForm } from "../NoteForm";
import { deleteNoteAction } from "../actions";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ slug: string; noteId: string }>;
}) {
  const { slug, noteId } = await params;
  const user = await requireCurrentUser();
  if (!isValidUserSubjectSlug(user.specialtySlugs, slug)) notFound();

  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note || note.userId !== user.id || note.subjectSlug !== slug) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-ink">{getSubjectName(slug)}</h1>
        <form action={deleteNoteAction}>
          <input type="hidden" name="noteId" value={note.id} />
          <input type="hidden" name="subjectSlug" value={slug} />
          <button
            type="submit"
            className="text-sm text-red-600 hover:underline"
          >
            Supprimer la fiche
          </button>
        </form>
      </div>
      <NoteForm subjectSlug={slug} mode="edit" note={{ id: note.id, title: note.title, content: note.content }} />
    </div>
  );
}
