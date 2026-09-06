import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubjectName, isValidUserSubjectSlug } from "@/lib/subjects";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireCurrentUser();
  if (!isValidUserSubjectSlug(user.specialtySlugs, slug)) notFound();

  const notes = await prisma.note.findMany({
    where: { userId: user.id, subjectSlug: slug },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/profil/matieres" className="text-sm text-brand-primary">
            ← Matières
          </Link>
          <h1 className="text-2xl font-bold text-brand-ink">{getSubjectName(slug)}</h1>
        </div>
        <Link
          href={`/profil/matieres/${slug}/nouvelle`}
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-dark transition"
        >
          + Nouvelle fiche
        </Link>
      </div>

      {notes.length === 0 ? (
        <p className="text-slate-500 text-sm">Aucune fiche pour cette matière pour l&apos;instant.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note.id}>
              <Link
                href={`/profil/matieres/${slug}/${note.id}`}
                className="block rounded-xl border border-brand-border bg-brand-card px-4 py-3 hover:border-brand-primary transition"
              >
                <p className="font-medium text-brand-ink">{note.title}</p>
                <p className="text-sm text-slate-500 truncate">
                  {note.content.slice(0, 120) || "(vide)"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
