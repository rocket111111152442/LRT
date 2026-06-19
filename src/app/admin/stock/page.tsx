import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { InventoryClient } from "./InventoryClient";

export default async function AdminStockPage() {
  const admin = await requireAdminPage();

  return (
    <>
      <AdminHeader email={admin.email} supportIncluded={admin.supportIncluded} />
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6">
          <header className="grid gap-2">
            <h1 className="text-3xl font-semibold text-slate-950">Stock</h1>
            <p className="text-sm leading-6 text-slate-600">
              Suivez les pieces, leur cout d&apos;achat, la valeur du stock et les
              alertes de stock bas.
            </p>
          </header>
          <InventoryClient />
        </div>
      </main>
    </>
  );
}
