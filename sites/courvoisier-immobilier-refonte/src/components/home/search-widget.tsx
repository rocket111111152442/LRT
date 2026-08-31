"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PROPERTY_CATEGORIES } from "@/lib/search/filter-properties";
import { IconArrowRight } from "@/components/ui/icons";

export function SearchWidget() {
  const router = useRouter();
  const [transaction, setTransaction] = useState<"acheter" | "louer">("acheter");
  const [locality, setLocality] = useState("");
  const [category, setCategory] = useState<string>("Tous");
  const [budget, setBudget] = useState("");

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (locality) params.set("localite", locality);
    if (category !== "Tous") params.set("type", category);
    if (budget) params.set("budget", budget);
    router.push(`/${transaction}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const budgetOptions =
    transaction === "acheter"
      ? [
          { value: "800000", label: "jusqu’à 800'000 CHF" },
          { value: "1200000", label: "jusqu’à 1.2M CHF" },
          { value: "2000000", label: "jusqu’à 2M CHF" },
          { value: "", label: "Sans limite" },
        ]
      : [
          { value: "1800", label: "jusqu’à 1'800 CHF" },
          { value: "2500", label: "jusqu’à 2'500 CHF" },
          { value: "4000", label: "jusqu’à 4'000 CHF" },
          { value: "", label: "Sans limite" },
        ];

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-(--container-page) border-t border-[var(--color-ivory)]/15 bg-[var(--color-ink)]/90 px-6 backdrop-blur-sm md:px-10 lg:px-14"
    >
      <div className="flex items-center gap-8 pt-5 font-sans text-sm">
        {(["acheter", "louer"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTransaction(t)}
            className={`link-underline pb-1 capitalize transition-opacity ${
              transaction === t ? "opacity-100" : "opacity-60"
            }`}
            style={transaction === t ? { backgroundSize: "100% 1px" } : undefined}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-4 py-6 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-end">
        <label className="block">
          <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] opacity-60">Localité</span>
          <input
            type="text"
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            placeholder="Lausanne, Rolle, Lonay…"
            className="w-full border-b border-[var(--color-ivory)]/25 bg-transparent py-2 font-sans text-base placeholder:text-[var(--color-ivory)]/35 focus:border-[var(--color-ivory)] focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] opacity-60">Type de bien</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border-b border-[var(--color-ivory)]/25 bg-transparent py-2 font-sans text-base focus:border-[var(--color-ivory)] focus:outline-none [&>option]:text-[var(--color-ink)]"
          >
            {PROPERTY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] opacity-60">Budget</span>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full border-b border-[var(--color-ivory)]/25 bg-transparent py-2 font-sans text-base focus:border-[var(--color-ivory)] focus:outline-none [&>option]:text-[var(--color-ink)]"
          >
            {budgetOptions.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="group flex items-center justify-center gap-2.5 border border-[var(--color-ivory)] py-3 font-sans text-sm tracking-[0.02em] transition-colors hover:bg-[var(--color-ivory)] hover:text-[var(--color-ink)] sm:col-span-2 lg:col-span-1"
        >
          Rechercher
          <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
}
