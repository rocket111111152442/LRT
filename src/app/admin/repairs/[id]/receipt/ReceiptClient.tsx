"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type ReceiptRepair = {
  id: string;
  ticketNumber: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  deviceType: string;
  brand: string;
  model: string;
  issueDescription: string;
  status: string;
  estimatedPriceCents: number | null;
  createdAt: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(cents: number | null) {
  if (!cents) {
    return "-";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function ReceiptClient({ repairId }: { repairId: string }) {
  const [repair, setRepair] = useState<ReceiptRepair | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRepair() {
      try {
        const response = await fetch(`/api/admin/repairs/${repairId}`);
        const payload = await response.json();

        if (!response.ok) {
          setError(payload.error ?? "Recu indisponible.");
          return;
        }

        if (!cancelled) {
          setRepair(payload.repair);
        }
      } catch {
        if (!cancelled) {
          setError("Recu indisponible.");
        }
      }
    }

    void loadRepair();

    return () => {
      cancelled = true;
    };
  }, [repairId]);

  if (error) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (!repair) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        Chargement...
      </div>
    );
  }

  const trackingUrl =
    typeof window === "undefined" ? "/suivi" : `${window.location.origin}/suivi`;

  return (
    <section className="grid gap-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/admin/repairs/${repair.id}`}
          className="font-semibold text-slate-950 underline-offset-4 hover:underline"
        >
          Retour a la fiche
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Imprimer
        </button>
      </div>

      <article className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recu de depot LRT
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            {repair.ticketNumber ?? repair.id}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Cree le {formatDate(repair.createdAt)}
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
          <dl className="grid gap-4 sm:grid-cols-2">
            <ReceiptItem label="Client" value={`${repair.firstName} ${repair.lastName}`} />
            <ReceiptItem label="Telephone" value={repair.phone} />
            <ReceiptItem label="Email" value={repair.email} />
            <ReceiptItem label="Statut" value={repair.status} />
            <ReceiptItem
              label="Appareil"
              value={`${repair.deviceType} ${repair.brand} ${repair.model}`}
            />
            <ReceiptItem label="Prix estime" value={formatPrice(repair.estimatedPriceCents)} />
            <ReceiptItem label="Probleme" value={repair.issueDescription} wide />
          </dl>
          <div className="grid content-start justify-items-center gap-2 rounded-md border border-slate-200 p-3">
            <QRCodeSVG
              value={trackingUrl}
              size={128}
              marginSize={2}
            />
            <p className="text-center text-xs text-slate-500">
              Scanner pour suivre avec le ticket
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}

function ReceiptItem({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "grid gap-1 sm:col-span-2" : "grid gap-1"}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="whitespace-pre-wrap text-sm text-slate-950">{value}</dd>
    </div>
  );
}
