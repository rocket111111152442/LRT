"use client";

import { useEffect, useState } from "react";

type StatsPayload = {
  totalRepairs: number;
  byStatus: Record<string, number>;
  byBrand: Record<string, number>;
  byIssue: Record<string, number>;
  monthlyGoal: number;
  monthlyRepairs: number;
  estimatedRevenueCents: number;
  paidRevenueCents: number;
  partsCostCents: number;
  estimatedProfitCents: number;
  realProfitCents: number;
  monthlyRevenueCents: number;
  monthlyPaidRevenueCents: number;
  monthlyPartsCostCents: number;
  monthlyProfitCents: number;
  inventoryValueCents: number;
  lowStockItems: Array<{
    id: string;
    name: string;
    quantity: number;
    lowStockThreshold: number;
    unitCostCents?: number | null;
  }>;
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function AdminStatsClient() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [error, setError] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const [archiveMessage, setArchiveMessage] = useState("");
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const response = await fetch("/api/admin/stats");
        const payload = await response.json();

        if (!response.ok) {
          setError(payload.error ?? "Stats indisponibles.");
          return;
        }

        if (!cancelled) {
          setStats(payload);
        }
      } catch {
        if (!cancelled) {
          setError("Stats indisponibles.");
        }
      }
    }

    void loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        Chargement des chiffres...
      </div>
    );
  }

  const byBrand = stats.byBrand ?? {};
  const byIssue = stats.byIssue ?? {};
  const byStatus = stats.byStatus ?? {};
  const lowStockItems = Array.isArray(stats.lowStockItems)
    ? stats.lowStockItems
    : [];
  const brandEntries = Object.entries(byBrand)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);
  const issueEntries = Object.entries(byIssue)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);
  const goalPercent = Math.min(
    Math.round((stats.monthlyRepairs / Math.max(stats.monthlyGoal, 1)) * 100),
    100,
  );

  async function sendReminders() {
    setIsSendingReminders(true);
    setReminderMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/reminders", { method: "POST" });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Relances impossibles.");
        return;
      }

      setReminderMessage(
        `${payload.sent} relance(s) envoyee(s) sur ${payload.attempted} tentative(s).`,
      );
    } catch {
      setError("Relances impossibles.");
    } finally {
      setIsSendingReminders(false);
    }
  }

  async function archiveOldRepairs() {
    setIsArchiving(true);
    setArchiveMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/archive-old", { method: "POST" });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Archivage impossible.");
        return;
      }

      setArchiveMessage(`${payload.archived} reparation(s) archivee(s).`);
    } catch {
      setError("Archivage impossible.");
    } finally {
      setIsArchiving(false);
    }
  }

  return (
    <section className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard label="Total" value={String(stats.totalRepairs)} />
        <StatCard
          label="En reparation"
          value={String(byStatus.EN_REPARATION ?? 0)}
        />
        <StatCard label="Prets" value={String(byStatus.PRET ?? 0)} />
        <StatCard label="Recuperes" value={String(byStatus.RECUPERE ?? 0)} />
        <StatCard
          label="CA estime"
          value={formatPrice(stats.estimatedRevenueCents)}
        />
        <StatCard
          label="CA encaisse"
          value={formatPrice(stats.paidRevenueCents ?? 0)}
        />
        <StatCard
          label="Cout pieces"
          value={formatPrice(stats.partsCostCents ?? 0)}
        />
        <StatCard
          label="Benefice"
          value={formatPrice(stats.estimatedProfitCents ?? 0)}
        />
        <StatCard
          label="Benefice reel"
          value={formatPrice(stats.realProfitCents ?? 0)}
        />
        <StatCard
          label="Mois"
          value={`${stats.monthlyRepairs}/${stats.monthlyGoal}`}
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Objectif mensuel
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {stats.monthlyRepairs} reparation(s) ce mois-ci sur objectif{" "}
              {stats.monthlyGoal}.
            </p>
          </div>
          <strong className="text-lg text-slate-950">{goalPercent}%</strong>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-950"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
        <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
          <span>CA mois : {formatPrice(stats.monthlyRevenueCents ?? 0)}</span>
          <span>Encaisse : {formatPrice(stats.monthlyPaidRevenueCents ?? 0)}</span>
          <span>Benefice mois : {formatPrice(stats.monthlyProfitCents ?? 0)}</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Marques
          </h2>
          <div className="mt-3 grid gap-2">
            {brandEntries.map(([brand, count]) => (
              <div key={brand} className="flex justify-between text-sm">
                <span className="text-slate-700">{brand}</span>
                <strong className="text-slate-950">{count}</strong>
              </div>
            ))}
            {brandEntries.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune donnee.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Top pannes
          </h2>
          <div className="mt-3 grid gap-2">
            {issueEntries.map(([issue, count]) => (
              <div key={issue} className="flex justify-between gap-3 text-sm">
                <span className="truncate text-slate-700">{issue}</span>
                <strong className="text-slate-950">{count}</strong>
              </div>
            ))}
            {issueEntries.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune donnee.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Alertes stock
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Valeur achat stock : {formatPrice(stats.inventoryValueCents ?? 0)}
          </p>
          <div className="mt-3 grid gap-2">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-slate-700">{item.name}</span>
                <strong className="text-red-700">
                  {item.quantity} restant(s) - {formatPrice(item.unitCostCents ?? 0)}
                </strong>
              </div>
            ))}
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune alerte.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Relances
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Envoie un rappel aux clients dont l&apos;appareil est pret depuis 7 jours.
          </p>
        </div>
        <button
          type="button"
          onClick={sendReminders}
          disabled={isSendingReminders}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSendingReminders ? "Envoi..." : "Envoyer les relances"}
        </button>
        {reminderMessage ? (
          <p className="basis-full text-sm text-emerald-700">{reminderMessage}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Archivage intelligent
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Archive les reparations recuperees depuis plus de 30 jours.
          </p>
        </div>
        <button
          type="button"
          onClick={archiveOldRepairs}
          disabled={isArchiving}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isArchiving ? "Archivage..." : "Archiver automatiquement"}
        </button>
        {archiveMessage ? (
          <p className="basis-full text-sm text-emerald-700">{archiveMessage}</p>
        ) : null}
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
