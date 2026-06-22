import type { Metadata } from "next";
export const metadata: Metadata = { title: "Agenda — Qoravo Admin" };
import { AdminHeader } from "../AdminHeader";
import { AdminAgendaCalendar } from "./AdminAgendaCalendar";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function readDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function readDateString(value: unknown) {
  return readDate(value)?.toISOString() ?? null;
}

function compareNullableDates(left: unknown, right: unknown) {
  const leftDate = readDate(left);
  const rightDate = readDate(right);

  if (!leftDate && !rightDate) {
    return 0;
  }

  if (!leftDate) {
    return 1;
  }

  if (!rightDate) {
    return -1;
  }

  return leftDate.getTime() - rightDate.getTime();
}

export default async function AdminAgendaPage() {
  const admin = await requireAdminPage();
  const repairs = await prisma.repair.findMany({
    where: {
      ...(admin.proAccountId ? { proAccountId: admin.proAccountId } : {}),
    },
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
      archivedAt: true,
      createdAt: true,
    },
  });
  const activeRepairs = repairs
    .filter(
      (repair) =>
        !readDate(repair.archivedAt) &&
        !["RECUPERE", "ANNULE"].includes(String(repair.status)),
    )
    .sort((left, right) => {
      const scheduledOrder = compareNullableDates(
        left.expectedPickupAt,
        right.expectedPickupAt,
      );

      if (scheduledOrder !== 0) {
        return scheduledOrder;
      }

      if (left.urgent !== right.urgent) {
        return left.urgent ? -1 : 1;
      }

      return compareNullableDates(left.createdAt, right.createdAt);
    });

  return (
    <>
      <AdminHeader
        email={admin.email}
        supportIncluded={admin.supportIncluded}
        paymentStatus={admin.paymentStatus}
        trialEndsAt={admin.trialEndsAt}
        proAccountSlug={admin.proAccountSlug}
      />
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
            repairs={activeRepairs.map((repair) => ({
              id: repair.id,
              ticketNumber: repair.ticketNumber,
              firstName: repair.firstName,
              lastName: repair.lastName,
              deviceType: repair.deviceType,
              brand: repair.brand,
              model: repair.model,
              status: String(repair.status),
              quoteStatus: String(repair.quoteStatus),
              urgent: repair.urgent,
              expectedPickupAt: readDateString(repair.expectedPickupAt),
              technicianName: repair.technicianName,
            }))}
          />
        </div>
      </main>
    </>
  );
}
