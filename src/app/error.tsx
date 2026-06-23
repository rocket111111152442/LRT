"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="grid max-w-md gap-5">
        <p className="select-none text-7xl font-extrabold text-slate-200">500</p>
        <h1 className="text-2xl font-extrabold text-slate-950">
          Une erreur est survenue
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Quelque chose s&apos;est mal passé de notre côté. Réessayez, et si le
          problème persiste, contactez-nous.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="q-btn q-btn-primary text-sm">
            Réessayer
          </button>
          <Link
            href="/"
            className="q-btn border border-slate-300 bg-white text-sm text-slate-800 hover:bg-slate-50"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
