"use client";

import { useId, useMemo, useState } from "react";
import { AnimatedNumber } from "@/components/animation/AnimatedNumber";
import { Button } from "@/components/ui/Button";
import { computeBuyingCapacity } from "@/lib/calculators/capacity";
import { formatCHF } from "@/lib/utils/format";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

export function BuyCapacityCalculator({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.buy.capacity;
  const incomeId = useId();
  const downPaymentId = useId();
  const rateId = useId();

  const [income, setIncome] = useState(150000);
  const [downPayment, setDownPayment] = useState(150000);
  const [rate, setRate] = useState(5);

  const result = useMemo(() => computeBuyingCapacity(income, downPayment, rate), [income, downPayment, rate]);
  const fmt = (n: number) => formatCHF(n, locale);

  return (
    <div id="capacite" className="grid gap-10 rounded-[2rem] border border-stone-200 bg-cream-100/60 p-6 sm:p-10 lg:grid-cols-[1fr_0.9fr] lg:gap-14">
      <div className="space-y-6">
        <Field
          id={incomeId}
          label={t.incomeLabel}
          value={income}
          onChange={setIncome}
          min={40000}
          max={600000}
          step={5000}
          format={fmt}
        />
        <Field
          id={downPaymentId}
          label={t.downPaymentLabel}
          value={downPayment}
          onChange={setDownPayment}
          min={0}
          max={2000000}
          step={10000}
          format={fmt}
        />
        <div>
          <label htmlFor={rateId} className="mb-2 flex items-center justify-between text-sm font-medium text-ink-900">
            {t.ratesLabel}
            <span className="font-display text-lg">{rate.toFixed(1)}%</span>
          </label>
          <input
            id={rateId}
            type="range"
            min={3}
            max={7}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-ivy-600"
          />
        </div>
      </div>

      <div className="flex flex-col justify-between">
        <div className="rounded-2xl bg-ink-900 p-6 text-cream-50">
          <p className="text-xs uppercase tracking-wide text-cream-50/60">{t.resultLabel}</p>
          <p className="mt-1 font-display text-4xl">
            <AnimatedNumber value={result} formatter={fmt} />
          </p>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ink-500">{t.disclaimer}</p>
        <Button href={`/${locale}/contact`} className="mt-6">
          {t.cta}
        </Button>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-center justify-between text-sm font-medium text-ink-900">
        {label}
        <span className="font-display text-lg">{format(value)}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-ivy-600"
      />
    </div>
  );
}
