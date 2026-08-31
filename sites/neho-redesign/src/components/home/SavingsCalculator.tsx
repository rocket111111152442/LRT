"use client";

import { useId, useMemo, useState } from "react";
import { AnimatedNumber } from "@/components/animation/AnimatedNumber";
import { pricingTiers } from "@/config/site-numbers";
import { computeTraditionalFee, computeSavings } from "@/lib/calculators/savings";
import { formatCHF } from "@/lib/utils/format";
import { cn } from "@/lib/utils/format";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

export function SavingsCalculator({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.calculator;
  const priceInputId = useId();
  const commissionInputId = useId();

  const [price, setPrice] = useState(1_200_000);
  const [commissionPercent, setCommissionPercent] = useState(3);
  const [tierId, setTierId] = useState<(typeof pricingTiers)[number]["id"]>("serenity");

  const tier = pricingTiers.find((tr) => tr.id === tierId) ?? pricingTiers[1];
  const nehoFee = useMemo(() => Number(tier.price.replace(/[^0-9]/g, "")), [tier]);
  const traditionalFee = useMemo(() => computeTraditionalFee(price, commissionPercent), [price, commissionPercent]);
  const savings = computeSavings(traditionalFee, nehoFee);
  const maxBar = Math.max(traditionalFee, nehoFee, 1);

  const fmt = (n: number) => formatCHF(n, locale);

  return (
    <div className="grid gap-10 rounded-[2rem] border border-stone-200 bg-cream-100 p-6 sm:p-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
      <div>
        <div className="mb-8">
          <label htmlFor={priceInputId} className="mb-2 flex items-center justify-between text-sm font-medium text-ink-900">
            {t.priceLabel}
            <span className="font-display text-lg">{fmt(price)}</span>
          </label>
          <input
            id={priceInputId}
            type="range"
            min={300000}
            max={6000000}
            step={50000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full accent-ivy-600"
          />
        </div>

        <div className="mb-8">
          <label htmlFor={commissionInputId} className="mb-2 flex items-center justify-between text-sm font-medium text-ink-900">
            {t.commissionLabel}
            <span className="font-display text-lg">{commissionPercent.toFixed(1)}%</span>
          </label>
          <input
            id={commissionInputId}
            type="range"
            min={1}
            max={5}
            step={0.1}
            value={commissionPercent}
            onChange={(e) => setCommissionPercent(Number(e.target.value))}
            className="w-full accent-ivy-600"
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink-900">{t.formulaLabel}</legend>
          <div className="flex flex-wrap gap-2">
            {pricingTiers.map((tr) => (
              <button
                key={tr.id}
                type="button"
                onClick={() => setTierId(tr.id)}
                aria-pressed={tr.id === tierId}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  tr.id === tierId ? "border-ivy-600 bg-ivy-600 text-cream-50" : "border-stone-300 text-ink-700 hover:border-ivy-500",
                )}
              >
                {tr.name}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div>
        <div className="space-y-5">
          <BarRow label={t.traditionalLabel} value={traditionalFee} max={maxBar} tone="stone" formatted={fmt} />
          <BarRow label={t.nehoLabel} value={nehoFee} max={maxBar} tone="ivy" formatted={fmt} />
        </div>

        <div className="mt-8 rounded-2xl bg-ink-900 p-6 text-cream-50">
          <p className="text-xs uppercase tracking-wide text-cream-50/60">{t.savingsLabel}</p>
          <p className="mt-1 font-display text-4xl">
            <AnimatedNumber value={savings} formatter={fmt} />
          </p>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-500">{t.disclaimer}</p>
      </div>
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  tone,
  formatted,
}: {
  label: string;
  value: number;
  max: number;
  tone: "stone" | "ivy";
  formatted: (n: number) => string;
}) {
  const width = Math.max((value / max) * 100, 4);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-ink-900">{label}</span>
        <span className="font-display text-ink-900">
          <AnimatedNumber value={value} formatter={formatted} />
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500 ease-out", tone === "ivy" ? "bg-ivy-600" : "bg-stone-400")}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
