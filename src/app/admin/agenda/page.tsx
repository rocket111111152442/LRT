import { AdminHeader } from "../AdminHeader";
import { AdminAgendaCalendar } from "./AdminAgendaCalendar";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
      quoteStatus: true,
      urgent: true,
      expectedPickupAt: true,
      technicianName: true,
    },
  });

  return (
    <>
      <AdminHeader email={admin.email} supportIncluded={admin.supportIncluded} />
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6">
          <header className="grid gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
              Planning atelier
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              Agenda des reparations
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Visualisez le mois, ouvrez une fiche par jour et placez les devis
              ou reparations sans creneau dans un rendez-vous precis.
            </p>
          </header>

          <AdminAgendaCalendar
            repairs={repairs.map((repair) => ({
              ...repair,
              status: String(repair.status),
              quoteStatus: String(repair.quoteStatus),
              expectedPickupAt: repair.expectedPickupAt?.toISOString() ?? null,
            }))}
          />
        </div>
      </main>
    </>
  );
}
