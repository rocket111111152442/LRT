"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { QoravoLogo } from "@/components/QoravoLogo";

export default function ModLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/moderateur/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Mot de passe incorrect.");
        return;
      }
      window.location.href = "/moderateur";
    } catch {
      setError("Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-ink px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <QoravoLogo />
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">
          Panel modérateur — accès restreint
        </p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Mot de passe modérateur
            <span className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                minLength={8}
                maxLength={128}
                required
                autoFocus
                className="min-h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-11 text-sm text-white outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-400 hover:text-white"
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </span>
          </label>
          {error ? (
            <p className="rounded-lg border border-red-400/30 bg-red-900/30 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="q-btn q-btn-primary w-full disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Accéder au panel"}
          </button>
        </form>
      </div>
    </main>
  );
}
