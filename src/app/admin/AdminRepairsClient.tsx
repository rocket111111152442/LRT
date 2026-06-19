"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { REPAIR_STATUSES } from "@/lib/repairValidation";
import type { RepairStatus } from "@/lib/repairValidation";

type RepairListItem = {
  id: string;
  ticketNumber: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  deviceType: string;
  brand: string;
  model: string;
  status: RepairStatus;
  urgent: boolean;
  expectedPickupAt: unknown;
  estimatedPriceCents: number | null;
  partsCostCents: number | null;
  paidAmountCents: number;
  paymentStatus: string;
  customerType: string;
  quoteStatus: "NONE" | "SENT" | "ACCEPTED" | "REFUSED";
  quoteRespondedAt: unknown;
  readyEmailSent: boolean;
  archivedAt: string | null;
  createdAt: unknown;
  updatedAt: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function readQuoteStatus(value: unknown): RepairListItem["quoteStatus"] {
  return value === "SENT" || value === "ACCEPTED" || value === "REFUSED"
    ? value
    : "NONE";
}

function readDate(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (isRecord(value)) {
    const seconds = value.seconds ?? value._seconds;

    if (typeof seconds === "number") {
      return new Date(seconds * 1000);
    }
  }

  return null;
}

function formatDate(value: unknown) {
  const date = readDate(value);

  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function readNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
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

function normalizeRepairs(value: unknown): RepairListItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((repair) => ({
    id: readString(repair.id),
    ticketNumber: readString(repair.ticketNumber) || null,
    firstName: readString(repair.firstName, "-"),
    lastName: readString(repair.lastName),
    phone: readString(repair.phone, "-"),
    email: readString(repair.email, "-"),
    deviceType: readString(repair.deviceType, "-"),
    brand: readString(repair.brand),
    model: readString(repair.model),
    status: REPAIR_STATUSES.includes(repair.status as RepairStatus)
      ? (repair.status as RepairStatus)
      : "PAS_ENCORE_EN_REPARATION",
    urgent: readBoolean(repair.urgent),
    expectedPickupAt: repair.expectedPickupAt,
    estimatedPriceCents:
      typeof repair.estimatedPriceCents === "number"
        ? repair.estimatedPriceCents
        : null,
    partsCostCents:
      typeof repair.partsCostCents === "number" ? repair.partsCostCents : null,
    paidAmountCents: readNumber(repair.paidAmountCents),
    paymentStatus: readString(repair.paymentStatus, "NON_PAYE"),
    customerType: readString(repair.customerType, "STANDARD"),
    quoteStatus: readQuoteStatus(repair.quoteStatus),
    quoteRespondedAt: repair.quoteRespondedAt,
    readyEmailSent: readBoolean(repair.readyEmailSent),
    archivedAt: readString(repair.archivedAt) || null,
    createdAt: repair.createdAt,
    updatedAt: repair.updatedAt,
  }));
}

export function AdminRepairsClient() {
  const [repairs, setRepairs] = useState<RepairListItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [exportMonth, setExportMonth] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (status) {
      params.set("status", status);
    }

    return params.toString();
  }, [search, status]);

  const apiUrl = queryString ? `/api/admin/repairs?${queryString}` : "/api/admin/repairs";
  const exportQueryString = useMemo(() => {
    const params = new URLSearchParams(queryString);

    if (exportMonth) {
      params.set("month", exportMonth);
    }

    return params.toString();
  }, [exportMonth, queryString]);
  const exportUrl = exportQueryString
    ? `/api/admin/repairs/export?${exportQueryString}`
    : "/api/admin/repairs/export";
  const quoteNotifications = repairs
    .filter(
      (repair) =>
        repair.quoteStatus === "ACCEPTED" || repair.quoteStatus === "REFUSED",
    )
    .sort(
      (left, right) =>
        Number(readDate(right.quoteRespondedAt)?.getTime() ?? 0) -
        Number(readDate(left.quoteRespondedAt)?.getTime() ?? 0),
    )
    .slice(0, 5);
  const acceptedQuotesCount = repairs.filter(
    (repair) => repair.quoteStatus === "ACCEPTED",
  ).length;
  const refusedQuotesCount = repairs.filter(
    (repair) => repair.quoteStatus === "REFUSED",
  ).length;

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(apiUrl, {
          signal: controller.signal,
        });

        if (response.status === 401) {
          window.location.href = "/admin/login";
          return;
        }

        const payload = await response.json();

        if (!response.ok) {
          setError(payload.error ?? "Chargement impossible.");
          return;
        }

        setRepairs(normalizeRepairs(payload.repairs));
      } catch {
        if (!controller.signal.aborted) {
          setError("Chargement impossible.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [apiUrl]);

  async function downloadCsv() {
    setIsExporting(true);
    setError("");

    try {
      const response = await fetch(exportUrl);

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(
          isRecord(payload)
            ? readString(payload.error, "Export impossible.")
            : "Export impossible.",
        );
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "repairs-lrt.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Export impossible.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="grid gap-5">
      <div className="grid min-w-0 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)_minmax(180px,220px)_auto]">
        <div className="grid min-w-0 gap-2">
          <label htmlFor="repair-search" className="text-sm font-medium text-slate-800">
            Recherche
          </label>
          <input
            id="repair-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nom, telephone, email, marque ou modele"
            className="min-h-11 w-full min-w-0 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
          />
        </div>
        <div className="grid min-w-0 gap-2">
          <label htmlFor="repair-status" className="text-sm font-medium text-slate-800">
            Statut
          </label>
          <select
            id="repair-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="min-h-11 w-full min-w-0 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
          >
            <option value="">Tous les statuts</option>
            {REPAIR_STATUSES.map((repairStatus) => (
              <option key={repairStatus} value={repairStatus}>
                {repairStatus}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <div className="grid min-w-0 gap-2">
            <label htmlFor="export-month" className="text-sm font-medium text-slate-800">
              Mois export
            </label>
            <input
              id="export-month"
              type="month"
              value={exportMonth}
              onChange={(event) => setExportMonth(event.target.value)}
              className="min-h-11 w-full min-w-0 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            />
          </div>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={downloadCsv}
            disabled={isExporting}
            className="min-h-11 w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 lg:w-fit"
          >
            {isExporting ? "Export..." : "Export CSV"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {quoteNotifications.length > 0 ? (
        <div className="grid gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-emerald-950">
                Reponses de devis client
              </h2>
              <p className="text-sm text-emerald-800">
                {acceptedQuotesCount} devis accepte(s)
                {refusedQuotesCount > 0
                  ? `, ${refusedQuotesCount} devis refuse(s)`
                  : ""}
                .
              </p>
            </div>
          </div>
          <div className="grid gap-2">
            {quoteNotifications.map((repair) => (
              <div
                key={`quote-${repair.id}`}
                className="flex flex-col gap-2 rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-slate-800">
                  <strong className="text-slate-950">
                    {repair.ticketNumber ?? repair.id.slice(0, 8)}
                  </strong>{" "}
                  - {repair.firstName} {repair.lastName} a{" "}
                  {repair.quoteStatus === "ACCEPTED" ? "accepte" : "refuse"} le
                  devis
                  {formatDate(repair.quoteRespondedAt) !== "-"
                    ? ` le ${formatDate(repair.quoteRespondedAt)}`
                    : ""}
                  .
                </span>
                <Link
                  href={`/admin/repairs/${repair.id}`}
                  className="w-fit rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-800"
                >
                  Voir
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Ticket</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Appareil</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Planning</th>
                <th className="px-4 py-3 font-semibold">Paiement</th>
                <th className="px-4 py-3 font-semibold">Devis</th>
                <th className="px-4 py-3 font-semibold">Creee le</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {repairs.map((repair, index) => (
                <tr
                  key={repair.id || repair.ticketNumber || `repair-${index}`}
                  className="align-top"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-950">
                      {repair.firstName} {repair.lastName}
                    </div>
                    {repair.archivedAt ? (
                      <div className="mt-1 text-xs font-semibold text-slate-500">
                        Archivee
                      </div>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {repair.urgent ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                          Urgent
                        </span>
                      ) : null}
                      {repair.customerType !== "STANDARD" ? (
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">
                          {repair.customerType}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-950">
                    {repair.ticketNumber ?? (repair.id ? repair.id.slice(0, 8) : "-")}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{repair.phone}</div>
                    <div>{repair.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{repair.deviceType}</div>
                    <div>
                      {repair.brand} {repair.model}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{repair.status}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDate(repair.expectedPickupAt)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{repair.paymentStatus}</div>
                    <div className="text-xs text-slate-500">
                      {formatPrice(repair.paidAmountCents)} /{" "}
                      {formatPrice(repair.estimatedPriceCents)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <QuoteBadge status={repair.quoteStatus} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDate(repair.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {repair.id ? (
                      <Link
                        href={`/admin/repairs/${repair.id}`}
                        className="font-semibold text-slate-950 underline-offset-4 hover:underline"
                      >
                        Voir
                      </Link>
                    ) : (
                      <span className="text-sm text-slate-500">Indisponible</span>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && repairs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-600">
                    Aucune reparation trouvee.
                  </td>
                </tr>
              ) : null}
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-600">
                    Chargement...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function QuoteBadge({ status }: { status: RepairListItem["quoteStatus"] }) {
  if (status === "ACCEPTED") {
    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
        Devis accepte
      </span>
    );
  }

  if (status === "REFUSED") {
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
        Devis refuse
      </span>
    );
  }

  if (status === "SENT") {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
        Devis envoye
      </span>
    );
  }

  return <span className="text-xs text-slate-400">-</span>;
}
