import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserSubjects } from "@/lib/subjects";
import { computeAverage } from "@/lib/grades";
import { GradeForm } from "./GradeForm";
import { deleteGradeAction } from "./actions";

export default async function GradesPage() {
  const user = await requireCurrentUser();
  const subjects = getUserSubjects(user.specialtySlugs);

  const grades = await prisma.grade.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  const generalAverage = computeAverage(grades);
  const gradesBySubject = new Map<string, typeof grades>();
  for (const grade of grades) {
    const list = gradesBySubject.get(grade.subjectSlug) ?? [];
    list.push(grade);
    gradesBySubject.set(grade.subjectSlug, list);
  }

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
          const subjectGrades = gradesBySubject.get(subject.slug) ?? [];
          if (subjectGrades.length === 0) return null;
          const average = computeAverage(subjectGrades);

          return (
            <section key={subject.slug} className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-brand-ink">{subject.name}</h2>
                <span className="text-sm font-medium text-slate-600">
                  Moyenne : {average !== null ? average.toFixed(2) : "—"}/20
                </span>
              </div>
              <ul className="divide-y divide-brand-border rounded-xl border border-brand-border bg-brand-card">
                {subjectGrades.map((grade) => (
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
        {grades.length === 0 && (
          <p className="text-slate-500 text-sm">Aucune note enregistrée pour l&apos;instant.</p>
        )}
      </div>
    </div>
  );
}
