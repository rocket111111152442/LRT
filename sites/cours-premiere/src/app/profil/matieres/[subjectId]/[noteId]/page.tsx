import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NoteForm } from "../NoteForm";
import { deleteNoteAction } from "../actions";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ subjectId: string; noteId: string }>;
}) {
  const { subjectId, noteId } = await params;
  const user = await requireCurrentUser();

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject || subject.userId !== user.id) notFound();

  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note || note.subjectId !== subjectId) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-ink">{subject.name}</h1>
        <form action={deleteNoteAction}>
          <input type="hidden" name="noteId" value={note.id} />
          <input type="hidden" name="subjectId" value={subjectId} />
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Supprimer la fiche
          </button>
        </form>
      </div>
      <NoteForm subjectId={subjectId} mode="edit" note={{ id: note.id, title: note.title, content: note.content }} />
    </div>
  );
}
