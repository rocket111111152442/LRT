import Link from "next/link";
import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function dayKey(value: Date | null) {
  const date = value ?? new Date();
  return date.toISOString().slice(0, 10);
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(`${value}T12:00:00`));
}

function formatTime(value: Date | null) {
  if (!value) {
    return "Sans heure";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AdminAgendaPage() {
  const admin = await requireAdminPage();
  const repairs = await prisma.repair.findMany({
    where: {
      ...(admin.proAccountId ? { proAccountId: admin.proAccountId } : {}),
      archivedAt: null,
      status: { notIn: ["RECUPERE", "ANNULE"] },
    },
    orderBy: [{ expectedPickupAt: "asc" }, { urgent: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      ticketNumber: true,
      firstName: true,
      lastName: true,
      deviceType: true,
      brand: true,
      model: true,
      status: true,
      urgent: true,
      expectedPickupAt: true,
      technicianName: true,
    },
  });

  const groupedRepairs = repairs.reduce<Record<string, typeof repairs>>(
    (groups, repair) => {
      const key = dayKey(repair.expectedPickupAt);
      groups[key] = groups[key] ?? [];
      groups[key].push(repair);
      return groups;
    },
    {},
  );

  const dayEntries = Object.entries(groupedRepairs).sort(([left], [right]) =>
    left.localeCompare(right),
  );

  return (
    <>
      <AdminHeader email={admin.email} />
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6">
          <header className="grid gap-2">
            <h1 className="text-3xl font-semibold text-slate-950">
              Agenda des reparations
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              Les reparations sont regroupees par date prevue de recuperation.
              Les dossiers sans date restent visibles pour ne rien oublier.
            </p>
          </header>

          <section className="grid gap-4">
            {dayEntries.map(([day, dayRepairs]) => (
              <article
                key={day}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              >
                <header className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <h2 className="text-base font-semibold capitalize text-slate-950">
                    {formatDay(day)}
                  </h2>
                </header>
                <div className="divide-y divide-slate-100">
                  {dayRepairs.map((repair) => (
                    <Link
                      key={repair.id}
                      href={`/admin/repairs/${repair.id}`}
                      className="grid gap-2 px-4 py-3 transition hover:bg-slate-50 sm:grid-cols-[90px_1fr_auto] sm:items-center"
                    >
                      <span className="text-sm font-semibold text-slate-950">
                        {formatTime(repair.expectedPickupAt)}
                      </span>
                      <span className="text-sm text-slate-700">
                        <strong className="text-slate-950">
                          {repair.ticketNumber ?? repair.id.slice(0, 8)}
                        </strong>{" "}
                        - {repair.firstName} {repair.lastName} -{" "}
                        {repair.deviceType} {repair.brand} {repair.model}
                      </span>
                      <span className="flex flex-wrap gap-2 text-xs font-semibold">
                        {repair.urgent ? (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">
                            Urgent
                          </span>
                        ) : null}
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                          {repair.status}
                        </span>
                        {repair.technicianName ? (
                          <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-700">
                            {repair.technicianName}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  ))}
                </div>
              </article>
            ))}

            {dayEntries.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                Aucune reparation active dans l&apos;agenda.
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </>
  );
}
