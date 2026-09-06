import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeAverage } from "@/lib/grades";
import { GradeForm } from "./GradeForm";
import { deleteGradeAction } from "./actions";

export default async function GradesPage() {
  const user = await requireCurrentUser();

  const subjects = await prisma.subject.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    include: { grades: { orderBy: { date: "desc" } } },
  });

  const allGrades = subjects.flatMap((s) => s.grades);
  const generalAverage = computeAverage(allGrades);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Notes & évaluations</h1>
          <p className="text-slate-600 mt-1">Suis ta progression matière par matière.</p>
        </div>
        <div className="rounded-xl border border-brand-border bg-brand-card px-5 py-3 text-center">
          <p className="text-2xl font-bold text-brand-ink">
            {generalAverage !== null ? generalAverage.toFixed(2) : "—"}/20
          </p>
          <p className="text-sm text-slate-500">Moyenne générale</p>
        </div>
      </div>

      <GradeForm subjects={subjects} />

      <div className="space-y-6">
        {subjects.map((subject) => {
          if (subject.grades.length === 0) return null;
          const average = computeAverage(subject.grades);

          return (
            <section key={subject.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-brand-ink">{subject.name}</h2>
                <span className="text-sm font-medium text-slate-600">
                  Moyenne : {average !== null ? average.toFixed(2) : "—"}/20
                </span>
              </div>
              <ul className="divide-y divide-brand-border rounded-xl border border-brand-border bg-brand-card">
                {subject.grades.map((grade) => (
                  <li key={grade.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-brand-ink">{grade.label}</p>
                      <p className="text-sm text-slate-500">
                        {new Intl.DateTimeFormat("fr-FR").format(grade.date)} · coeff.{" "}
                        {grade.coefficient}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-brand-ink">
                        {grade.value}/{grade.maxValue}
                      </span>
                      <form action={deleteGradeAction}>
                        <input type="hidden" name="gradeId" value={grade.id} />
                        <button type="submit" className="text-sm text-red-600 hover:underline">
                          Supprimer
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {allGrades.length === 0 && (
          <p className="text-slate-500 text-sm">Aucune note enregistrée pour l&apos;instant.</p>
        )}
      </div>
    </div>
  );
}
