"use client";

import { FormEvent, useEffect, useState } from "react";

const STORAGE_KEY = "qoravo_review_prompt";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type PromptState = {
  lastActionAt: number;
  dismissedForever: boolean;
};

function readState(): PromptState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PromptState>;
    return {
      lastActionAt: Number(parsed.lastActionAt) || 0,
      dismissedForever: Boolean(parsed.dismissedForever),
    };
  } catch {
    return null;
  }
}

function writeState(state: PromptState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function ReviewPromptDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;

    async function decide() {
      const state = readState();

      // Première visite : on initialise le compteur sans afficher tout de suite.
      if (!state) {
        writeState({ lastActionAt: Date.now(), dismissedForever: false });
        return;
      }

      if (state.dismissedForever) return;

      let sentAt: number | null = null;
      try {
        const response = await fetch("/api/admin/review-prompt", {
          cache: "no-store",
        });
        if (response.ok) {
          const payload = (await response.json()) as { sentAt?: number | null };
          sentAt = typeof payload.sentAt === "number" ? payload.sentAt : null;
        }
      } catch {
        /* réseau indisponible : on se rabat sur la cadence 7 jours */
      }

      const now = Date.now();
      const campaignTriggered = sentAt !== null && sentAt > state.lastActionAt;
      const weeklyDue = now - state.lastActionAt >= SEVEN_DAYS_MS;

      if (active && (campaignTriggered || weeklyDue)) {
        setOpen(true);
      }
    }

    void decide();
    return () => {
      active = false;
    };
  }, []);

  function close() {
    setOpen(false);
  }

  function later() {
    // On repousse : la pop reviendra dans 7 jours (ou au prochain envoi manuel).
    writeState({ lastActionAt: Date.now(), dismissedForever: false });
    close();
  }

  function never() {
    writeState({ lastActionAt: Date.now(), dismissedForever: true });
    close();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/public-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating: Number(rating), comment }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload.error ?? "Envoi de l'avis impossible.");
        return;
      }

      writeState({ lastActionAt: Date.now(), dismissedForever: true });
      setDone(true);
    } catch {
      setError("Envoi de l'avis impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {done ? (
          <div className="grid gap-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
              🙏
            </div>
            <h2 className="text-xl font-bold text-slate-950">Merci beaucoup !</h2>
            <p className="text-sm text-slate-600">
              Votre avis nous aide énormément à faire connaître Qoravo.
            </p>
            <button
              type="button"
              onClick={close}
              className="mx-auto rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-1 text-center">
              <div className="mx-auto text-3xl">⭐</div>
              <h2 className="text-xl font-bold text-slate-950">
                Vous aimez Qoravo ?
              </h2>
              <p className="text-sm text-slate-600">
                Prenez 30 secondes pour laisser un avis. Ça nous aide beaucoup et
                c&apos;est visible sur notre site.
              </p>
            </div>

            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Votre nom ou nom de l'atelier"
              className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />

            <select
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="5">★★★★★ (5)</option>
              <option value="4">★★★★ (4)</option>
              <option value="3">★★★ (3)</option>
              <option value="2">★★ (2)</option>
              <option value="1">★ (1)</option>
            </select>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Qu'est-ce que Qoravo vous apporte au quotidien ?"
              rows={3}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />

            {error ? <p className="text-sm text-red-700">{error}</p> : null}

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "Envoi..." : "Publier mon avis"}
            </button>

            <div className="flex items-center justify-center gap-4 text-xs">
              <button
                type="button"
                onClick={later}
                className="font-semibold text-slate-500 underline-offset-4 hover:underline"
              >
                Plus tard
              </button>
              <button
                type="button"
                onClick={never}
                className="text-slate-400 underline-offset-4 hover:underline"
              >
                Ne plus me demander
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
