"use client";

import { useEffect, useState } from "react";

type StatsPayload = {
  totalRepairs: number;
  byStatus: Record<string, number>;
  byBrand: Record<string, number>;
  estimatedRevenueCents: number;
  partsCostCents: number;
  estimatedProfitCents: number;
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
  const [isSendingReminders, setIsSendingReminders] = useState(false);

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

  const brandEntries = Object.entries(stats.byBrand)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);

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

  return (
    <section className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard label="Total" value={String(stats.totalRepairs)} />
        <StatCard
          label="En reparation"
          value={String(stats.byStatus.EN_REPARATION ?? 0)}
        />
        <StatCard label="Prets" value={String(stats.byStatus.PRET ?? 0)} />
        <StatCard label="Recuperes" value={String(stats.byStatus.RECUPERE ?? 0)} />
        <StatCard
          label="CA estime"
          value={formatPrice(stats.estimatedRevenueCents)}
        />
        <StatCard
          label="Cout pieces"
          value={formatPrice(stats.partsCostCents ?? 0)}
        />
        <StatCard
          label="Benefice"
          value={formatPrice(stats.estimatedProfitCents ?? 0)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
            Alertes stock
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Valeur achat stock : {formatPrice(stats.inventoryValueCents ?? 0)}
          </p>
          <div className="mt-3 grid gap-2">
            {stats.lowStockItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-slate-700">{item.name}</span>
                <strong className="text-red-700">
                  {item.quantity} restant(s) - {formatPrice(item.unitCostCents ?? 0)}
                </strong>
              </div>
            ))}
            {stats.lowStockItems.length === 0 ? (
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
