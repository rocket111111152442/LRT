"use client";

import Link from "next/link";
import { useState } from "react";
import {
  applyPremiumDiscountCents,
  isPremiumDiscountCode,
  normalizePromoCode,
  PREMIUM_DISCOUNT_CODE,
} from "@/lib/pro/promoCodes";

const PRO_PRICE_CENTS = 4900;
const SETUP_HELP_PRICE_CENTS = 1999;

function formatPrice(cents: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function PaymentClient({
  pendingSignupId,
  signupToken,
  slug,
  initialPromoCode = "",
}: {
  pendingSignupId?: string;
  signupToken?: string;
  slug?: string;
  initialPromoCode?: string;
}) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [setupHelp, setSetupHelp] = useState(false);
  const [promoCode, setPromoCode] = useState(initialPromoCode);
  const canPay = Boolean(pendingSignupId || signupToken || slug);
  const normalizedPromoCode = normalizePromoCode(promoCode);
  const hasPremiumDiscount = isPremiumDiscountCode(normalizedPromoCode);
  const premiumPriceCents = hasPremiumDiscount
    ? applyPremiumDiscountCents(PRO_PRICE_CENTS)
    : PRO_PRICE_CENTS;
  const totalCents = premiumPriceCents + (setupHelp ? SETUP_HELP_PRICE_CENTS : 0);

  async function handlePayment() {
    setError("");

    if (normalizedPromoCode && !hasPremiumDiscount) {
      setError("Code de reduction invalide.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/pro/payment-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pendingSignupId,
          signupToken,
          slug,
          setupHelp,
          promoCode: hasPremiumDiscount ? PREMIUM_DISCOUNT_CODE : "",
        }),
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
      <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-4">
        <label
          htmlFor="payment-promo-code"
          className="text-sm font-semibold text-slate-950"
        >
          Code de reduction
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="payment-promo-code"
            type="text"
            value={promoCode}
            onChange={(event) => {
              setPromoCode(event.target.value.toUpperCase());
              setError("");
            }}
            placeholder="LRT10"
            className="min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm uppercase outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
          />
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            Premium :{" "}
            <strong className="text-slate-950">
              {formatPrice(premiumPriceCents)}
            </strong>
          </div>
        </div>
        {hasPremiumDiscount ? (
          <p className="text-sm text-emerald-700">
            Code {PREMIUM_DISCOUNT_CODE} applique : -10% sur le premium. L&apos;aide
            parametrage reste a 19,99 EUR.
          </p>
        ) : null}
      </div>

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
        {isLoading
          ? "Ouverture du paiement..."
          : `Payer ${formatPrice(totalCents)}`}
      </button>
    </div>
  );
}
