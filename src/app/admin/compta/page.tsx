import type { Metadata } from "next";
export const metadata: Metadata = { title: "Comptabilite — Qoravo Admin" };
import { AdminHeader } from "../AdminHeader";
import { AccountingClient } from "./AccountingClient";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminAccountingPage() {
  const admin = await requireAdminPage();

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
              Gestion financiere
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              Compta du magasin
            </h1>
            <p className="max-w-4xl text-sm leading-6 text-slate-600">
              Centralisez le chiffre d&apos;affaires des reparations, les ventes
              hors reparation, les depenses, les employes, la paie et les
              estimations de taxes. Les taux restent configurables par atelier.
            </p>
          </header>
          <AccountingClient />
        </div>
      </main>
    </>
  );
}
