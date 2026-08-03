"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  List,
  RotateCcw,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { repairStatusLabel } from "@/lib/repairValidation";

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

type ViewMode = "calendar" | "list";

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

const longDayFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
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
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");

  return {
    date: isoDay(value),
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

function eventTone(repair: AgendaRepair) {
  if (repair.urgent) {
    return "border-red-200 bg-red-50 text-red-950 hover:border-red-300";
  }

  if (repair.status === "PRET") {
    return "border-emerald-200 bg-emerald-50 text-emerald-950 hover:border-emerald-300";
  }

  if (repair.status === "EN_ATTENTE_PIECE") {
    return "border-amber-200 bg-amber-50 text-amber-950 hover:border-amber-300";
  }

  return "border-sky-200 bg-sky-50 text-sky-950 hover:border-sky-300";
}

function StatusDot({ repair }: { repair: AgendaRepair }) {
  const color = repair.urgent
    ? "bg-red-500"
    : repair.status === "PRET"
      ? "bg-emerald-500"
      : repair.status === "EN_ATTENTE_PIECE"
        ? "bg-amber-500"
        : "bg-sky-500";

  return <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${color}`} />;
}

export function AdminAgendaCalendar({ repairs }: AdminAgendaCalendarProps) {
  const initialInput = dateTimeToInput(new Date());
  const [items, setItems] = useState(repairs);
  const [currentMonth, setCurrentMonth] = useState(() => monthStart(new Date()));
  const [selectedDay, setSelectedDay] = useState<string | null>(initialInput.date);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedRepairId, setSelectedRepairId] = useState("");
  const [editingRepairId, setEditingRepairId] = useState<string | null>(null);
  const [appointmentDate, setAppointmentDate] = useState(initialInput.date);
  const [appointmentTime, setAppointmentTime] = useState("10:00");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [lastScheduledRepair, setLastScheduledRepair] =
    useState<AgendaRepair | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [busyRepairId, setBusyRepairId] = useState<string | null>(null);

  const days = useMemo(() => buildMonthDays(currentMonth), [currentMonth]);
  const scheduledRepairs = useMemo(
    () => items.filter((repair) => repair.expectedPickupAt).sort(sortByDate),
    [items],
  );
  const unscheduledRepairs = useMemo(
    () => items.filter((repair) => !repair.expectedPickupAt),
    [items],
  );
  const visibleMonthRepairs = useMemo(
    () =>
      scheduledRepairs.filter((repair) =>
        isSameMonth(repair.expectedPickupAt!, currentMonth),
      ),
    [currentMonth, scheduledRepairs],
  );
  const repairsByDay = useMemo(() => {
    const grouped = new Map<string, AgendaRepair[]>();

    for (const repair of visibleMonthRepairs) {
      const key = isoDay(new Date(repair.expectedPickupAt!));
      const existing = grouped.get(key) ?? [];
      existing.push(repair);
      grouped.set(key, existing);
    }

    return grouped;
  }, [visibleMonthRepairs]);
  const selectedDayRepairs = selectedDay ? repairsByDay.get(selectedDay) ?? [] : [];
  const selectedRepair = items.find((repair) => repair.id === selectedRepairId);
  const planningOptions = editingRepairId
    ? items.filter(
        (repair) => repair.id === editingRepairId || !repair.expectedPickupAt,
      )
    : unscheduledRepairs;
  const todayKey = isoDay(new Date());
  const todayAppointments = scheduledRepairs.filter(
    (repair) => isoDay(new Date(repair.expectedPickupAt!)) === todayKey,
  ).length;
  const urgentThisMonth = visibleMonthRepairs.filter((repair) => repair.urgent).length;
  const slotConflicts = scheduledRepairs.filter((repair) => {
    if (!repair.expectedPickupAt || repair.id === editingRepairId) return false;
    const input = dateTimeToInput(new Date(repair.expectedPickupAt));
    return input.date === appointmentDate && input.time === appointmentTime;
  });

  function moveMonth(delta: number) {
    setCurrentMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + delta);
      const nextMonth = monthStart(next);
      setSelectedDay(null);
      return nextMonth;
    });
  }

  function goToday() {
    const today = new Date();
    const input = dateTimeToInput(today);
    setCurrentMonth(monthStart(today));
    setSelectedDay(input.date);
    setAppointmentDate(input.date);
  }

  function chooseDay(date: Date) {
    const key = isoDay(date);
    setSelectedDay(key);
    setAppointmentDate(key);

    if (!isSameMonth(date.toISOString(), currentMonth)) {
      setCurrentMonth(monthStart(date));
    }
  }

  function handleDateChange(value: string) {
    setAppointmentDate(value);
    if (!value) return;
    const date = dateFromInput(value);
    setSelectedDay(value);
    setCurrentMonth(monthStart(date));
  }

  function resetPlanning() {
    setEditingRepairId(null);
    setSelectedRepairId("");
    setError("");
    setLastScheduledRepair(null);
  }

  function startReschedule(repair: AgendaRepair) {
    if (!repair.expectedPickupAt) return;
    const date = new Date(repair.expectedPickupAt);
    const input = dateTimeToInput(date);
    setEditingRepairId(repair.id);
    setSelectedRepairId(repair.id);
    setAppointmentDate(input.date);
    setAppointmentTime(input.time);
    setSelectedDay(input.date);
    setCurrentMonth(monthStart(date));
    setMessage("");
    setError("");
  }

  async function scheduleRepair(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLastScheduledRepair(null);

    if (!selectedRepairId || !selectedRepair) {
      setError("Choisissez une reparation a placer.");
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      setError("Choisissez une date et une heure.");
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
      const scheduledRepair = {
        ...selectedRepair,
        ...updated,
        expectedPickupAt,
      };
      setItems((current) =>
        current.map((repair) =>
          repair.id === selectedRepairId ? scheduledRepair : repair,
        ),
      );
      setCurrentMonth(monthStart(dateFromInput(appointmentDate)));
      setSelectedDay(appointmentDate);
      setSelectedRepairId("");
      setEditingRepairId(null);
      setLastScheduledRepair(scheduledRepair);
      setMessage(
        editingRepairId
          ? "Rendez-vous replanifie."
          : "Reparation placee dans l'agenda.",
      );
    } catch {
      setError("Placement impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeFromAgenda(repair: AgendaRepair) {
    setBusyRepairId(repair.id);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/admin/repairs/${repair.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedPickupAt: null }),
      });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        setError(payload.error ?? "Retrait impossible.");
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === repair.id ? { ...item, expectedPickupAt: null } : item,
        ),
      );
      if (editingRepairId === repair.id) resetPlanning();
      setMessage("Rendez-vous retire de l'agenda.");
    } catch {
      setError("Retrait impossible.");
    } finally {
      setBusyRepairId(null);
    }
  }

  return (
    <section className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AgendaMetric
          icon={CalendarDays}
          label="Ce mois"
          value={visibleMonthRepairs.length}
          tone="sky"
        />
        <AgendaMetric
          icon={Clock3}
          label="Aujourd'hui"
          value={todayAppointments}
          tone="emerald"
        />
        <AgendaMetric
          icon={ClipboardList}
          label="A planifier"
          value={unscheduledRepairs.length}
          tone="violet"
        />
        <AgendaMetric
          icon={AlertTriangle}
          label="Urgents ce mois"
          value={urgentThisMonth}
          tone="red"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-sky-100 text-sky-700">
                <CalendarDays aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Planning atelier
                </p>
                <h2 className="text-xl font-semibold capitalize text-slate-950">
                  {monthFormatter.format(currentMonth)}
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("calendar")}
                  className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                    viewMode === "calendar"
                      ? "bg-white text-sky-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  <CalendarDays aria-hidden="true" className="size-4" />
                  <span className="hidden sm:inline">Calendrier</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                    viewMode === "list"
                      ? "bg-white text-sky-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  <List aria-hidden="true" className="size-4" />
                  <span className="hidden sm:inline">Liste</span>
                </button>
              </div>

              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveMonth(-1)}
                  className="grid size-10 place-items-center rounded-lg border border-slate-300 text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
                  aria-label="Mois precedent"
                  title="Mois precedent"
                >
                  <ChevronLeft aria-hidden="true" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={goToday}
                  className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-800 transition hover:border-sky-300 hover:bg-sky-50"
                >
                  Aujourd&apos;hui
                </button>
                <button
                  type="button"
                  onClick={() => moveMonth(1)}
                  className="grid size-10 place-items-center rounded-lg border border-slate-300 text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
                  aria-label="Mois suivant"
                  title="Mois suivant"
                >
                  <ChevronRight aria-hidden="true" className="size-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-600 sm:px-5">
            <LegendItem color="bg-sky-500" label="En cours" />
            <LegendItem color="bg-amber-500" label="En attente de piece" />
            <LegendItem color="bg-emerald-500" label="Pret" />
            <LegendItem color="bg-red-500" label="Urgent" />
            <span className="ml-auto hidden text-slate-500 lg:inline">
              Cliquez sur un jour pour le selectionner.
            </span>
          </div>

          {viewMode === "calendar" ? (
            <div className="overflow-x-auto p-4 sm:p-5">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {days.slice(0, 7).map((date) => (
                    <span key={date.toISOString()} className="py-1">
                      {weekdayFormatter.format(date)}
                    </span>
                  ))}
                </div>

                <div className="mt-2 grid grid-cols-7 gap-2">
                  {days.map((date) => {
                    const key = isoDay(date);
                    const dayRepairs = repairsByDay.get(key) ?? [];
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isToday = key === todayKey;
                    const isSelected = key === selectedDay;

                    return (
                      <article
                        key={key}
                        className={`min-h-32 rounded-xl border p-2 transition ${
                          isSelected
                            ? "border-sky-400 bg-sky-50/60 ring-2 ring-sky-100"
                            : isCurrentMonth
                              ? "border-slate-200 bg-white hover:border-slate-300"
                              : "border-slate-100 bg-slate-50/70 text-slate-400"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => chooseDay(date)}
                          className="flex w-full items-center justify-between gap-2 rounded-md px-1 py-1 text-left"
                          aria-label={`Planifier le ${longDayFormatter.format(date)}`}
                        >
                          <span
                            className={`grid size-7 place-items-center rounded-full text-sm font-semibold ${
                              isToday
                                ? "bg-sky-600 text-white"
                                : isCurrentMonth
                                  ? "text-slate-900"
                                  : "text-slate-400"
                            }`}
                          >
                            {dayFormatter.format(date)}
                          </span>
                          {dayRepairs.length > 0 ? (
                            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                              {dayRepairs.length}
                            </span>
                          ) : null}
                        </button>

                        <div className="mt-1 grid gap-1.5">
                          {dayRepairs.slice(0, 2).map((repair) => (
                            <Link
                              key={repair.id}
                              href={`/admin/repairs/${repair.id}`}
                              className={`block min-w-0 rounded-lg border px-2 py-1.5 text-left transition ${eventTone(repair)}`}
                            >
                              <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                                <StatusDot repair={repair} />
                                {timeFormatter.format(new Date(repair.expectedPickupAt!))}
                              </span>
                              <span className="mt-0.5 block truncate text-[11px]">
                                {repair.firstName} {repair.lastName}
                              </span>
                            </Link>
                          ))}
                          {dayRepairs.length > 2 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDay(key);
                                setViewMode("list");
                              }}
                              className="rounded-md px-2 py-1 text-left text-[11px] font-semibold text-sky-700 hover:bg-sky-50"
                            >
                              +{dayRepairs.length - 2} autre(s)
                            </button>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <AgendaList
              repairs={visibleMonthRepairs}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
          )}
        </div>

        <aside className="self-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-4">
          <div className="border-b border-slate-800 bg-slate-950 px-5 py-5 text-white">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-400 text-slate-950">
                {editingRepairId ? (
                  <RotateCcw aria-hidden="true" className="size-5" />
                ) : (
                  <CalendarPlus aria-hidden="true" className="size-5" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                  {editingRepairId ? "Modification" : "Nouveau creneau"}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  {editingRepairId ? "Replanifier le rendez-vous" : "Planifier un rendez-vous"}
                </h2>
                <p className="mt-1 text-sm leading-5 text-slate-300">
                  {unscheduledRepairs.length} fiche(s) restent a organiser.
                </p>
              </div>
              {editingRepairId ? (
                <button
                  type="button"
                  onClick={resetPlanning}
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-700 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  aria-label="Annuler la modification"
                  title="Annuler la modification"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              ) : null}
            </div>
          </div>

          <form onSubmit={scheduleRepair} className="grid gap-4 p-5">
            <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-800">
              Fiche
              <select
                value={selectedRepairId}
                onChange={(event) => setSelectedRepairId(event.target.value)}
                disabled={Boolean(editingRepairId)}
                className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-100"
              >
                <option value="">Choisir une fiche...</option>
                {planningOptions.map((repair) => (
                  <option key={repair.id} value={repair.id}>
                    {formatRepairTitle(repair)} - {formatRepairDevice(repair)}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-800">
                Jour
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(event) => handleDateChange(event.target.value)}
                  className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </label>
              <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-800">
                Heure
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(event) => setAppointmentTime(event.target.value)}
                  className="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </label>
            </div>

            {selectedRepair ? (
              <div className="flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-3">
                <ClipboardList aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-sky-700" />
                <div className="min-w-0 text-sm text-slate-700">
                  <p className="truncate font-semibold text-slate-950">
                    {formatRepairDevice(selectedRepair)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {repairStatusLabel(selectedRepair.status)}
                    {selectedRepair.technicianName
                      ? ` - ${selectedRepair.technicianName}`
                      : ""}
                  </p>
                </div>
              </div>
            ) : null}

            {slotConflicts.length > 0 ? (
              <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                Ce creneau contient deja {slotConflicts.length} rendez-vous. Vous
                pouvez continuer ou choisir une autre heure.
              </p>
            ) : null}

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {message}
              </p>
            ) : null}
            {lastScheduledRepair?.expectedPickupAt ? (
              <Link
                href={`/admin/repairs/${lastScheduledRepair.id}`}
                className="grid gap-1 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-950 transition hover:border-cyan-300 hover:bg-cyan-100"
              >
                <span className="font-semibold">Rendez-vous ajoute</span>
                <span>{formatFullDate(lastScheduledRepair.expectedPickupAt)}</span>
                <span className="truncate text-xs">{formatRepairTitle(lastScheduledRepair)}</span>
              </Link>
            ) : null}

            <button
              type="submit"
              disabled={isSaving || planningOptions.length === 0}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
            >
              {editingRepairId ? (
                <RotateCcw aria-hidden="true" className="size-4" />
              ) : (
                <CalendarPlus aria-hidden="true" className="size-4" />
              )}
              {isSaving
                ? "Enregistrement..."
                : editingRepairId
                  ? "Enregistrer le nouveau creneau"
                  : "Placer dans l'agenda"}
            </button>
          </form>

          <div className="grid gap-3 border-t border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                  {selectedDay ? longDayFormatter.format(dateFromInput(selectedDay)) : "Tout le mois"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedDay
                    ? `${selectedDayRepairs.length} rendez-vous ce jour.`
                    : `${visibleMonthRepairs.length} rendez-vous ce mois.`}
                </p>
              </div>
              {selectedDay ? (
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="shrink-0 text-xs font-semibold text-sky-700 hover:text-sky-900"
                >
                  Tout le mois
                </button>
              ) : null}
            </div>

            {(selectedDay ? selectedDayRepairs : visibleMonthRepairs).length > 0 ? (
              <div className="grid max-h-[420px] gap-2 overflow-y-auto pr-1">
                {(selectedDay ? selectedDayRepairs : visibleMonthRepairs).map((repair) => (
                  <AppointmentCard
                    key={`upcoming-${repair.id}`}
                    repair={repair}
                    busy={busyRepairId === repair.id}
                    onReschedule={startReschedule}
                    onRemove={removeFromAgenda}
                  />
                ))}
              </div>
            ) : (
              <div className="grid place-items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center">
                <ClipboardList aria-hidden="true" className="size-6 text-slate-400" />
                <p className="text-sm font-medium text-slate-600">
                  Aucun rendez-vous sur cette periode.
                </p>
                <p className="text-xs text-slate-500">
                  Cliquez sur un jour du calendrier pour le selectionner.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

type MetricTone = "sky" | "emerald" | "violet" | "red";

const metricTones: Record<MetricTone, string> = {
  sky: "bg-sky-50 text-sky-700",
  emerald: "bg-emerald-50 text-emerald-700",
  violet: "bg-violet-50 text-violet-700",
  red: "bg-red-50 text-red-700",
};

function AgendaMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: number;
  tone: MetricTone;
}) {
  return (
    <article className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`grid size-11 shrink-0 place-items-center rounded-lg ${metricTones[tone]}`}>
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold text-slate-950">{value}</p>
      </div>
    </article>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={`size-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function AppointmentCard({
  repair,
  busy,
  onReschedule,
  onRemove,
}: {
  repair: AgendaRepair;
  busy: boolean;
  onReschedule: (repair: AgendaRepair) => void;
  onRemove: (repair: AgendaRepair) => void;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/admin/repairs/${repair.id}`} className="min-w-0 flex-1 group">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-700">
            <StatusDot repair={repair} />
            {formatFullDate(repair.expectedPickupAt!)}
          </span>
          <span className="mt-1 block truncate text-sm font-semibold text-slate-950 group-hover:text-sky-700">
            {formatRepairTitle(repair)}
          </span>
          <span className="mt-1 block truncate text-xs text-slate-600">
            {formatRepairDevice(repair)}
          </span>
        </Link>
        {repair.urgent ? (
          <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold uppercase text-red-700">
            Urgent
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-100 pt-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
          <Wrench aria-hidden="true" className="size-3.5" />
          {repairStatusLabel(repair.status)}
        </span>
        {repair.technicianName ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <UserRound aria-hidden="true" className="size-3.5" />
            {repair.technicianName}
          </span>
        ) : null}
        <span className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => onReschedule(repair)}
            disabled={busy}
            className="rounded-md px-2 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 disabled:opacity-50"
          >
            Replanifier
          </button>
          <button
            type="button"
            onClick={() => onRemove(repair)}
            disabled={busy}
            className="rounded-md px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {busy ? "Retrait..." : "Retirer"}
          </button>
        </span>
      </div>
    </article>
  );
}

function AgendaList({
  repairs,
  selectedDay,
  onSelectDay,
}: {
  repairs: AgendaRepair[];
  selectedDay: string | null;
  onSelectDay: (value: string | null) => void;
}) {
  const grouped = useMemo(() => {
    const result = new Map<string, AgendaRepair[]>();
    for (const repair of repairs) {
      const key = isoDay(new Date(repair.expectedPickupAt!));
      const existing = result.get(key) ?? [];
      existing.push(repair);
      result.set(key, existing);
    }
    return Array.from(result.entries());
  }, [repairs]);

  const visibleGroups = selectedDay
    ? grouped.filter(([key]) => key === selectedDay)
    : grouped;

  if (visibleGroups.length === 0) {
    return (
      <div className="grid min-h-80 place-items-center p-6 text-center">
        <div>
          <ClipboardList aria-hidden="true" className="mx-auto size-9 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700">Aucun rendez-vous a afficher.</p>
          {selectedDay ? (
            <button
              type="button"
              onClick={() => onSelectDay(null)}
              className="mt-3 text-sm font-semibold text-sky-700 hover:text-sky-900"
            >
              Voir tout le mois
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 p-4 sm:p-5">
      {selectedDay ? (
        <button
          type="button"
          onClick={() => onSelectDay(null)}
          className="w-fit text-sm font-semibold text-sky-700 hover:text-sky-900"
        >
          Voir tout le mois
        </button>
      ) : null}
      {visibleGroups.map(([key, dayRepairs]) => (
        <section key={key} className="grid gap-2">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
            <h3 className="text-sm font-semibold capitalize text-slate-950">
              {longDayFormatter.format(dateFromInput(key))}
            </h3>
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">
              {dayRepairs.length}
            </span>
          </div>
          <div className="grid gap-2 lg:grid-cols-2">
            {dayRepairs.map((repair) => (
              <Link
                key={repair.id}
                href={`/admin/repairs/${repair.id}`}
                className={`flex min-w-0 items-start gap-3 rounded-lg border p-3 transition ${eventTone(repair)}`}
              >
                <span className="shrink-0 text-sm font-semibold">
                  {timeFormatter.format(new Date(repair.expectedPickupAt!))}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {repair.firstName} {repair.lastName}
                  </span>
                  <span className="mt-0.5 block truncate text-xs opacity-75">
                    {formatRepairDevice(repair)}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
