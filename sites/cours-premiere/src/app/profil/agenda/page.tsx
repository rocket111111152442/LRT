import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubjectName, getUserSubjects } from "@/lib/subjects";
import { EventForm } from "./EventForm";
import { deleteEventAction } from "./actions";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AgendaPage() {
  const user = await requireCurrentUser();
  const subjects = getUserSubjects(user.specialtySlugs);

  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({
      where: { userId: user.id, date: { gte: new Date() } },
      orderBy: { date: "asc" },
    }),
    prisma.event.findMany({
      where: { userId: user.id, date: { lt: new Date() } },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Agenda</h1>
        <p className="text-slate-600 mt-1">Cours, devoirs et contrôles à venir.</p>
      </div>

      <EventForm subjects={subjects} />

      <EventList title="À venir" events={upcoming} empty="Aucun événement à venir." />
      <EventList title="Passés" events={past} empty="Aucun événement passé." muted />
    </div>
  );
}

function EventList({
  title,
  events,
  empty,
  muted,
}: {
  title: string;
  events: Array<{
    id: string;
    title: string;
    description: string | null;
    date: Date;
    type: string;
    subjectSlug: string | null;
  }>;
  empty: string;
  muted?: boolean;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-brand-ink">{title}</h2>
      {events.length === 0 ? (
        <p className="text-slate-500 text-sm">{empty}</p>
      ) : (
        <ul className={`divide-y divide-brand-border rounded-xl border border-brand-border bg-brand-card ${muted ? "opacity-70" : ""}`}>
          {events.map((event) => (
            <li key={event.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-brand-ink">{event.title}</p>
                <p className="text-sm text-slate-500">
                  {event.subjectSlug ? getSubjectName(event.subjectSlug) : "Général"} · {event.type}
                  {event.description ? ` — ${event.description}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <time className="text-sm text-slate-500 whitespace-nowrap">
                  {dateFormatter.format(event.date)}
                </time>
                <form action={deleteEventAction}>
                  <input type="hidden" name="eventId" value={event.id} />
                  <button type="submit" className="text-sm text-red-600 hover:underline">
                    Supprimer
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
