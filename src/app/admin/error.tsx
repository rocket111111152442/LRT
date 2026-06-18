"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin page failed", error);
  }, [error]);

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-xl gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
            Administration
          </p>
          <h1 className="text-2xl font-semibold text-slate-950">
            La page admin n&apos;a pas pu charger.
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Rechargez la page. Si vous venez d&apos;etre deconnecte, retournez a
            la connexion admin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Recharger
          </button>
          <Link
            href="/admin/login"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Connexion admin
          </Link>
        </div>
      </div>
    </main>
  );
}
