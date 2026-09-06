import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeAverage } from "@/lib/grades";

export default async function DashboardPage() {
  const user = await requireCurrentUser();

  const [subjects, upcomingEvents, recentGrades, notesCount, documentsCount] = await Promise.all([
    prisma.subject.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.event.findMany({
      where: { userId: user.id, date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 5,
      include: { subject: true },
    }),
    prisma.grade.findMany({
      where: { subject: { userId: user.id } },
      orderBy: { date: "desc" },
      take: 20,
    }),
    prisma.note.count({ where: { subject: { userId: user.id } } }),
    prisma.document.count({ where: { userId: user.id } }),
  ]);

  const generalAverage = computeAverage(recentGrades);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">
          Salut{user.firstName ? `, ${user.firstName}` : ""} 👋
        </h1>
        <p className="text-slate-600 mt-1">
          {user.classe ? `${user.classe} — ` : ""}
          {subjects.length} matière{subjects.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Fiches de cours" value={String(notesCount)} href="/profil/matieres" />
        <StatCard
          label="Moyenne générale"
          value={generalAverage !== null ? `${generalAverage.toFixed(1)}/20` : "—"}
          href="/profil/notes-evaluations"
        />
        <StatCard
          label="Prochains événements"
          value={String(upcomingEvents.length)}
          href="/profil/agenda"
        />
        <StatCard label="Documents" value={String(documentsCount)} href="/profil/documents" />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-ink">À venir</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-slate-500 text-sm">
            Rien de prévu.{" "}
            <Link href="/profil/agenda" className="text-brand-primary">
              Ajouter un événement
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-brand-border rounded-xl border border-brand-border bg-brand-card">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-brand-ink">{event.title}</p>
                  <p className="text-sm text-slate-500">
                    {event.subject?.name ?? "Général"} · {event.type}
                  </p>
                </div>
                <time className="text-sm text-slate-500 whitespace-nowrap">
                  {new Intl.DateTimeFormat("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(event.date)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-ink">Tes matières</h2>
          <Link href="/profil/matieres" className="text-sm text-brand-primary">
            Gérer
          </Link>
        </div>
        {subjects.length === 0 ? (
          <p className="text-slate-500 text-sm">
            Aucune matière pour l&apos;instant.{" "}
            <Link href="/profil/matieres" className="text-brand-primary">
              En ajouter une
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/profil/matieres/${subject.id}`}
                className="rounded-lg border border-brand-border bg-brand-card px-4 py-3 hover:border-brand-primary transition"
              >
                <span className="text-sm font-medium text-brand-ink">{subject.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-brand-border bg-brand-card px-4 py-4 hover:border-brand-primary transition"
    >
      <p className="text-2xl font-bold text-brand-ink">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </Link>
  );
}
