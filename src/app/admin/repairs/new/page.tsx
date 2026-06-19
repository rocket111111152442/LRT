import Link from "next/link";
import { AdminHeader } from "../../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { AdminRepairCreateForm } from "./AdminRepairCreateForm";

export default async function NewRepairPage() {
  const admin = await requireAdminPage();

  return (
    <>
      <AdminHeader email={admin.email} supportIncluded={admin.supportIncluded} />
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6">
          <header className="grid gap-3">
            <Link
              href="/admin"
              className="w-fit font-semibold text-slate-950 underline-offset-4 hover:underline"
            >
              Retour aux reparations
            </Link>
            <div className="grid gap-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Creation manuelle
              </p>
              <h1 className="text-3xl font-semibold text-slate-950">
                Nouvelle reparation
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                Utilisez ce formulaire quand le client est au comptoir ou quand
                vous voulez creer une fiche sans passer par le QR code.
              </p>
            </div>
          </header>
          <AdminRepairCreateForm />
        </div>
      </main>
    </>
  );
}
