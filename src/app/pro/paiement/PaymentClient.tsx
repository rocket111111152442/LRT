"use client";

import Link from "next/link";
import { useState } from "react";

export function PaymentClient({
  pendingSignupId,
  signupToken,
  slug,
}: {
  pendingSignupId?: string;
  signupToken?: string;
  slug?: string;
}) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [setupHelp, setSetupHelp] = useState(false);
  const canPay = Boolean(pendingSignupId || signupToken || slug);
  const total = setupHelp ? "68,99 EUR" : "49 EUR";

  async function handlePayment() {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/pro/payment-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pendingSignupId, signupToken, slug, setupHelp }),
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
      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
        <input
          type="checkbox"
          checked={setupHelp}
          onChange={(event) => setSetupHelp(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300"
        />
        <span className="grid gap-1 text-sm text-slate-700">
          <span className="font-semibold text-slate-950">
            Ajouter l aide parametrage +19,99 EUR
          </span>
          <span>
            Apres le paiement, vous choisissez un jour et une heure pour etre
            contacte et aide a tout parametrer.
          </span>
        </span>
      </label>
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <p className="text-xs leading-5 text-slate-500">
        En payant, vous acceptez les{" "}
        <Link
          href="/conditions-utilisation"
          target="_blank"
          className="font-semibold text-slate-800 underline-offset-4 hover:underline"
        >
          conditions d&apos;utilisation
        </Link>
        .
      </p>
      <button
        type="button"
        onClick={handlePayment}
        disabled={isLoading || !canPay}
        className="min-h-12 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? "Ouverture du paiement..." : `Payer ${total}`}
      </button>
    </div>
  );
}
