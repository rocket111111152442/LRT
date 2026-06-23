import type { Metadata } from "next";
import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { ClientsClient } from "./ClientsClient";

export const metadata: Metadata = { title: "Clients — Qoravo Admin" };
export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
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
        <div className="mx-auto grid max-w-5xl gap-6">
          <header className="grid gap-2">
            <h1 className="text-3xl font-bold text-slate-950">Clients</h1>
            <p className="text-sm leading-6 text-slate-600">
              Historique de chaque client : nombre de réparations, total dépensé,
              et toutes ses fiches regroupées.
            </p>
          </header>
          <ClientsClient />
        </div>
      </main>
    </>
  );
}
