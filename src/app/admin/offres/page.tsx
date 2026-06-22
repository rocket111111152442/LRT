import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { OffresClient } from "./OffresClient";

export const dynamic = "force-dynamic";

export default async function AdminOffresPage() {
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
            <h1 className="text-3xl font-bold text-slate-950">
              Offres &amp; limites
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              Suivez votre stockage et votre volume de réparations. Quand votre
              boutique grandit, augmentez vos limites pour continuer sans
              interruption.
            </p>
          </header>
          <OffresClient />
        </div>
      </main>
    </>
  );
}
