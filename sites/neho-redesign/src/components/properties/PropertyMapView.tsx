"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { cantonMapPositions } from "@/lib/data/canton-map-positions";
import { coveredCantons } from "@/config/site";
import { formatCHF } from "@/lib/utils/format";
import type { Property } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";
import type { CantonSlug } from "@/config/site";

/**
 * Vue carte simplifiée : les biens sont regroupés par canton sur la carte
 * stylisée (pas de géocodage réel dans cette démonstration — voir
 * propertyDetail.location dans le dictionnaire i18n pour la même réserve
 * sur la fiche d'un bien).
 */
export function PropertyMapView({ properties, locale, hint }: { properties: Property[]; locale: Locale; hint: string }) {
  const [active, setActive] = useState<CantonSlug | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<CantonSlug, Property[]>();
    for (const p of properties) {
      const list = map.get(p.canton) ?? [];
      list.push(p);
      map.set(p.canton, list);
    }
    return map;
  }, [properties]);

  const activeProperties = active ? (grouped.get(active) ?? []) : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-night-900">
        <svg viewBox="0 0 320 300" className="h-full w-full">
          {coveredCantons.map((canton) => {
            const pos = cantonMapPositions[canton.slug];
            const count = grouped.get(canton.slug)?.length ?? 0;
            if (count === 0) return null;
            return (
              <g
                key={canton.slug}
                transform={`translate(${pos.x} ${pos.y})`}
                className="cursor-pointer"
                onClick={() => setActive(canton.slug)}
                role="button"
                tabIndex={0}
                aria-label={`${canton.name} — ${count}`}
                onKeyDown={(e) => e.key === "Enter" && setActive(canton.slug)}
              >
                <circle r={12 + count * 2} fill="var(--color-ivy-500)" opacity="0.35" />
                <circle r={11} fill="var(--color-bronze-500)" stroke="var(--color-cream-50)" strokeWidth="2" />
                <text textAnchor="middle" dy="4" fontSize="11" fontWeight="700" fill="var(--color-night-950)">
                  {count}
                </text>
                <text y="26" textAnchor="middle" fontSize="10" fill="var(--color-cream-50)">
                  {canton.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-cream-50 p-5">
        {active ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg text-ink-900">{coveredCantons.find((c) => c.slug === active)?.name}</h3>
              <button type="button" onClick={() => setActive(null)} className="rounded-full p-1 text-ink-500 hover:bg-stone-200" aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <ul className="space-y-3">
              {activeProperties.map((p) => (
                <li key={p.slug}>
                  <Link href={`/${locale}/biens/${p.slug}`} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 p-3 hover:border-ivy-400">
                    <span className="text-sm font-medium text-ink-900">{p.title}</span>
                    <span className="shrink-0 font-display text-sm text-ink-900">{formatCHF(p.price, locale)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-ink-500">{hint}</p>
        )}
      </div>
    </div>
  );
}
