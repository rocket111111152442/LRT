import type { Metadata } from "next";
import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { SalesClient } from "./SalesClient";

export const metadata: Metadata = { title: "Ventes — Qoravo Admin" };
export const dynamic = "force-dynamic";

export default async function AdminSalesPage() {
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
        <div className="mx-auto grid max-w-6xl gap-6">
          <header className="grid gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Caisse
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              Ventes (hors réparation)
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Vendez un article du stock (accessoire, pièce, occasion…) ou une
              vente libre. Le stock se décrémente automatiquement, le chiffre
              d&apos;affaires et la marge se mettent à jour, et tout apparaît dans
              l&apos;export CSV de la comptabilité.
            </p>
          </header>
          <SalesClient />
        </div>
      </main>
    </>
  );
}
