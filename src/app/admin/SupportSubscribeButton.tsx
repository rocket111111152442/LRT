"use client";

import { LifeBuoy } from "lucide-react";
import { useState } from "react";

type SupportSubscribeButtonProps = {
  className?: string;
};

export function SupportSubscribeButton({ className }: SupportSubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/support-subscription", {
        method: "POST",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload.error ?? "Activation du support impossible.");
        return;
      }

      const redirectUrl = payload.checkoutUrl ?? payload.redirectUrl;

      if (!redirectUrl) {
        setError("Lien de paiement introuvable.");
        return;
      }

      window.location.href = redirectUrl;
    } catch {
      setError("Activation du support impossible.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <span className="inline-grid gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={
          className ??
          "inline-flex min-h-10 items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        }
      >
        <LifeBuoy aria-hidden="true" className="h-4 w-4" />
        {isLoading ? "Ouverture..." : "Activer support"}
      </button>
      {error ? <span className="text-xs font-semibold text-red-700">{error}</span> : null}
    </span>
  );
}
