"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

export type AgendaRepair = {
  id: string;
  ticketNumber: string | null;
  firstName: string;
  lastName: string;
  deviceType: string;
  brand: string;
  model: string;
  status: string;
  quoteStatus: string;
  urgent: boolean;
  expectedPickupAt: string | null;
  technicianName: string | null;
};

type AdminAgendaCalendarProps = {
  repairs: AgendaRepair[];
};

const monthFormatter = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
});

const weekdayFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
});

const dayFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

function monthStart(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function isoDay(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateTimeToInput(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
}

function dateFromInput(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function buildMonthDays(month: Date) {
  const first = monthStart(month);
  const firstDay = first.getDay() === 0 ? 7 : first.getDay();
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - firstDay + 1);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function formatRepairTitle(repair: AgendaRepair) {
  return `${repair.ticketNumber ?? repair.id.slice(0, 8)} - ${repair.firstName} ${
    repair.lastName
  }`;
}

function formatRepairDevice(repair: AgendaRepair) {
  return [repair.deviceType, repair.brand, repair.model].filter(Boolean).join(" ");
}

function sortByDate(left: AgendaRepair, right: AgendaRepair) {
  const leftTime = left.expectedPickupAt
    ? new Date(left.expectedPickupAt).getTime()
    : Number.MAX_SAFE_INTEGER;
  const rightTime = right.expectedPickupAt
    ? new Date(right.expectedPickupAt).getTime()
    : Number.MAX_SAFE_INTEGER;

  return leftTime - rightTime;
}

function isSameMonth(value: string, month: Date) {
  const date = new Date(value);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === month.getFullYear() &&
    date.getMonth() === month.getMonth()
  );
}

function formatFullDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function AdminAgendaCalendar({ repairs }: AdminAgendaCalendarProps) {
  const [items, setItems] = useState(repairs);
  const [currentMonth, setCurrentMonth] = useState(() => monthStart(new Date()));
  const nowInput = dateTimeToInput(new Date());
  const [selectedRepairId, setSelectedRepairId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(nowInput.date);
  const [appointmentTime, setAppointmentTime] = useState("10:00");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const days = useMemo(() => buildMonthDays(currentMonth), [currentMonth]);
  const scheduledRepairs = items
    .filter((repair) => repair.expectedPickupAt)
    .sort(sortByDate);
  const unscheduledRepairs = items.filter((repair) => !repair.expectedPickupAt);
  const visibleMonthRepairs = scheduledRepairs
    .filter((repair) => isSameMonth(repair.expectedPickupAt!, currentMonth))
    .slice(0, 8);
  const selectedRepair = unscheduledRepairs.find(
    (repair) => repair.id === selectedRepairId,
  );

  function moveMonth(delta: number) {
    setCurrentMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + delta);
      return monthStart(next);
    });
  }

  async function scheduleRepair(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!selectedRepairId) {
      setError("Choisissez une reparation a placer.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/repairs/${selectedRepairId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedPickupAt: `${appointmentDate}T${appointmentTime}`,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        setError(payload.error ?? "Placement impossible.");
        return;
      }

      const updated = payload.repair as AgendaRepair;
      const expectedPickupAt =
        updated.expectedPickupAt ??
        new Date(`${appointmentDate}T${appointmentTime}:00`).toISOString();
      setItems((current) =>
        current.map((repair) =>
          repair.id === selectedRepairId
            ? {
                ...repair,
                ...updated,
                expectedPickupAt,
              }
            : repair,
        ),
      );
      setCurrentMonth(monthStart(dateFromInput(appointmentDate)));
      setSelectedRepairId("");
      setMessage("Reparation placee dans l'agenda.");
    } catch {
      setError("Placement impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="grid gap-5">
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_380px]">
        <div className="grid gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                Calendrier
              </p>
              <h2 className="text-2xl font-semibold capitalize text-slate-950">
                {monthFormatter.format(currentMonth)}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Mois precedent
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth(monthStart(new Date()))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Aujourd&apos;hui
              </button>
              <button
                type="button"
                onClick={() => moveMonth(1)}
                className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Mois suivant
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            {days.slice(0, 7).map((date) => (
              <span key={date.toISOString()}>{weekdayFormatter.format(date)}</span>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
            {days.map((date) => {
              const key = isoDay(date);
              const dayRepairs = scheduledRepairs.filter(
                (repair) =>
                  repair.expectedPickupAt &&
                  isoDay(new Date(repair.expectedPickupAt)) === key,
              );
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

              return (
                <article
                  key={key}
                  className={`min-h-36 rounded-xl border p-3 ${
                    isCurrentMonth
                      ? "border-slate-200 bg-white"
                      : "border-slate-100 bg-slate-50 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-sm text-slate-950">
                      {dayFormatter.format(date)}
                    </strong>
                    {dayRepairs.length > 0 ? (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                        {dayRepairs.length}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 grid gap-2">
                    {dayRepairs.slice(0, 3).map((repair) => (
                      <Link
                        key={repair.id}
                        href={`/admin/repairs/${repair.id}`}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left transition hover:border-sky-200 hover:bg-sky-50"
                      >
                        <span className="block text-xs font-semibold text-slate-950">
                          {timeFormatter.format(new Date(repair.expectedPickupAt!))}
                        </span>
                        <span className="mt-1 block truncate text-xs text-slate-700">
                          {formatRepairTitle(repair)}
                        </span>
                      </Link>
                    ))}
                    {dayRepairs.length > 3 ? (
                      <span className="text-xs font-semibold text-slate-500">
                        +{dayRepairs.length - 3} autre(s)
                      </span>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="grid content-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              A placer
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Devis et reparations sans creneau
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Choisissez une fiche, puis donnez-lui un jour et une heure precise.
            </p>
          </div>

          <form onSubmit={scheduleRepair} className="grid gap-3">
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Fiche
              <select
                value={selectedRepairId}
                onChange={(event) => setSelectedRepairId(event.target.value)}
                className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">Choisir...</option>
                {unscheduledRepairs.map((repair) => (
                  <option key={repair.id} value={repair.id}>
                    {formatRepairTitle(repair)} - {formatRepairDevice(repair)}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <label className="grid gap-2 text-sm font-medium text-slate-800">
                Jour
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(event) => setAppointmentDate(event.target.value)}
                  className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-800">
                Heure
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(event) => setAppointmentTime(event.target.value)}
                  className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </label>
            </div>
            {selectedRepair ? (
              <p className="rounded-lg border border-white bg-white px-3 py-2 text-xs text-slate-600">
                {formatRepairDevice(selectedRepair)} - {selectedRepair.status}
              </p>
            ) : null}
            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSaving || unscheduledRepairs.length === 0}
              className="min-h-11 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {isSaving ? "Placement..." : "Placer dans l'agenda"}
            </button>
          </form>

          <div className="grid gap-3 border-t border-slate-200 pt-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                Rendez-vous enregistres
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Les fiches placees apparaissent ici pour le mois selectionne.
              </p>
            </div>
            {visibleMonthRepairs.length > 0 ? (
              <div className="grid gap-2">
                {visibleMonthRepairs.map((repair) => (
                  <Link
                    key={`upcoming-${repair.id}`}
                    href={`/admin/repairs/${repair.id}`}
                    className="rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-cyan-200 hover:bg-cyan-50"
                  >
                    <span className="block text-xs font-semibold uppercase tracking-wide text-cyan-700">
                      {formatFullDate(repair.expectedPickupAt!)}
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-slate-950">
                      {formatRepairTitle(repair)}
                    </span>
                    <span className="mt-1 block text-xs text-slate-600">
                      {formatRepairDevice(repair)} - {repair.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                Aucun rendez-vous place pour le moment.
              </p>
            )}
          </div>
        </aside>
      </div>

      {unscheduledRepairs.length === 0 && scheduledRepairs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Aucune reparation active dans l&apos;agenda.
        </div>
      ) : null}
    </section>
  );
}
