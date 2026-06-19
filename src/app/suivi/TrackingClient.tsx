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
  estimatedPriceCents: number | null;
  paidAmountCents: number;
  paymentStatus: string;
  expectedPickupAt: string | null;
  warrantyUntil: string | null;
  signatureDone: boolean;
  updatedAt: string;
};

const steps = [
  { status: "PAS_ENCORE_EN_REPARATION", label: "Recu" },
  { status: "EN_REPARATION", label: "Diagnostic / reparation" },
  { status: "EN_ATTENTE_PIECE", label: "Piece" },
  { status: "PRET", label: "Pret" },
  { status: "RECUPERE", label: "Recupere" },
];

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

function formatOptionalDate(value: string | null) {
  return value ? formatDate(value) : "-";
}

function formatPrice(cents: number | null) {
  if (cents === null) {
    return "-";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function normalizeTicket(value: string) {
  const normalized = value
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  if (/^QOR\d{6}$/.test(normalized)) {
    return `QOR-${normalized.slice(3)}`;
  }

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
          placeholder="QOR-000123"
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
        <div className="grid gap-5 rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-500">
            Ticket {repair.ticketNumber}
          </p>
          <h2 className="text-xl font-semibold text-slate-950">
            {repair.deviceType} {repair.brand} {repair.model}
          </h2>
          <p className="text-sm text-slate-700">Bonjour {repair.firstName}</p>
          <div className="grid gap-2 sm:grid-cols-5">
            {steps.map((step, index) => {
              const currentIndex = Math.max(
                steps.findIndex((item) => item.status === repair.status),
                0,
              );
              const isDone = index <= currentIndex;

              return (
                <div
                  key={step.status}
                  className={
                    isDone
                      ? "rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                      : "rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500"
                  }
                >
                  {step.label}
                </div>
              );
            })}
          </div>
          <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <p>
              Statut actuel : <strong>{repair.status}</strong>
            </p>
            <p>
              Devis : <strong>{repair.quoteStatus}</strong>
            </p>
            <p>
              Prix estime : <strong>{formatPrice(repair.estimatedPriceCents)}</strong>
            </p>
            <p>
              Paiement :{" "}
              <strong>
                {repair.paymentStatus} ({formatPrice(repair.paidAmountCents)})
              </strong>
            </p>
            <p>
              Recuperation prevue :{" "}
              <strong>{formatOptionalDate(repair.expectedPickupAt)}</strong>
            </p>
            <p>
              Garantie : <strong>{formatOptionalDate(repair.warrantyUntil)}</strong>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`/documents/${repair.ticketNumber}`}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              Mes documents
            </a>
            {!repair.signatureDone ? (
              <a
                href={`/signature/${repair.ticketNumber}`}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Signer la recuperation
              </a>
            ) : null}
          </div>
          <p className="text-xs text-slate-500">
            Mis a jour le {formatDate(repair.updatedAt)}
          </p>
        </div>
      ) : null}
    </section>
  );
}
