"use client";

import { Clock3, Plus, Trash2 } from "lucide-react";
import {
  parseShopOpeningHours,
  SHOP_DAYS,
  stringifyShopOpeningHours,
  type ShopDayKey,
  type ShopOpeningHours,
  type ShopTimePeriod,
} from "@/lib/shopHours";

type OpeningHoursEditorProps = {
  value: string | null | undefined;
  onChange: (value: string) => void;
};

const newPeriod: ShopTimePeriod = {
  opensAt: "13:00",
  closesAt: "18:00",
};

export function OpeningHoursEditor({
  value,
  onChange,
}: OpeningHoursEditorProps) {
  const schedule = parseShopOpeningHours(value);

  function commit(nextSchedule: ShopOpeningHours) {
    onChange(stringifyShopOpeningHours(nextSchedule));
  }

  function setDayOpen(day: ShopDayKey, open: boolean) {
    commit({
      ...schedule,
      [day]: { ...schedule[day], open },
    });
  }

  function updatePeriod(
    day: ShopDayKey,
    index: number,
    patch: Partial<ShopTimePeriod>,
  ) {
    commit({
      ...schedule,
      [day]: {
        ...schedule[day],
        periods: schedule[day].periods.map((period, periodIndex) =>
          periodIndex === index ? { ...period, ...patch } : period,
        ),
      },
    });
  }

  function addPeriod(day: ShopDayKey) {
    if (schedule[day].periods.length >= 6) {
      return;
    }

    commit({
      ...schedule,
      [day]: {
        open: true,
        periods: [...schedule[day].periods, { ...newPeriod }],
      },
    });
  }

  function removePeriod(day: ShopDayKey, index: number) {
    if (schedule[day].periods.length <= 1) {
      return;
    }

    commit({
      ...schedule,
      [day]: {
        ...schedule[day],
        periods: schedule[day].periods.filter(
          (_, periodIndex) => periodIndex !== index,
        ),
      },
    });
  }

  return (
    <div className="grid gap-3">
      {SHOP_DAYS.map((day) => {
        const dayHours = schedule[day.key];

        return (
          <div
            key={day.key}
            className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[150px_1fr] sm:items-start"
          >
            <label className="inline-flex min-h-10 items-center gap-3 text-sm font-semibold text-slate-900">
              <input
                type="checkbox"
                checked={dayHours.open}
                onChange={(event) =>
                  setDayOpen(day.key, event.target.checked)
                }
                className="h-4 w-4 rounded border-slate-300 text-sky-600"
              />
              {day.label}
            </label>

            <div className="grid gap-2">
              {dayHours.periods.map((period, index) => (
                <div
                  key={`${day.key}-${index}`}
                  className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_40px] sm:items-end"
                >
                  <label className="grid gap-1 text-xs font-semibold uppercase text-slate-500">
                    Ouverture
                    <input
                      type="time"
                      value={period.opensAt}
                      disabled={!dayHours.open}
                      onChange={(event) =>
                        updatePeriod(day.key, index, {
                          opensAt: event.target.value,
                        })
                      }
                      className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-950 disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </label>
                  <span className="hidden min-h-10 items-center text-sm text-slate-400 sm:inline-flex">
                    à
                  </span>
                  <label className="grid gap-1 text-xs font-semibold uppercase text-slate-500">
                    Fermeture
                    <input
                      type="time"
                      value={period.closesAt}
                      disabled={!dayHours.open}
                      onChange={(event) =>
                        updatePeriod(day.key, index, {
                          closesAt: event.target.value,
                        })
                      }
                      className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-950 disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removePeriod(day.key, index)}
                    disabled={dayHours.periods.length <= 1}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Supprimer la plage ${index + 1} du ${day.label}`}
                    title="Supprimer cette plage"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addPeriod(day.key)}
                disabled={dayHours.periods.length >= 6}
                className="inline-flex min-h-9 w-fit items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-800 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Ajouter une plage
              </button>

              {dayHours.open && dayHours.periods.length > 1 ? (
                <p className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  Le magasin est fermé entre les plages.
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
