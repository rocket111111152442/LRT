"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Eye, EyeOff, Leaf, Loader2, PlugZap } from "lucide-react";

export function QualireparSettings() {
  const [apiKey, setApiKey] = useState("");
  const [siteId, setSiteId] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/qualirepar/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data) {
          setHasApiKey(Boolean(data.hasApiKey));
          setSiteId(data.siteId ?? "");
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function save() {
    setSaving(true); setMessage(""); setError("");
    try {
      const res = await fetch("/api/admin/qualirepar/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey || undefined, siteId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "Enregistrement impossible."); return; }
      setHasApiKey(Boolean(data.hasApiKey));
      setApiKey("");
      setMessage("Identifiants QualiRépar enregistrés.");
    } catch { setError("Enregistrement impossible."); }
    finally { setSaving(false); }
  }

  async function test() {
    setTesting(true); setMessage(""); setError("");
    try {
      const res = await fetch("/api/admin/qualirepar/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) setMessage(data.message ?? "Connexion réussie.");
      else setError(data.error ?? "Connexion échouée.");
    } catch { setError("Test impossible."); }
    finally { setTesting(false); }
  }

  return (
    <section className="grid gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
          <Leaf className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-950">QualiRépar (Bonus Réparation)</h2>
          <p className="text-sm text-slate-600">
            Connectez votre compte AgoraPlus pour gérer automatiquement le Bonus Réparation.
          </p>
        </div>
        {hasApiKey ? (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
            <BadgeCheck className="h-3.5 w-3.5" /> Configuré
          </span>
        ) : null}
      </div>

      <p className="rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
        Ces identifiants vous ont été envoyés par email lors de votre labellisation QualiRépar.
        Chaque atelier utilise ses propres accès — vos remboursements sont versés directement
        sur votre compte par l&apos;éco-organisme.
      </p>

      {loading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="qr-apikey" className="text-sm font-medium text-slate-800">
              Clé API AgoraPlus
            </label>
            <div className="flex gap-2">
              <input
                id="qr-apikey"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasApiKey ? "•••••••••• (déjà enregistrée — laissez vide pour garder)" : "Collez votre clé API"}
                className="min-h-11 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                aria-label={showKey ? "Masquer" : "Afficher"}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="qr-siteid" className="text-sm font-medium text-slate-800">
              SiteId AgoraPlus
            </label>
            <input
              id="qr-siteid"
              type="text"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              placeholder="Ex : 12345"
              className="min-h-11 max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          {message ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
          ) : null}
          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </button>
            <button
              type="button"
              onClick={test}
              disabled={testing}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
              Tester la connexion
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Pas encore de compte AgoraPlus ?{" "}
            <a
              href="https://myspace.agoraplus.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-700 underline-offset-2 hover:underline"
            >
              Créez-le gratuitement sur myspace.agoraplus.com
            </a>
          </p>
        </div>
      )}
    </section>
  );
}
