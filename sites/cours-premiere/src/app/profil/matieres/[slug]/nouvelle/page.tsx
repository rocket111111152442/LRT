import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth";
import { getSubjectName, isValidUserSubjectSlug } from "@/lib/subjects";
import { NoteForm } from "../NoteForm";

export default async function NewNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireCurrentUser();
  if (!isValidUserSubjectSlug(user.specialtySlugs, slug)) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-ink">
        Nouvelle fiche — {getSubjectName(slug)}
      </h1>
      <NoteForm subjectSlug={slug} mode="create" />
    </div>
  );
}
