import type { Metadata } from "next";
import { AdminHeader } from "./AdminHeader";

export const metadata: Metadata = { title: "Réparations — Qoravo Admin" };
import { AdminRepairsClient } from "./AdminRepairsClient";
import { AdminStatsClient } from "./AdminStatsClient";
import { ClientErrorBoundary } from "@/components/ClientErrorBoundary";
import { requireAdminPage } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminSetupChecklist } from "./AdminSetupChecklist";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdminPage();
  const account = admin.proAccountId
    ? await prisma.proAccount.findUnique({
        where: { id: admin.proAccountId },
        select: {
          shopAddress: true,
          shopCity: true,
          shopCountry: true,
          shopPhone: true,
          shopOpeningHours: true,
        },
      })
    : null;
  const firstRepair = admin.proAccountId
    ? await prisma.repair.findFirst({
        where: { proAccountId: admin.proAccountId },
        select: { id: true },
      })
    : null;
  const emailSettings = admin.proAccountId
    ? await prisma.emailSettings.findUnique({
        where: { id: admin.proAccountId },
        select: { smtpEmail: true, smtpAppPassword: true },
      })
    : null;
  const profileComplete = Boolean(
    account?.shopAddress &&
      account.shopCity &&
      account.shopCountry &&
      account.shopPhone &&
      account.shopOpeningHours,
  );
  const emailConfigured = Boolean(
    emailSettings?.smtpEmail && emailSettings.smtpAppPassword,
  );
  const hasRepair = Boolean(firstRepair);

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
        <div className="mx-auto grid max-w-6xl gap-6">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-2">
              <h1 className="text-3xl font-semibold text-slate-950">
                Reparations
              </h1>
              <p className="text-sm leading-6 text-slate-600">
                Recherchez, filtrez et ouvrez les fiches de l&apos;atelier.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/repairs/new"
                className="w-fit rounded-md bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
              >
                Nouvelle reparation
              </Link>
            </div>
          </header>
          <AdminSetupChecklist
            profileComplete={profileComplete}
            emailConfigured={emailConfigured}
            hasRepair={hasRepair}
          />
          <ClientErrorBoundary
            name="Admin stats"
            fallback={
              <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Les statistiques n&apos;ont pas pu charger. La liste des
                reparations reste disponible.
              </p>
            }
          >
            <AdminStatsClient />
          </ClientErrorBoundary>
          <ClientErrorBoundary
            name="Admin repairs list"
            fallback={
              <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                La liste des reparations n&apos;a pas pu charger. Essayez de
                recharger la page ou creez une nouvelle reparation.
              </p>
            }
          >
            <AdminRepairsClient />
          </ClientErrorBoundary>
        </div>
      </main>
    </>
  );
}
