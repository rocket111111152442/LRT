import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NoteForm } from "../NoteForm";

export default async function NewNotePage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const user = await requireCurrentUser();

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject || subject.userId !== user.id) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-ink">Nouvelle fiche — {subject.name}</h1>
      <NoteForm subjectId={subjectId} mode="create" />
    </div>
  );
}
