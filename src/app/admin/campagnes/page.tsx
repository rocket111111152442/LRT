import type { Metadata } from "next";
import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { CampaignsClient } from "./CampaignsClient";

export const metadata: Metadata = { title: "Campagnes email — Qoravo Admin" };
export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
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
            <h1 className="text-3xl font-bold text-slate-950">Campagnes email</h1>
            <p className="text-sm leading-6 text-slate-600">
              Importez vos contacts professionnels, rédigez un message et envoyez
              une campagne. Chaque email inclut automatiquement un lien de
              désinscription (obligatoire et conforme au RGPD).
            </p>
          </header>
          <CampaignsClient />
        </div>
      </main>
    </>
  );
}
