"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type QuoteRepair = {
  ticketNumber: string | null;
  firstName: string;
  lastName: string;
  deviceType: string;
  brand: string;
  model: string;
  estimatedPriceCents: number | null;
  quoteStatus: "NONE" | "SENT" | "ACCEPTED" | "REFUSED";
};

function formatPrice(cents: number | null) {
  if (!cents) {
    return "-";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

type QuoteDecisionClientProps = {
  token: string;
  initialDecision?: "ACCEPTED" | "REFUSED";
};

export function QuoteDecisionClient({
  token,
  initialDecision,
}: QuoteDecisionClientProps) {
  const [repair, setRepair] = useState<QuoteRepair | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const appliedInitialDecision = useRef(false);

  const loadQuote = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/quote/${token}`);
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Devis introuvable.");
        return;
      }

      setRepair(payload.repair);
    } catch {
      setError("Chargement impossible.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadQuote();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadQuote]);

  const answerQuote = useCallback(async (action: "ACCEPTED" | "REFUSED") => {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/quote/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Reponse impossible.");
        return;
      }

      setRepair(payload.repair);
    } catch {
      setError("Reponse impossible.");
    } finally {
      setIsSaving(false);
    }
  }, [token]);

  useEffect(() => {
    if (
      !initialDecision ||
      !repair ||
      appliedInitialDecision.current ||
      repair.quoteStatus === "ACCEPTED" ||
      repair.quoteStatus === "REFUSED"
    ) {
      return;
    }

    appliedInitialDecision.current = true;
    void answerQuote(initialDecision);
  }, [answerQuote, initialDecision, repair]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        Chargement...
      </div>
    );
  }

  if (!repair) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error || "Devis introuvable."}
      </p>
    );
  }

  const alreadyAnswered =
    repair.quoteStatus === "ACCEPTED" || repair.quoteStatus === "REFUSED";

  return (
    <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-3">
        <p className="text-sm text-slate-600">
          Ticket {repair.ticketNumber ?? "-"}
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">
          {repair.deviceType} {repair.brand} {repair.model}
        </h2>
        <p className="text-sm text-slate-700">
          Client : {repair.firstName} {repair.lastName}
        </p>
        <p className="text-3xl font-semibold text-slate-950">
          {formatPrice(repair.estimatedPriceCents)}
        </p>
      </div>

      {alreadyAnswered ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Votre reponse est enregistree :{" "}
          {repair.quoteStatus === "ACCEPTED" ? "devis accepte" : "devis refuse"}.
        </p>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => answerQuote("ACCEPTED")}
            disabled={isSaving}
            className="min-h-11 rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            J&apos;accepte le devis
          </button>
          <button
            type="button"
            onClick={() => answerQuote("REFUSED")}
            disabled={isSaving}
            className="min-h-11 rounded-md border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Je refuse le devis
          </button>
        </div>
      )}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}
    </section>
  );
}
