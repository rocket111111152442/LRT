"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function TrialOfferCountdown() {
  // Bandeau d'offre d'essai. Plus de compte à rebours de 72h : l'essai est
  // disponible en permanence. On masque simplement le bandeau si l'essai a déjà
  // été utilisé sur ce navigateur (ou si un admin est déjà connecté).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/pro/trial-offer", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Trial offer unavailable");
        return (await response.json()) as { used?: boolean };
      })
      .then((payload) => {
        if (active) setVisible(!payload.used);
      })
      .catch(() => {
        // Erreur réseau : on affiche quand même l'offre plutôt que de la cacher.
        if (active) setVisible(true);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!visible) return null;

  return (
    <section className="bg-slate-950 px-4 py-3 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 rounded-xl border border-sky-400/30 bg-white/8 p-4 shadow-[0_0_30px_rgba(14,165,233,0.18)] sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">
            7 jours gratuits
          </p>
          <p className="mt-1 text-sm font-semibold sm:text-base">
            Testez Qoravo gratuitement pendant 7 jours, sans carte bancaire ni
            engagement.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/pro/inscription"
            className="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
          >
            Démarrer mes 7 jours
          </Link>
        </div>
      </div>
    </section>
  );
}
