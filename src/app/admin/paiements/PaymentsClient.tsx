"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, CreditCard, ShieldCheck } from "lucide-react";

export function PaymentsClient() {
  const [connected, setConnected] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [connectSetupUrl, setConnectSetupUrl] = useState("");

  async function loadStatus() {
    try {
      const res = await fetch("/api/admin/stripe-connect");
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      const data = await res.json();
      if (res.ok) {
        setConnected(Boolean(data.connected));
        setOnboarded(Boolean(data.onboarded));
      }
    } catch {
      setError("Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStatus();
  }, []);

  async function startOnboarding() {
    setWorking(true); setError(""); setConnectSetupUrl("");
    try {
      const res = await fetch("/api/admin/stripe-connect", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Connexion impossible.");
        if (typeof data.connectSetupUrl === "string") {
          setConnectSetupUrl(data.connectSetupUrl);
        }
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Connexion impossible.");
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return <div className="q-card p-6 text-sm text-slate-600">Chargement...</div>;
  }

  return (
    <section className="grid gap-5">
      {error ? (
        <div className="grid gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>{error}</p>
          {connectSetupUrl ? (
            <a
              href={connectSetupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="q-btn q-btn-primary w-fit text-sm"
            >
              Activer Stripe Connect (1 clic) →
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="q-card grid gap-4 p-6">
        <div className="flex items-center gap-3">
          <span className={`grid h-12 w-12 place-items-center rounded-xl ${onboarded ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-sky-600"}`}>
            {onboarded ? <BadgeCheck className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              {onboarded ? "Paiements en ligne actifs" : "Activer les paiements en ligne"}
            </h2>
            <p className="text-sm text-slate-600">
              {onboarded
                ? "Vos clients peuvent payer leur réparation par carte. L'argent arrive sur votre compte."
                : connected
                  ? "Configuration Stripe à terminer."
                  : "Connectez votre compte Stripe (gratuit, 5 min)."}
            </p>
          </div>
        </div>

        {onboarded ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            ✓ Tout est prêt. Le bouton « Payer en ligne » apparaît pour vos clients
            sur la page de suivi quand un montant reste dû.
          </div>
        ) : (
          <button
            type="button"
            onClick={startOnboarding}
            disabled={working}
            className="q-btn q-btn-primary w-fit text-sm disabled:opacity-60"
          >
            {working ? "Ouverture de Stripe..." : connected ? "Terminer la configuration Stripe" : "Connecter mon compte Stripe"}
          </button>
        )}
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        <p className="flex items-center gap-2 font-semibold text-slate-900">
          <ShieldCheck className="h-5 w-5 text-brand-green" /> 100% sécurisé
        </p>
        <ul className="grid gap-1.5">
          <li>• Le paiement se fait sur une page hébergée par Stripe (carte, Apple Pay, Google Pay).</li>
          <li>• Vous ne stockez jamais les numéros de carte (norme bancaire PCI-DSS).</li>
          <li>• L&apos;argent va directement sur votre compte, pas sur celui de Qoravo.</li>
          <li>• La réparation passe automatiquement en « payée » dès le paiement validé.</li>
        </ul>
      </div>
    </section>
  );
}
