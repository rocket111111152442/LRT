import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Search, TicketCheck } from "lucide-react";
import { QoravoLogo } from "@/components/QoravoLogo";

export const metadata: Metadata = {
  title: "Trouver un réparateur de téléphone proche",
  description:
    "Trouvez avec Qoravo un réparateur de téléphone ou d'ordinateur ouvert et disponible, envoyez votre demande puis suivez votre réparation en ligne.",
  alternates: { canonical: "/client" },
};

export default function ClientHomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div className="grid gap-5">
            <QoravoLogo textClassName="text-white" />
            <div className="grid gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
                Espace client
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                Trouvez un reparateur ouvert et suivez votre appareil.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-200">
                Qoravo vous aide a trouver un atelier disponible, envoyer une
                demande claire et suivre votre ticket de reparation sans appeler
                plusieurs fois le magasin.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/client/magasins"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                <MapPin aria-hidden="true" className="h-4 w-4" />
                Trouver un magasin proche
              </Link>
              <Link
                href="/suivi"
                className="inline-flex items-center gap-2 rounded-lg border border-white/50 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <TicketCheck aria-hidden="true" className="h-4 w-4" />
                Suivre ma reparation
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="grid gap-3">
              {[
                "Magasins classes par disponibilite",
                "Formulaire avec photos et signature",
                "Numero de ticket pour suivre l'avancement",
                "Emails envoyes quand le statut change",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm font-semibold text-white"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Search aria-hidden="true" className="h-6 w-6 text-sky-600" />
            <h2 className="mt-4 text-lg font-semibold">1. Cherchez</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Activez votre localisation pour afficher les magasins ouverts et
              disponibles au moment de votre recherche.
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <MapPin aria-hidden="true" className="h-6 w-6 text-emerald-600" />
            <h2 className="mt-4 text-lg font-semibold">2. Envoyez</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Remplissez la demande avec vos informations, l&apos;appareil, la panne,
              une photo et votre signature si necessaire.
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <TicketCheck aria-hidden="true" className="h-6 w-6 text-cyan-600" />
            <h2 className="mt-4 text-lg font-semibold">3. Suivez</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Gardez votre numero de ticket pour voir ou en est la reparation.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
