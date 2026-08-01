import type { Metadata } from "next";
import Link from "next/link";
import { QoravoLogo } from "@/components/QoravoLogo";
import { ShopLocator } from "../../ShopLocator";

export const metadata: Metadata = {
  title: "Réparateurs de téléphone ouverts près de chez vous",
  description:
    "Recherchez les ateliers de réparation téléphone et informatique ouverts et disponibles autour de vous avec Qoravo.",
  alternates: { canonical: "/client/magasins" },
};

export default function ClientShopsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <QoravoLogo />
          <nav className="flex flex-wrap gap-2 text-sm font-semibold">
            <Link
              href="/client"
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-800 transition hover:bg-slate-50"
            >
              Espace client
            </Link>
            <Link
              href="/suivi"
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-800 transition hover:bg-slate-50"
            >
              Suivre une reparation
            </Link>
          </nav>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6">
          <header className="grid gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Recherche client
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              Magasins ouverts et disponibles
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Cette page affiche uniquement les ateliers ouverts maintenant et
              avec de la disponibilite. Activez votre position pour classer les
              resultats par distance quand les coordonnees sont disponibles.
            </p>
          </header>
          <ShopLocator />
        </div>
      </section>
    </main>
  );
}
