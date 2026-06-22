"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Database,
  Loader2,
  Sparkles,
  Wrench,
} from "lucide-react";
import {
  formatOptionPrice,
  formatStorage,
  type PlanOption,
  type UsageEvaluation,
} from "@/lib/plans";

type UsagePayload = {
  plan: string;
  evaluation: UsageEvaluation;
  options: PlanOption[];
};

export function OffresClient() {
  const [data, setData] = useState<UsagePayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingOptionId, setPayingOptionId] = useState<string | null>(null);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await fetch("/api/admin/usage");

        if (response.status === 401) {
          window.location.href = "/admin/login";
          return;
        }

        const payload = await response.json();

        if (!active) {
          return;
        }

        if (!response.ok) {
          setError(payload.error ?? "Chargement impossible.");
          return;
        }

        setData(payload);
      } catch {
        if (active) {
          setError("Chargement impossible.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function handleUpgrade(optionId: string) {
    setPayingOptionId(optionId);
    setPayError("");

    try {
      const response = await fetch("/api/admin/plan-upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setPayError(payload.error ?? "Paiement impossible pour le moment.");
        return;
      }

      if (payload.checkoutUrl) {
        window.location.assign(payload.checkoutUrl);
      }
    } catch {
      setPayError("Paiement impossible pour le moment.");
    } finally {
      setPayingOptionId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="q-card p-6 text-sm text-slate-600">
        Chargement de votre usage...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error || "Chargement impossible."}
      </div>
    );
  }

  const { evaluation, options } = data;
  const storageTone =
    evaluation.storageState === "full"
      ? "bg-red-500"
      : evaluation.storageState === "warning"
        ? "bg-amber-500"
        : "bg-brand-blue";
  const repairPercent =
    evaluation.repairLimitPerMonth > 0
      ? Math.min(
          100,
          Math.round(
            (evaluation.repairsThisMonth / evaluation.repairLimitPerMonth) * 100,
          ),
        )
      : 0;

  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
  const upgradeSuccess = searchParams?.get("upgrade") === "success";
  const upgradeCancel  = searchParams?.get("upgrade") === "cancel";

  return (
    <section className="grid gap-6">
      {upgradeSuccess ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          ✓ Abonnement activé — votre nouvelle offre est en place. Rechargez la page pour voir vos nouvelles limites.
        </div>
      ) : null}
      {upgradeCancel ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.
        </div>
      ) : null}
      {payError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {payError}
        </div>
      ) : null}
      {evaluation.messages.length > 0 ? (
        <div className="grid gap-2">
          {evaluation.messages.map((message) => (
            <div
              key={message}
              className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            >
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                aria-hidden="true"
              />
              <span>{message}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <article className="q-card p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Database className="h-5 w-5 text-brand-blue" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide">
              Stockage
            </p>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-950">
            {formatStorage(evaluation.storageUsedBytes)}{" "}
            <span className="text-base font-semibold text-slate-500">
              / {formatStorage(evaluation.storageLimitBytes)}
            </span>
          </p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${storageTone}`}
              style={{ width: `${evaluation.storagePercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            {evaluation.storagePercent}% utilisé
          </p>
        </article>

        <article className="q-card p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Wrench className="h-5 w-5 text-brand-green" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide">
              Réparations ce mois
            </p>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-950">
            {evaluation.repairsThisMonth}{" "}
            <span className="text-base font-semibold text-slate-500">
              / {evaluation.repairLimitPerMonth}
            </span>
          </p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                evaluation.repairsOverLimit ? "bg-red-500" : "bg-brand-green"
              }`}
              style={{ width: `${repairPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            {repairPercent}% de votre limite mensuelle
          </p>
        </article>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-gold" aria-hidden="true" />
          <h2 className="text-xl font-bold text-slate-950">
            Augmenter mes limites
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {options.map((option) => {
            const recommended =
              option.id === evaluation.recommendedOptionId;

            return (
              <article
                key={option.id}
                className={`q-card flex flex-col gap-3 p-5 ${
                  recommended ? "ring-2 ring-brand-blue" : ""
                }`}
              >
                {recommended ? (
                  <span className="q-chip w-fit bg-brand-blue-soft text-brand-blue">
                    Recommandé pour vous
                  </span>
                ) : null}
                <h3 className="text-lg font-bold text-slate-950">
                  {option.name}
                </h3>
                <p className="text-sm text-slate-600">{option.tagline}</p>
                <p className="text-base font-extrabold text-brand-blue">
                  {formatOptionPrice(option)}
                </p>
                <ul className="grid gap-2">
                  {option.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-green"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                {option.kind === "custom" ? (
                  <Link
                    href="/service-client?offre=enterprise"
                    className="q-btn mt-auto border border-slate-300 bg-white text-sm text-slate-900 hover:bg-slate-50"
                  >
                    Demander un devis
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpgrade(option.id)}
                    disabled={payingOptionId !== null}
                    className={`q-btn mt-auto text-sm disabled:opacity-60 ${
                      recommended
                        ? "q-btn-primary"
                        : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {payingOptionId === option.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Redirection...
                      </>
                    ) : (
                      <>
                        Payer et activer
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                )}
              </article>
            );
          })}
        </div>
        <p className="text-xs leading-5 text-slate-500">
          Les options s&apos;ajoutent à votre abonnement annuel. Pour activer une
          offre ou un devis sur mesure, contactez-nous : nous configurons votre
          compte sous 24h.
        </p>
      </div>
    </section>
  );
}
