"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

export function TrialStartedNotice({
  companyName,
  slug,
  trialEndsAt,
}: {
  companyName: string;
  slug: string;
  trialEndsAt: string;
}) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    const endTime = new Date(trialEndsAt).getTime();

    function tick() {
      setRemainingMs(Math.max(0, endTime - Date.now()));
    }

    tick();
    const interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);
  }, [trialEndsAt]);

  const remaining = useMemo(() => formatRemaining(remainingMs), [remainingMs]);

  if (remainingMs <= 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-slate-950 text-white shadow-[0_18px_55px_rgba(14,165,233,0.25)]">
      <div className="grid gap-5 bg-[radial-gradient(circle_at_18%_24%,rgba(34,197,94,0.30),transparent_16rem),radial-gradient(circle_at_86%_16%,rgba(14,165,233,0.34),transparent_18rem)] p-5">
        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Essai gratuit lance
          </p>
          <h2 className="text-2xl font-semibold">
            Votre essai Qoravo vient de commencer.
          </h2>
          <p className="text-sm leading-6 text-slate-200">
            Vous avez 72h pour utiliser le panel admin gratuitement avec le
            compte <strong>{companyName}</strong>. Quand l&apos;essai arrive a
            la fin, vous pourrez souscrire a l&apos;abonnement et retrouver vos
            fiches, vos reglages et votre avancee exactement la ou vous vous
            etiez arrete.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="grid grid-cols-3 gap-2 text-center">
            <TimeBox label="heures" value={remaining.hours} />
            <TimeBox label="minutes" value={remaining.minutes} />
            <TimeBox label="secondes" value={remaining.seconds} />
          </div>
          <Link
            href={`/pro/paiement?compte=${encodeURIComponent(slug)}`}
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
    <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
      <p className="font-mono text-2xl font-semibold text-cyan-100">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
        {label}
      </p>
    </div>
  );
}
