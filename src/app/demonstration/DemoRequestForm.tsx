"use client";

import { FormEvent, useState } from "react";
import { track } from "@vercel/analytics";

export function DemoRequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setFeedback("");
    setError("");
    try {
      const response = await fetch("/api/contact-offre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          offre: "demo",
          message: message || "Je souhaite une démonstration de Qoravo de 15 minutes.",
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload.error ?? Object.values(payload.errors ?? {})[0] ?? "Envoi impossible.");
        return;
      }
      setFeedback("Demande envoyée. Nous vous recontactons pour choisir un créneau.");
      track("demo_request_sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError("Envoi impossible pour le moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Échange de 15 minutes</p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Voir Qoravo avec votre propre organisation</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Expliquez simplement comment fonctionne votre atelier. La demande est gratuite et ne crée aucun abonnement.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-800">Votre nom<input value={name} onChange={(event) => setName(event.target.value)} required className="min-h-11 rounded-md border border-slate-300 px-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" /></label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">Votre email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="min-h-11 rounded-md border border-slate-300 px-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" /></label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-slate-800">Ce que vous souhaitez vérifier<textarea rows={3} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Exemple : devis, suivi client et gestion du stock" className="rounded-md border border-slate-300 p-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" /></label>
      {feedback ? <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{feedback}</p> : null}
      {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
      <button type="submit" disabled={sending} className="q-btn q-btn-primary w-fit disabled:cursor-not-allowed disabled:opacity-60">{sending ? "Envoi..." : "Demander ma démonstration"}</button>
    </form>
  );
}
