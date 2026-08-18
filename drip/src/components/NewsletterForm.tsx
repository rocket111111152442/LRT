"use client";

import { useState } from "react";

export function NewsletterForm({ source = "site" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (state === "loading") return;

    setState("loading");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setState("error");
        setMessage(data.error ?? "Inscription impossible.");
        return;
      }

      setState("done");
      setMessage("C'est noté. Bienvenue.");
      setEmail("");
    } catch {
      setState("error");
      setMessage("Connexion impossible. Réessayez.");
    }
  };

  if (state === "done") {
    return (
      <p className="label border border-current px-4 py-3.5" role="status">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex items-stretch border-b border-current">
        <label htmlFor={`newsletter-${source}`} className="sr-only">
          Votre adresse e-mail
        </label>
        <input
          id={`newsletter-${source}`}
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="votre@email.com"
          className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[color:var(--color-smoke)]"
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="label shrink-0 px-2 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1 disabled:opacity-40"
        >
          {state === "loading" ? "…" : "OK"}
        </button>
      </div>

      {state === "error" && (
        <p className="label-sm text-[color:var(--color-smoke)]" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
