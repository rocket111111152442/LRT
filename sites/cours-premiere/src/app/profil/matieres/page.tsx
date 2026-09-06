import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserSubjects } from "@/lib/subjects";

export default async function MatieresPage() {
  const user = await requireCurrentUser();
  const subjects = getUserSubjects(user.specialtySlugs);

  const counts = await prisma.note.groupBy({
    by: ["subjectSlug"],
    where: { userId: user.id },
    _count: { _all: true },
  });
  const countBySlug = new Map(counts.map((c) => [c.subjectSlug, c._count._all]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Matières</h1>
        <p className="text-slate-600 mt-1">
          Adaptées à ta classe et tes spécialités. Modifiable dans les
          paramètres.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subjects.map((subject) => (
          <Link
            key={subject.slug}
            href={`/profil/matieres/${subject.slug}`}
            className="rounded-xl border border-brand-border bg-brand-card px-4 py-4 flex items-center justify-between hover:border-brand-primary transition"
          >
            <span className="font-medium text-brand-ink">{subject.name}</span>
            <span className="text-sm text-slate-500">
              {countBySlug.get(subject.slug) ?? 0} fiche(s)
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
