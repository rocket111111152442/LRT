"use client";

import { FormEvent, useState } from "react";
import { normalizeTicketNumber } from "@/lib/ticketFormat";

type DepositClientProps = {
  proAccountSlug: string;
  shopName: string;
};

type DepositResult = {
  ticketNumber: string | null;
  status: string;
  alreadyDeposited: boolean;
  message: string;
};

export function DepositClient({ proAccountSlug, shopName }: DepositClientProps) {
  const [ticketNumber, setTicketNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<DepositResult | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    const normalizedTicket = normalizeTicketNumber(ticketNumber);
    setTicketNumber(normalizedTicket);

    if (!normalizedTicket) {
      setError("Entrez votre numero de ticket.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/repair-deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proAccountSlug,
          ticketNumber: normalizedTicket,
          email,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload.error ?? "Depot impossible.");
        return;
      }

      setResult({
        ticketNumber: payload.repair?.ticketNumber ?? normalizedTicket,
        status: payload.repair?.status ?? "PAS_ENCORE_EN_REPARATION",
        alreadyDeposited: payload.alreadyDeposited === true,
        message: payload.message ?? "Depot confirme.",
      });
    } catch {
      setError("Depot impossible.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
          Depot appareil
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">
          Confirmer le depot chez {shopName}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Entrez le numero de ticket recu par email. Cette confirmation prouve
          que l&apos;appareil a ete depose au magasin et met la fiche en statut
          pas encore en reparation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Numero de ticket
          <input
            type="text"
            value={ticketNumber}
            onChange={(event) =>
              setTicketNumber(normalizeTicketNumber(event.target.value))
            }
            placeholder="QOR-000123"
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Email du dossier
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 self-end rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 sm:col-span-2"
        >
          {isSubmitting ? "Confirmation..." : "Confirmer le depot"}
        </button>
      </form>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="grid gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">{result.message}</p>
          <p>
            Ticket : <strong>{result.ticketNumber}</strong>
          </p>
          <p>
            Statut actuel : <strong>{result.status}</strong>
          </p>
          {result.alreadyDeposited ? (
            <p>Cet appareil etait deja marque comme depose.</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
