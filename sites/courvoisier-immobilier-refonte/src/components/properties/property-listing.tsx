"use client";

import { useMemo, useState } from "react";
import { properties } from "@/lib/data/properties";
import { filterProperties, PROPERTY_CATEGORIES, type PropertyFilters } from "@/lib/search/filter-properties";
import type { PropertyCategory, TransactionType } from "@/lib/data/types";
import { PropertyCard } from "./property-card";

interface PropertyListingProps {
  transaction: TransactionType;
  initialLocality?: string;
  initialCategory?: string;
  initialMaxPrice?: string;
}

export function PropertyListing({
  transaction,
  initialLocality = "",
  initialCategory = "Tous",
  initialMaxPrice = "",
}: PropertyListingProps) {
  const [locality, setLocality] = useState(initialLocality);
  const [category, setCategory] = useState<PropertyCategory | "Tous">(
    (initialCategory as PropertyCategory | "Tous") || "Tous"
  );
  const [minRooms, setMinRooms] = useState("");
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  const results = useMemo(() => {
    const filters: PropertyFilters = {
      transaction,
      locality,
      category,
      minRooms: minRooms ? Number(minRooms) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    };
    return filterProperties(properties, filters);
  }, [transaction, locality, category, minRooms, maxPrice]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-t border-[var(--color-stone-dark)] py-8 sm:grid-cols-4">
        <label className="block">
          <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
            Localité
          </span>
          <input
            type="text"
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            placeholder="Lausanne, Rolle…"
            className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-1.5 font-sans text-sm focus:border-[var(--color-ink)] focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
            Type
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PropertyCategory | "Tous")}
            className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-1.5 font-sans text-sm focus:border-[var(--color-ink)] focus:outline-none"
          >
            {PROPERTY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
            Pièces min.
          </span>
          <select
            value={minRooms}
            onChange={(e) => setMinRooms(e.target.value)}
            className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-1.5 font-sans text-sm focus:border-[var(--color-ink)] focus:outline-none"
          >
            <option value="">Indifférent</option>
            {[1.5, 2.5, 3.5, 4.5, 5.5].map((n) => (
              <option key={n} value={n}>
                dès {n}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
            Budget max.
          </span>
          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-1.5 font-sans text-sm focus:border-[var(--color-ink)] focus:outline-none"
          >
            <option value="">Indifférent</option>
            {(transaction === "vente"
              ? [800000, 1200000, 1800000, 2500000, 4000000]
              : [1800, 2500, 3500, 5000]
            ).map((n) => (
              <option key={n} value={n}>
                jusqu&rsquo;à {new Intl.NumberFormat("fr-CH").format(n)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-baseline justify-between py-8">
        <p className="font-sans text-sm text-[var(--color-graphite)]">
          {results.length} bien{results.length > 1 ? "s" : ""}
        </p>
      </div>

      {results.length === 0 ? (
        <p className="py-16 text-center font-serif text-2xl italic text-[var(--color-graphite)]">
          Aucun bien ne correspond à ces critères pour le moment.
        </p>
      ) : (
        <div className="grid gap-x-10 gap-y-16 sm:grid-cols-2">
          {results.map((property) => (
            <PropertyCard key={property.slug} property={property} variant="compact" />
          ))}
        </div>
      )}
    </div>
  );
}
