import type { Metadata } from "next";
export const metadata: Metadata = { title: "Parametres — Qoravo Admin" };
import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { ProfileSettingsForm } from "./ProfileSettingsForm";
import { QualireparSettings } from "./QualireparSettings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
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
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
              Parametres
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              Informations du magasin
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              Ces donnees servent a afficher votre boutique sur la recherche
              publique et dans les informations client.
            </p>
          </header>
          <ProfileSettingsForm />
          <QualireparSettings />
        </div>
      </main>
    </>
  );
}
