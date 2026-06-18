"use client";

import { useState } from "react";

export function PaymentClient({
  pendingSignupId,
  slug,
}: {
  pendingSignupId?: string;
  slug?: string;
}) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const canPay = Boolean(pendingSignupId || slug);

  async function handlePayment() {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/pro/payment-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pendingSignupId, slug }),
      });
      const payload = await response
        .json()
        .catch(() => ({ error: "Erreur serveur pendant le paiement." }));

      if (!response.ok) {
        setError(payload.error ?? "Paiement impossible.");
        return;
      }

      const redirectUrl = payload.checkoutUrl ?? payload.redirectUrl;

      if (!redirectUrl) {
        setError("Lien de paiement introuvable.");
        return;
      }

      window.location.href = redirectUrl;
    } catch {
      setError("Paiement impossible.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={handlePayment}
        disabled={isLoading || !canPay}
        className="min-h-12 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? "Ouverture du paiement..." : "Payer 4,99 EUR"}
      </button>
    </div>
  );
}
