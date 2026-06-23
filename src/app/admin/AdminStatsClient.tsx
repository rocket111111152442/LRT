"use client";

import { useEffect, useState } from "react";

type MonthlyPoint = {
  label: string;
  year: number;
  count: number;
  revenueCents: number;
};

type StatsPayload = {
  monthlySeries?: MonthlyPoint[];
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
  const [goalInput, setGoalInput] = useState("");
  const [goalMessage, setGoalMessage] = useState("");
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
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
          setGoalInput(String(payload.monthlyGoal ?? 100));
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

  async function saveMonthlyGoal() {
    const monthlyGoal = Number(goalInput);

    if (!Number.isInteger(monthlyGoal) || monthlyGoal < 1) {
      setError("Entrez un objectif mensuel valide.");
      return;
    }

    setIsSavingGoal(true);
    setGoalMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/stats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyGoal }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Objectif impossible a modifier.");
        return;
      }

      setStats((currentStats) =>
        currentStats
          ? { ...currentStats, monthlyGoal: payload.monthlyGoal }
          : currentStats,
      );
      setGoalInput(String(payload.monthlyGoal));
      setIsEditingGoal(false);
      setGoalMessage("Objectif mensuel mis a jour.");
    } catch {
      setError("Objectif impossible a modifier.");
    } finally {
      setIsSavingGoal(false);
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
        <GoalStatCard
          monthlyRepairs={stats.monthlyRepairs}
          monthlyGoal={stats.monthlyGoal}
          value={goalInput}
          isEditing={isEditingGoal}
          isSaving={isSavingGoal}
          onChange={setGoalInput}
          onEdit={() => {
            setGoalInput(String(stats.monthlyGoal));
            setGoalMessage("");
            setIsEditingGoal(true);
          }}
          onCancel={() => {
            setGoalInput(String(stats.monthlyGoal));
            setIsEditingGoal(false);
          }}
          onSave={() => void saveMonthlyGoal()}
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
            {goalMessage ? (
              <p className="mt-1 text-sm font-semibold text-emerald-700">
                {goalMessage}
              </p>
            ) : null}
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

      <RevenueChart series={stats.monthlySeries ?? []} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Marques
          </h2>
          <div className="mt-3 grid gap-2.5">
            {brandEntries.map(([brand, count]) => (
              <BarRow
                key={brand}
                label={brand}
                value={count}
                max={brandEntries[0]?.[1] ?? 1}
                tone="bg-brand-blue"
              />
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
          <div className="mt-3 grid gap-2.5">
            {issueEntries.map(([issue, count]) => (
              <BarRow
                key={issue}
                label={issue}
                value={count}
                max={issueEntries[0]?.[1] ?? 1}
                tone="bg-brand-green"
              />
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

function BarRow({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: string;
}) {
  const percent = Math.max(4, Math.round((value / Math.max(max, 1)) * 100));
  return (
    <div className="grid gap-1">
      <div className="flex justify-between gap-3 text-sm">
        <span className="truncate text-slate-700">{label}</span>
        <strong className="text-slate-950">{value}</strong>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function RevenueChart({ series }: { series: MonthlyPoint[] }) {
  if (series.length === 0) {
    return null;
  }

  const maxRevenue = Math.max(...series.map((point) => point.revenueCents), 1);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Chiffre d&apos;affaires encaissé — 6 derniers mois
      </h2>
      <div className="mt-4 flex items-end justify-between gap-2" style={{ height: "180px" }}>
        {series.map((point) => {
          const heightPercent = Math.round((point.revenueCents / maxRevenue) * 100);
          return (
            <div key={`${point.label}-${point.year}`} className="flex flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-semibold text-slate-700">
                {formatPrice(point.revenueCents)}
              </span>
              <div
                className="w-full max-w-[48px] rounded-t-lg bg-gradient-to-t from-brand-blue to-brand-green transition-all"
                style={{ height: `${Math.max(2, heightPercent)}%` }}
                title={`${point.count} réparation(s)`}
              />
              <span className="text-xs text-slate-500">{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function GoalStatCard({
  monthlyRepairs,
  monthlyGoal,
  value,
  isEditing,
  isSaving,
  onChange,
  onEdit,
  onCancel,
  onSave,
}: {
  monthlyRepairs: number;
  monthlyGoal: number;
  value: string;
  isEditing: boolean;
  isSaving: boolean;
  onChange: (value: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div
      className={`min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${
        isEditing ? "sm:col-span-2 lg:col-span-2" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Mois
        </p>
        {!isEditing ? (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-semibold text-slate-700 underline-offset-4 hover:underline"
          >
            Modifier
          </button>
        ) : null}
      </div>

      {!isEditing ? (
        <p className="mt-2 text-2xl font-semibold text-slate-950">
          {monthlyRepairs}/{monthlyGoal}
        </p>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
          className="mt-3 grid gap-2"
        >
          <label htmlFor="monthly-goal" className="text-xs font-semibold text-slate-600">
            Objectif
          </label>
          <input
            id="monthly-goal"
            type="number"
            min="1"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="min-h-10 w-full min-w-0 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "..." : "OK"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
