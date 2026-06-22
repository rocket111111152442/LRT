"use client";

import { useState } from "react";
import { ArrowRight, Lock, Sparkles, Trash2 } from "lucide-react";
import { QoravoLogo } from "@/components/QoravoLogo";

export function TrialEndedClient({ slug }: { slug: string | null }) {
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const paymentHref = slug
    ? `/pro/paiement?compte=${encodeURIComponent(slug)}`
    : "/pro/paiement";

  function handleContinue() {
    window.location.href = paymentHref;
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/account", { method: "DELETE" });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error ?? "Suppression impossible pour le moment.");
        setIsDeleting(false);
        return;
      }

      window.location.href = "/?compte-supprime=1";
    } catch {
      setError("Suppression impossible pour le moment.");
      setIsDeleting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-ink px-4 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(34,197,94,0.22),transparent_24rem),radial-gradient(circle_at_82%_18%,rgba(14,165,233,0.30),transparent_26rem)]" />

      <div className="relative w-full max-w-lg">
        <div className="q-card bg-white p-7 text-slate-900 sm:p-9">
          <div className="flex items-center justify-between">
            <QoravoLogo />
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>

          <span className="q-chip mt-6 bg-red-50 text-red-700">
            Essai gratuit terminé
          </span>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Vos 72h gratuites sont écoulées.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Votre espace est mis en pause pour le moment. Bonne nouvelle :{" "}
            <strong className="text-slate-900">
              toutes vos données sont conservées
            </strong>
            . Abonnez-vous et vous reprenez exactement là où vous vous étiez
            arrêté — réparations, clients, compta et stock intacts.
          </p>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={handleContinue}
              disabled={isDeleting}
              className="q-btn q-btn-primary w-full text-base disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Continuer et m&apos;abonner (89,99 €/an)
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            {confirming ? (
              <div className="grid gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-800">
                  Supprimer définitivement le compte et toutes les données
                  (réparations, clients, compta, stock) ? Cette action est
                  irréversible.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    {isDeleting ? "Suppression..." : "Oui, tout supprimer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={isDeleting}
                    className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={isDeleting}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Je ne souhaite pas continuer — supprimer mon compte
              </button>
            )}

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-slate-300">
          Besoin d&apos;aide ? Écrivez-nous avant de supprimer — nous pouvons
          prolonger ou vous accompagner.
        </p>
      </div>
    </main>
  );
}
