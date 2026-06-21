"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export function AdminTrialBanner({
  paymentStatus,
  trialEndsAt,
  proAccountSlug,
}: {
  paymentStatus?: string | null;
  trialEndsAt?: string | null;
  proAccountSlug?: string | null;
}) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (paymentStatus !== "TRIAL" || !trialEndsAt) {
      return;
    }

    const endTime = new Date(trialEndsAt).getTime();

    function tick() {
      setRemainingMs(Math.max(0, endTime - Date.now()));
    }

    tick();
    const interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);
  }, [paymentStatus, trialEndsAt]);

  const remaining = useMemo(() => formatRemaining(remainingMs), [remainingMs]);

  if (paymentStatus !== "TRIAL" || !trialEndsAt || remainingMs <= 0) {
    return null;
  }

  const paymentHref = proAccountSlug
    ? `/pro/paiement?compte=${encodeURIComponent(proAccountSlug)}`
    : "/pro/paiement";

  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-slate-950 text-white shadow-[0_20px_55px_rgba(14,165,233,0.22)]">
      <div className="grid gap-4 bg-[radial-gradient(circle_at_12%_20%,rgba(34,197,94,0.28),transparent_18rem),radial-gradient(circle_at_82%_30%,rgba(14,165,233,0.32),transparent_20rem)] p-4 sm:p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Essai gratuit active
          </p>
          <h2 className="text-xl font-semibold">
            Votre espace admin est ouvert gratuitement pendant 72h.
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-200">
            Testez Qoravo avec vos vraies fiches. A la fin de l&apos;essai,
            l&apos;abonnement vous permettra de retrouver vos donnees et de
            reprendre exactement la ou vous vous etiez arrete.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[auto_auto] sm:items-center">
          <div className="grid grid-cols-4 gap-2 text-center">
            <TimeBox label="jours" value={remaining.days} />
            <TimeBox label="heures" value={remaining.hours} />
            <TimeBox label="min" value={remaining.minutes} />
            <TimeBox label="sec" value={remaining.seconds} />
          </div>
          <Link
            href={paymentHref}
            className="rounded-xl bg-cyan-300 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Souscrire maintenant
          </Link>
        </div>
      </div>
    </section>
  );
}

function TimeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-14 rounded-xl border border-white/15 bg-white/10 px-2 py-2">
      <p className="font-mono text-xl font-semibold text-cyan-100">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
        {label}
      </p>
    </div>
  );
}
