"use client";

import { FormEvent, useState } from "react";

type TrackedRepair = {
  ticketNumber: string;
  firstName: string;
  deviceType: string;
  brand: string;
  model: string;
  status: string;
  quoteStatus: string;
  updatedAt: string;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function normalizeTicket(value: string) {
  const normalized = value
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  if (/^LRT\d{6}$/.test(normalized)) {
    return `LRT-${normalized.slice(3)}`;
  }

  return normalized;
}

export function TrackingClient() {
  const [ticket, setTicket] = useState("");
  const [repair, setRepair] = useState<TrackedRepair | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setRepair(null);
    const normalizedTicket = normalizeTicket(ticket).trim().replace(/^-|-$/g, "");
    setTicket(normalizedTicket);

    if (!normalizedTicket) {
      setError("Ticket requis.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/track-repair?ticket=${encodeURIComponent(normalizedTicket)}`,
      );
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Ticket introuvable.");
        return;
      }

      setRepair(payload.repair);
    } catch {
      setError("Recherche impossible.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          type="text"
          value={ticket}
          onChange={(event) => setTicket(normalizeTicket(event.target.value))}
          placeholder="LRT-000123"
          className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
        />
        <button
          type="submit"
          disabled={isLoading || !ticket.trim()}
          className="min-h-11 rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? "Recherche..." : "Suivre"}
        </button>
      </form>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {repair ? (
        <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-500">
            Ticket {repair.ticketNumber}
          </p>
          <h2 className="text-xl font-semibold text-slate-950">
            {repair.deviceType} {repair.brand} {repair.model}
          </h2>
          <p className="text-sm text-slate-700">Bonjour {repair.firstName}</p>
          <p className="text-sm text-slate-700">
            Statut actuel : <strong>{repair.status}</strong>
          </p>
          <p className="text-sm text-slate-700">
            Devis : <strong>{repair.quoteStatus}</strong>
          </p>
          <p className="text-xs text-slate-500">
            Mis a jour le {formatDate(repair.updatedAt)}
          </p>
        </div>
      ) : null}
    </section>
  );
}
