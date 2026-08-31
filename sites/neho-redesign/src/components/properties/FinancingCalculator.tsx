"use client";

import { useId, useMemo, useState } from "react";
import { AnimatedNumber } from "@/components/animation/AnimatedNumber";
import { formatCHF } from "@/lib/utils/format";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

export function FinancingCalculator({ price, locale, dict }: { price: number; locale: Locale; dict: Dictionary }) {
  const t = dict.propertyDetail.financing;
  const downId = useId();
  const rateId = useId();
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [rate, setRate] = useState(2);

  const monthly = useMemo(() => {
    const loan = price * (1 - downPaymentPercent / 100);
    // Mensualité indicative : intérêts + amortissement (1%) + charges d'entretien (0.7%), répartis sur 12 mois.
    const annualCost = loan * (rate / 100 + 0.01 + 0.007);
    return annualCost / 12;
  }, [price, downPaymentPercent, rate]);

  const fmt = (n: number) => formatCHF(n, locale);

  return (
    <div className="rounded-2xl border border-stone-200 bg-cream-100/50 p-6">
      <h3 className="font-display text-lg text-ink-900">{t.title}</h3>
      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor={downId} className="mb-1.5 flex items-center justify-between text-sm font-medium text-ink-900">
            {t.downPaymentLabel}
            <span>{downPaymentPercent}%</span>
          </label>
          <input id={downId} type="range" min={20} max={60} step={5} value={downPaymentPercent} onChange={(e) => setDownPaymentPercent(Number(e.target.value))} className="w-full accent-ivy-600" />
        </div>
        <div>
          <label htmlFor={rateId} className="mb-1.5 flex items-center justify-between text-sm font-medium text-ink-900">
            {t.rateLabel}
            <span>{rate.toFixed(1)}%</span>
          </label>
          <input id={rateId} type="range" min={0.5} max={5} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-ivy-600" />
        </div>
      </div>
      <div className="mt-5 rounded-xl bg-ink-900 p-4 text-cream-50">
        <p className="text-xs uppercase tracking-wide text-cream-50/60">{t.monthlyLabel}</p>
        <p className="font-display text-2xl">
          <AnimatedNumber value={monthly} formatter={fmt} /> <span className="text-sm font-sans text-cream-50/60">{t.perMonth}</span>
        </p>
      </div>
    </div>
  );
}
