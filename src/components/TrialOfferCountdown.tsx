"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type OfferState = {
  status: "loading" | "available" | "expired" | "used" | "error";
  expiresAt: number | null;
};

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return {
    hours: String(Math.floor(totalSeconds / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0"),
    seconds: String(totalSeconds % 60).padStart(2, "0"),
  };
}

export function TrialOfferCountdown() {
  const [offer, setOffer] = useState<OfferState>({
    status: "loading",
    expiresAt: null,
  });
  const [now, setNow] = useState(0);

  useEffect(() => {
    let active = true;

    fetch("/api/pro/trial-offer", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Trial offer unavailable");
        return (await response.json()) as {
          available?: boolean;
          expiresAt?: number;
          used?: boolean;
        };
      })
      .then((payload) => {
        if (!active) return;
        const expiresAt = Number(payload.expiresAt);
        setNow(Date.now());
        setOffer({
          status: payload.used
            ? "used"
            : payload.available && Number.isFinite(expiresAt)
              ? "available"
              : "expired",
          expiresAt: Number.isFinite(expiresAt) ? expiresAt : null,
        });
      })
      .catch(() => {
        if (active) setOffer({ status: "error", expiresAt: null });
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (offer.status !== "available") return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [offer.status]);

  const remainingMs = Math.max(0, (offer.expiresAt ?? 0) - now);
  const remaining = useMemo(() => formatRemaining(remainingMs), [remainingMs]);
  const expired = offer.status === "expired" || (offer.status === "available" && remainingMs <= 0);

  if (offer.status === "error" || offer.status === "used") return null;

  return (
    <section className="bg-slate-950 px-4 py-3 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 rounded-xl border border-sky-400/30 bg-white/8 p-4 shadow-[0_0_30px_rgba(14,165,233,0.18)] sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">
            {expired ? "Offre d'essai expirée" : "Offre limitée à 72 heures"}
          </p>
          <p className="mt-1 text-sm font-semibold sm:text-base">
            {expired
              ? "Vous n'avez pas démarré l'essai à temps : les 7 jours gratuits ne sont plus disponibles sur ce navigateur."
              : "Démarrez avant la fin du compteur pour bénéficier de 7 jours gratuits, sans carte bancaire."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!expired ? (
            <div className="grid grid-cols-3 gap-2 text-center" aria-label="Temps restant pour démarrer l'essai">
              <TimeBox label="heures" value={offer.status === "loading" ? "--" : remaining.hours} />
              <TimeBox label="minutes" value={offer.status === "loading" ? "--" : remaining.minutes} />
              <TimeBox label="secondes" value={offer.status === "loading" ? "--" : remaining.seconds} />
            </div>
          ) : null}
          <Link
            href="/pro/inscription"
            className="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
          >
            {expired ? "Voir l'abonnement" : "Démarrer mes 7 jours"}
          </Link>
        </div>
      </div>
    </section>
  );
}

function TimeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-16 rounded-lg border border-white/15 bg-slate-900 px-3 py-2">
      <p className="font-mono text-xl font-bold text-sky-200">{value}</p>
      <p className="text-[10px] font-semibold uppercase text-slate-400">{label}</p>
    </div>
  );
}
