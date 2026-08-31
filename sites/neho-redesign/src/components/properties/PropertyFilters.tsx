"use client";

import { useId } from "react";
import type { PropertyFilters as Filters } from "@/lib/search/filter-properties";
import type { PropertyType } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionary-type";

const propertyTypes: PropertyType[] = ["appartement", "maison", "villa", "immeuble", "terrain"];

export function PropertyFilters({
  filters,
  onChange,
  onReset,
  dict,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
  dict: Dictionary;
}) {
  const t = dict.properties.filters;
  const locationId = useId();
  const typeId = useId();
  const priceMinId = useId();
  const priceMaxId = useId();
  const roomsId = useId();
  const surfaceId = useId();

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-cream-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-900">{t.title}</h2>
        <button type="button" onClick={onReset} className="text-xs font-medium text-ivy-600 hover:underline">
          {t.reset}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor={locationId} className="input-label">
            {t.location}
          </label>
          <input
            id={locationId}
            type="text"
            value={filters.location ?? ""}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Ex. Lausanne, Vaud…"
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor={typeId} className="input-label">
            {t.type}
          </label>
          <select id={typeId} value={filters.type ?? ""} onChange={(e) => set("type", e.target.value as PropertyType | "")} className="input-field">
            <option value="">—</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={priceMinId} className="input-label">
              {t.priceMin}
            </label>
            <input
              id={priceMinId}
              type="number"
              min={0}
              value={filters.priceMin ?? ""}
              onChange={(e) => set("priceMin", e.target.value ? Number(e.target.value) : undefined)}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor={priceMaxId} className="input-label">
              {t.priceMax}
            </label>
            <input
              id={priceMaxId}
              type="number"
              min={0}
              value={filters.priceMax ?? ""}
              onChange={(e) => set("priceMax", e.target.value ? Number(e.target.value) : undefined)}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label htmlFor={roomsId} className="input-label">
            {t.rooms}
          </label>
          <input
            id={roomsId}
            type="number"
            min={0}
            step={0.5}
            value={filters.roomsMin ?? ""}
            onChange={(e) => set("roomsMin", e.target.value ? Number(e.target.value) : undefined)}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor={surfaceId} className="input-label">
            {t.surfaceMin}
          </label>
          <input
            id={surfaceId}
            type="number"
            min={0}
            value={filters.surfaceMin ?? ""}
            onChange={(e) => set("surfaceMin", e.target.value ? Number(e.target.value) : undefined)}
            className="input-field"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" checked={!!filters.landOnly} onChange={(e) => set("landOnly", e.target.checked)} className="h-4 w-4 accent-ivy-600" />
          {t.land}
        </label>

        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={filters.availability === "disponible"}
            onChange={(e) => set("availability", e.target.checked ? "disponible" : "")}
            className="h-4 w-4 accent-ivy-600"
          />
          {t.availability}
        </label>
      </div>
    </div>
  );
}
