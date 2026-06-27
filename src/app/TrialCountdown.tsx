"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const TRIAL_MS = 72 * 60 * 60 * 1000;
const STORAGE_KEY = "qoravo_trial_countdown_started_at";
const TRIAL_USED_KEY = "qoravo_trial_used";

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

export function TrialCountdown() {
  const [remainingMs, setRemainingMs] = useState(TRIAL_MS);
  const [trialUsed, setTrialUsed] = useState(false);

  useEffect(() => {
    // Un compte a déjà été créé avec l'essai depuis ce navigateur : on n'affiche
    // plus le bandeau d'offre.
    if (window.localStorage.getItem(TRIAL_USED_KEY) === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTrialUsed(true);
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    const startedAt = stored ? Number(stored) : Date.now();

    if (!stored || Number.isNaN(startedAt)) {
      window.localStorage.setItem(STORAGE_KEY, String(startedAt));
    }

    function tick() {
      const elapsed = Date.now() - startedAt;
      setRemainingMs(Math.max(0, TRIAL_MS - elapsed));
    }

    tick();
    const interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const remaining = useMemo(() => formatRemaining(remainingMs), [remainingMs]);

  // Quand le compte a rebours atteint 0, ou que l'essai a déjà été utilisé, on
  // retire entierement le bandeau et l'offre d'essai gratuit.
  if (remainingMs <= 0 || trialUsed) {
    return null;
  }

  return (
    <section className="bg-slate-950 px-4 py-3 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 rounded-2xl border border-sky-400/30 bg-white/8 p-4 shadow-[0_0_35px_rgba(14,165,233,0.20)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Essai gratuit 72h
          </p>
          <h2 className="mt-1 text-lg font-semibold">
            Testez Qoravo sans payer, puis abonnez-vous quand vous etes pret.
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <TimeBox label="heures" value={remaining.hours} />
            <TimeBox label="minutes" value={remaining.minutes} />
            <TimeBox label="secondes" value={remaining.seconds} />
          </div>
          <Link
            href="/pro/inscription"
            className="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Demarrer l&apos;essai
          </Link>
        </div>
      </div>
    </section>
  );
}

function TimeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-16 rounded-xl border border-white/15 bg-slate-900 px-3 py-2">
      <p className="font-mono text-xl font-semibold text-sky-200">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}
