import { AdminHeader } from "./AdminHeader";
import { AdminRepairsClient } from "./AdminRepairsClient";
import { requireAdminPage } from "@/lib/auth";
import Link from "next/link";

export default async function AdminPage() {
  const admin = await requireAdminPage();

  return (
    <>
      <AdminHeader email={admin.email} />
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
            <Link
              href="/admin/repairs/new"
              className="w-fit rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Nouvelle reparation
            </Link>
          </header>
          <AdminRepairsClient />
        </div>
      </main>
    </>
  );
}
