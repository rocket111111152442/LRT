"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Mot de passe incorrect.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Réessayez.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <Logo />
        </div>
        <form onSubmit={handleSubmit} className="border border-stone bg-paper p-8">
          <label htmlFor="admin-password" className="block text-[0.75rem] uppercase tracking-[0.1em] text-ink-faint">
            Mot de passe
          </label>
          <input
            id="admin-password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border-0 border-b border-stone-dark bg-transparent py-3 text-[1.0625rem] text-ink focus:border-clay focus:outline-none"
          />
          {error ? <p className="mt-3 text-xs text-alert">{error}</p> : null}
          <button
            type="submit"
            disabled={loading || !password}
            className="mt-6 w-full bg-pine px-7 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-pine-dim disabled:opacity-50"
          >
            {loading ? "Vérification…" : "Entrer"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-ink-faint">Accès réservé à l&rsquo;équipe votrecourtier.ch</p>
      </div>
    </div>
  );
}
