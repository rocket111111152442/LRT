import { Check, Minus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { pricingTiers, pricingFeatureMatrix } from "@/config/site-numbers";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

const categoryOrder = ["Accompagnement", "Mise en valeur", "Diffusion", "Négociation"] as const;

export function PricingTable({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.pricing.table;

  return (
    <div>
      {/* Vue desktop : tableau complet */}
      <div className="hidden overflow-x-auto rounded-2xl border border-stone-200 lg:block">
        <table className="w-full min-w-[860px] border-collapse bg-cream-50 text-sm">
          <thead>
            <tr className="border-b border-stone-200">
              <th scope="col" className="w-1/3 p-5 text-left font-medium text-ink-500">
                {t.featureColumn}
              </th>
              {pricingTiers.map((tier) => (
                <th key={tier.id} scope="col" className="p-5 text-left align-top">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl text-ink-900">{tier.name}</span>
                    {tier.recommended ? <Badge tone="bronze">{t.recommended}</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs text-ink-500">{tier.tagline}</p>
                  <p className="mt-3 font-display text-2xl text-ink-900">
                    {dict.common.from} {tier.price}
                  </p>
                  <p className="text-[0.7rem] text-ink-500">{t.priceCaveat}</p>
                  <Button href={`/${locale}/estimation`} size="sm" variant={tier.recommended ? "primary" : "outline"} className="mt-4">
                    {t.ctaChoose}
                  </Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categoryOrder.map((category) => (
              <CategoryRows key={category} category={category} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Vue mobile / tablette : une carte par formule */}
      <div className="grid gap-6 lg:hidden">
        {pricingTiers.map((tier) => (
          <div key={tier.id} className="rounded-2xl border border-stone-200 bg-cream-50 p-6">
            <div className="flex items-center justify-between">
              <span className="font-display text-xl text-ink-900">{tier.name}</span>
              {tier.recommended ? <Badge tone="bronze">{t.recommended}</Badge> : null}
            </div>
            <p className="mt-1 text-sm text-ink-500">{tier.tagline}</p>
            <p className="mt-3 font-display text-2xl text-ink-900">
              {dict.common.from} {tier.price}
            </p>
            <p className="text-xs text-ink-500">{t.priceCaveat}</p>
            <ul className="mt-5 space-y-2 border-t border-stone-200 pt-5">
              {pricingFeatureMatrix.map((row) => (
                <li key={row.feature} className="flex items-start gap-2 text-sm">
                  {row[tier.id] ? (
                    <Check size={16} className="mt-0.5 shrink-0 text-ivy-600" aria-hidden="true" />
                  ) : (
                    <Minus size={16} className="mt-0.5 shrink-0 text-stone-400" aria-hidden="true" />
                  )}
                  <span className={row[tier.id] ? "text-ink-900" : "text-ink-500 line-through decoration-stone-300"}>{row.feature}</span>
                </li>
              ))}
            </ul>
            <Button href={`/${locale}/estimation`} variant={tier.recommended ? "primary" : "outline"} className="mt-6 w-full">
              {t.ctaChoose}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryRows({ category }: { category: string }) {
  const rows = pricingFeatureMatrix.filter((r) => r.category === category);
  return (
    <>
      <tr>
        <th colSpan={4} scope="colgroup" className="bg-cream-100/70 px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-ivy-700">
          {category}
        </th>
      </tr>
      {rows.map((row) => (
        <tr key={row.feature} className="border-b border-stone-200 last:border-0">
          <td className="p-5 text-ink-700">{row.feature}</td>
          {pricingTiers.map((tier) => (
            <td key={tier.id} className="p-5">
              {row[tier.id] ? (
                <Check size={18} className="text-ivy-600" aria-label="Inclus" />
              ) : (
                <Minus size={18} className="text-stone-300" aria-label="Non inclus" />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
