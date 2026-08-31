"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/format";
import { estimationStepSchemas } from "@/lib/validations/estimation";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

type FormState = {
  address: string;
  propertyType: "appartement" | "maison" | "villa" | "immeuble" | "terrain" | "";
  surface: string;
  rooms: string;
  yearBuilt: string;
  condition: "neuf" | "bon" | "a-rafraichir" | "travaux" | "";
  landSurface: string;
  parkingSpaces: string;
  fullName: string;
  email: string;
  phone: string;
  appointmentPreference: "matin" | "apres-midi" | "soir" | "email" | "";
};

const initialState: FormState = {
  address: "",
  propertyType: "",
  surface: "",
  rooms: "",
  yearBuilt: "",
  condition: "",
  landSurface: "",
  parkingSpaces: "0",
  fullName: "",
  email: "",
  phone: "",
  appointmentPreference: "",
};

const propertyTypeValues = ["appartement", "maison", "villa", "immeuble", "terrain"] as const;
const conditionValues = ["neuf", "bon", "a-rafraichir", "travaux"] as const;
const appointmentValues = ["matin", "apres-midi", "soir", "email"] as const;

export function EstimationWizard({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.estimation;
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const renderedAt = useRef(0);
  const topRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  const totalSteps = t.stepLabels.length;

  const stepPayloads: Record<number, Record<string, unknown>> = useMemo(
    () => ({
      0: { address: data.address },
      1: { propertyType: data.propertyType || undefined },
      2: { surface: data.surface },
      3: { rooms: data.rooms },
      4: { yearBuilt: data.yearBuilt },
      5: { condition: data.condition || undefined },
      6: { landSurface: data.landSurface || undefined, parkingSpaces: data.parkingSpaces },
      7: { fullName: data.fullName, email: data.email, phone: data.phone },
      8: { appointmentPreference: data.appointmentPreference || undefined },
    }),
    [data],
  );

  function validateStep(index: number): boolean {
    const schema = estimationStepSchemas[index];
    if (!schema) return true;
    const result = schema.safeParse(stepPayloads[index]);
    if (!result.success) {
      setErrors(result.error.issues.map((i) => i.message));
      return false;
    }
    setErrors([]);
    return true;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, totalSteps - 1));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goBack() {
    setErrors([]);
    setStep((s) => Math.max(s - 1, 0));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit() {
    if (!validateStep(step)) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/estimation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          website: "",
          renderedAt: renderedAt.current,
        }),
      });
      if (!res.ok) throw new Error("request-failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div ref={topRef} className="rounded-3xl border border-ivy-200 bg-ivy-100/50 p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto text-ivy-600" size={44} aria-hidden="true" />
        <h2 className="mt-4 font-display text-2xl text-ink-900">{t.successTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-700">{t.successDescription}</p>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-ink-500">{t.successNote}</p>
        <Button href={`/${locale}`} variant="outline" className="mt-6">
          {t.backToHome}
        </Button>
      </div>
    );
  }

  return (
    <div ref={topRef}>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={step + 1}
        aria-label={`${t.stepLabels[step]} (${step + 1}/${totalSteps})`}
        className="mb-8"
      >
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-ink-500">
          <span>
            {t.stepLabels[step]} ({step + 1}/{totalSteps})
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full rounded-full bg-ivy-600 transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-cream-50 p-6 sm:p-10">
        <StepContent step={step} data={data} setData={setData} t={t} />

        {errors.length > 0 ? (
          <div role="alert" className="mt-6 rounded-xl bg-error-600/10 p-4 text-sm text-error-600">
            {t.validationError}
            <ul className="mt-1 list-disc pl-5">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {status === "error" ? (
          <p role="alert" className="mt-6 text-sm text-error-600">
            {dict.common.errorGeneric}
          </p>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-4">
          <Button type="button" variant="ghost" onClick={goBack} disabled={step === 0}>
            <ChevronLeft size={16} aria-hidden="true" /> {dict.common.previous}
          </Button>
          {step < totalSteps - 1 ? (
            <Button type="button" onClick={goNext}>
              {dict.common.next} <ChevronRight size={16} aria-hidden="true" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={status === "submitting"}>
              {status === "submitting" ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" /> {t.submitting}
                </>
              ) : (
                t.submit
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepContent({
  step,
  data,
  setData,
  t,
}: {
  step: number;
  data: FormState;
  setData: React.Dispatch<React.SetStateAction<FormState>>;
  t: Dictionary["estimation"];
}) {
  const s = t.steps;
  const surfaceId = useId();
  const roomsId = useId();
  const yearId = useId();
  const landId = useId();
  const parkingId = useId();
  const contactNameId = useId();
  const contactEmailId = useId();
  const contactPhoneId = useId();

  switch (step) {
    case 0:
      return (
        <Field title={s.address.title} description={s.address.description}>
          <input
            autoFocus
            type="text"
            value={data.address}
            onChange={(e) => setData((d) => ({ ...d, address: e.target.value }))}
            placeholder={s.address.placeholder}
            className="input-field"
          />
        </Field>
      );
    case 1:
      return (
        <Field title={s.type.title} description={s.type.description}>
          <OptionGrid
            options={propertyTypeValues.map((v, i) => ({ value: v, label: s.type.options[i] ?? v }))}
            value={data.propertyType}
            onChange={(v) => setData((d) => ({ ...d, propertyType: v as FormState["propertyType"] }))}
          />
        </Field>
      );
    case 2:
      return (
        <Field title={s.surface.title} description={s.surface.description}>
          <label htmlFor={surfaceId} className="input-label">
            {s.surface.label}
          </label>
          <input
            id={surfaceId}
            autoFocus
            type="number"
            min={10}
            max={2000}
            value={data.surface}
            onChange={(e) => setData((d) => ({ ...d, surface: e.target.value }))}
            className="input-field"
          />
        </Field>
      );
    case 3:
      return (
        <Field title={s.rooms.title} description={s.rooms.description}>
          <label htmlFor={roomsId} className="input-label">
            {s.rooms.label}
          </label>
          <input
            id={roomsId}
            autoFocus
            type="number"
            min={1}
            max={30}
            step={0.5}
            value={data.rooms}
            onChange={(e) => setData((d) => ({ ...d, rooms: e.target.value }))}
            className="input-field"
          />
        </Field>
      );
    case 4:
      return (
        <Field title={s.year.title} description={s.year.description}>
          <label htmlFor={yearId} className="input-label">
            {s.year.label}
          </label>
          <input
            id={yearId}
            autoFocus
            type="number"
            min={1800}
            max={2028}
            value={data.yearBuilt}
            onChange={(e) => setData((d) => ({ ...d, yearBuilt: e.target.value }))}
            className="input-field"
          />
        </Field>
      );
    case 5:
      return (
        <Field title={s.condition.title} description={s.condition.description}>
          <OptionGrid
            options={conditionValues.map((v, i) => ({ value: v, label: s.condition.options[i] ?? v }))}
            value={data.condition}
            onChange={(v) => setData((d) => ({ ...d, condition: v as FormState["condition"] }))}
          />
        </Field>
      );
    case 6:
      return (
        <Field title={s.land.title} description={s.land.description}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={landId} className="input-label">
                {s.land.landLabel}
              </label>
              <input
                id={landId}
                autoFocus
                type="number"
                min={0}
                value={data.landSurface}
                onChange={(e) => setData((d) => ({ ...d, landSurface: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor={parkingId} className="input-label">
                {s.land.parkingLabel}
              </label>
              <input
                id={parkingId}
                type="number"
                min={0}
                max={20}
                value={data.parkingSpaces}
                onChange={(e) => setData((d) => ({ ...d, parkingSpaces: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>
        </Field>
      );
    case 7:
      return (
        <Field title={s.contact.title} description={s.contact.description}>
          <div className="grid gap-5">
            <div>
              <label htmlFor={contactNameId} className="input-label">
                {s.contact.nameLabel}
              </label>
              <input
                id={contactNameId}
                autoFocus
                type="text"
                autoComplete="name"
                value={data.fullName}
                onChange={(e) => setData((d) => ({ ...d, fullName: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor={contactEmailId} className="input-label">
                  {s.contact.emailLabel}
                </label>
                <input
                  id={contactEmailId}
                  type="email"
                  autoComplete="email"
                  value={data.email}
                  onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor={contactPhoneId} className="input-label">
                  {s.contact.phoneLabel}
                </label>
                <input
                  id={contactPhoneId}
                  type="tel"
                  autoComplete="tel"
                  value={data.phone}
                  onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </Field>
      );
    case 8:
      return (
        <Field title={s.appointment.title} description={s.appointment.description}>
          <OptionGrid
            options={appointmentValues.map((v, i) => ({ value: v, label: s.appointment.options[i] ?? v }))}
            value={data.appointmentPreference}
            onChange={(v) => setData((d) => ({ ...d, appointmentPreference: v as FormState["appointmentPreference"] }))}
          />
        </Field>
      );
    default:
      return null;
  }
}

function Field({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl text-ink-900 sm:text-2xl">{title}</h2>
      <p className="mt-1.5 text-sm text-ink-500">{description}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function OptionGrid({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
            value === option.value ? "border-ivy-600 bg-ivy-100/70 text-ivy-700" : "border-stone-300 text-ink-700 hover:border-ivy-400",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
