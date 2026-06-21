"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Clock, Sparkles } from "lucide-react";

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

  const isEnding = remainingMs < 6 * 60 * 60 * 1000;

  return (
    <div className="no-print sticky top-0 z-50 w-full bg-brand-ink text-white shadow-[0_12px_30px_rgba(2,6,23,0.35)]">
      <div className="bg-[radial-gradient(circle_at_12%_50%,rgba(34,197,94,0.30),transparent_20rem),radial-gradient(circle_at_88%_50%,rgba(14,165,233,0.34),transparent_22rem)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 sm:flex">
              <Sparkles className="h-5 w-5 text-emerald-300" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {isEnding ? "Votre essai se termine bientôt" : "Essai gratuit en cours"}
              </p>
              <p className="text-sm font-semibold text-slate-100 sm:text-base">
                Profitez de Qoravo gratuitement — abonnez-vous pour ne rien perdre.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <TimeBox label="h" value={remaining.hours} pulse={isEnding} />
              <span className="text-xl font-extrabold text-white/60">:</span>
              <TimeBox label="min" value={remaining.minutes} pulse={isEnding} />
              <span className="text-xl font-extrabold text-white/60">:</span>
              <TimeBox label="sec" value={remaining.seconds} pulse={isEnding} />
            </div>
            <Link
              href={paymentHref}
              className="q-btn q-btn-primary h-11 px-5 text-sm"
            >
              S&apos;abonner maintenant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeBox({
  label,
  value,
  pulse,
}: {
  label: string;
  value: string;
  pulse?: boolean;
}) {
  return (
    <div
      className={`min-w-[3.4rem] rounded-xl border border-white/15 bg-white/10 px-2 py-1.5 text-center ${
        pulse ? "animate-pulse" : ""
      }`}
    >
      <p className="font-mono text-2xl font-extrabold leading-none text-white">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
        {label}
      </p>
    </div>
  );
}
