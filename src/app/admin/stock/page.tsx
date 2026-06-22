import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { InventoryClient } from "./InventoryClient";

export default async function AdminStockPage() {
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
            <h1 className="text-3xl font-bold text-slate-950">Stock &amp; catalogue</h1>
            <p className="text-sm leading-6 text-slate-600">
              Gérez tout votre stock — pièces détachées, accessoires, appareils
              reconditionnés, outils et consommables — avec catégories, prix
              d&apos;achat et de vente, fournisseur, emplacement et alertes de
              stock bas.
            </p>
          </header>
          <InventoryClient />
        </div>
      </main>
    </>
  );
}
