import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubjectForm } from "./SubjectForm";
import { deleteSubjectAction } from "./actions";

export default async function MatieresPage() {
  const user = await requireCurrentUser();

  const subjects = await prisma.subject.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { notes: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Matières</h1>
        <p className="text-slate-600 mt-1">
          Ajoute les matières de ton année — quel que soit ton niveau.
        </p>
      </div>

      <SubjectForm />

      {subjects.length === 0 ? (
        <p className="text-slate-500 text-sm">Aucune matière pour l&apos;instant.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="rounded-xl border border-brand-border bg-brand-card px-4 py-4 flex items-center justify-between gap-3"
            >
              <Link
                href={`/profil/matieres/${subject.id}`}
                className="flex-1 hover:text-brand-primary transition"
              >
                <span className="font-medium text-brand-ink">{subject.name}</span>
                <span className="block text-sm text-slate-500">
                  {subject._count.notes} fiche(s)
                </span>
              </Link>
              <form action={deleteSubjectAction}>
                <input type="hidden" name="subjectId" value={subject.id} />
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Supprimer
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
