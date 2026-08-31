"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { TextField, TextAreaField, SelectRow } from "./FormField";
import { cn } from "@/lib/utils/cn";

type PropertyType = "maison" | "appartement" | "terrain" | "immeuble";
type Condition = "neuf" | "bon" | "a-rafraichir" | "a-renover";

type FormState = {
  propertyType: PropertyType | null;
  canton: "VD" | "FR" | null;
  city: string;
  address: string;
  rooms: string;
  surface: string;
  landSurface: string;
  constructionYear: string;
  condition: Condition | null;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
};

const initialState: FormState = {
  propertyType: null,
  canton: null,
  city: "",
  address: "",
  rooms: "",
  surface: "",
  landSurface: "",
  constructionYear: "",
  condition: null,
  fullName: "",
  email: "",
  phone: "",
  message: "",
  consent: false,
};

const stepLabels = ["Type de bien", "Localisation", "Caractéristiques", "Coordonnées"];

const propertyTypeOptions: { value: PropertyType; label: string; description?: string }[] = [
  { value: "maison", label: "Maison ou villa" },
  { value: "appartement", label: "Appartement" },
  { value: "terrain", label: "Terrain" },
  { value: "immeuble", label: "Immeuble de rendement" },
];

const conditionOptions: { value: Condition; label: string }[] = [
  { value: "neuf", label: "Neuf ou récent" },
  { value: "bon", label: "Bon état" },
  { value: "a-rafraichir", label: "À rafraîchir" },
  { value: "a-renover", label: "À rénover" },
];

function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function EstimationForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const rootRef = useRef<HTMLDivElement>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateStep(current: number): boolean {
    const nextErrors: Record<string, string> = {};

    if (current === 0 && !form.propertyType) {
      nextErrors.propertyType = "Sélectionnez un type de bien.";
    }
    if (current === 1) {
      if (!form.canton) nextErrors.canton = "Sélectionnez un canton.";
      if (!form.city.trim()) nextErrors.city = "Indiquez la localité du bien.";
    }
    if (current === 2 && form.propertyType !== "terrain" && !form.condition) {
      nextErrors.condition = "Sélectionnez l'état du bien.";
    }
    if (current === 3) {
      if (!form.fullName.trim()) nextErrors.fullName = "Indiquez votre nom.";
      if (!isEmailValid(form.email)) nextErrors.email = "Indiquez une adresse e-mail valide.";
      if (!form.consent) nextErrors.consent = "L'accord est nécessaire pour vous recontacter.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    if (step === stepLabels.length - 1) {
      setSubmitted(true);
      return;
    }
    setStep((s) => s + 1);
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  }

  useEffect(() => {
    if (submitted) rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [submitted]);

  if (submitted) {
    return (
      <div ref={rootRef} className="border border-stone p-10 text-center sm:p-16">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pine text-paper">
          <Check size={20} strokeWidth={1.75} />
        </span>
        <h2 className="mt-6 font-serif text-2xl text-ink">Votre demande a bien été transmise</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          Un expert de notre équipe {form.canton === "FR" ? "de Fribourg" : "de Lausanne"} revient vers vous sous
          peu avec une première analyse de votre bien à {form.city || "votre localité"}. Ceci est une
          démonstration : aucune donnée n&rsquo;est transmise ni conservée.
        </p>
      </div>
    );
  }

  return (
    <div ref={rootRef}>
      <ol className="flex items-center" aria-label="Progression de l'estimation">
        {stepLabels.map((label, i) => (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-feature-numeric transition-colors",
                i < step && "border-clay bg-clay text-paper",
                i === step && "border-clay text-clay",
                i > step && "border-stone-dark text-ink-faint",
              )}
              aria-current={i === step ? "step" : undefined}
              title={label}
            >
              {i < step ? <Check size={13} strokeWidth={2} /> : i + 1}
            </span>
            {i < stepLabels.length - 1 ? (
              <span className={cn("mx-2 h-px flex-1 sm:mx-4", i < step ? "bg-clay" : "bg-stone")} />
            ) : null}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs uppercase tracking-[0.12em] text-ink-faint">
        Étape {step + 1} / {stepLabels.length} — <span className="text-ink">{stepLabels[step]}</span>
      </p>

      <div className="mt-12 min-h-[22rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 ? (
              <SelectRow
                legend="Quel type de bien souhaitez-vous estimer ?"
                options={propertyTypeOptions}
                value={form.propertyType}
                onChange={(v) => update("propertyType", v)}
              />
            ) : null}

            {step === 1 ? (
              <div className="space-y-8">
                <SelectRow
                  legend="Canton"
                  options={[
                    { value: "VD", label: "Vaud" },
                    { value: "FR", label: "Fribourg" },
                  ]}
                  value={form.canton}
                  onChange={(v) => update("canton", v)}
                />
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <TextField
                    id="city"
                    label="Localité"
                    placeholder="Ex. Lausanne"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    error={errors.city}
                  />
                  <TextField
                    id="address"
                    label="Adresse (facultatif)"
                    placeholder="Rue et numéro"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                  {form.propertyType !== "terrain" ? (
                    <TextField
                      id="rooms"
                      label="Nombre de pièces"
                      inputMode="decimal"
                      placeholder="Ex. 4.5"
                      value={form.rooms}
                      onChange={(e) => update("rooms", e.target.value)}
                    />
                  ) : null}
                  {form.propertyType !== "terrain" ? (
                    <TextField
                      id="surface"
                      label="Surface habitable (m²)"
                      inputMode="numeric"
                      value={form.surface}
                      onChange={(e) => update("surface", e.target.value)}
                    />
                  ) : null}
                  <TextField
                    id="landSurface"
                    label={form.propertyType === "terrain" ? "Surface du terrain (m²)" : "Surface de terrain (m²)"}
                    inputMode="numeric"
                    value={form.landSurface}
                    onChange={(e) => update("landSurface", e.target.value)}
                  />
                  <TextField
                    id="constructionYear"
                    label="Année de construction"
                    inputMode="numeric"
                    placeholder="Ex. 1998"
                    value={form.constructionYear}
                    onChange={(e) => update("constructionYear", e.target.value)}
                  />
                </div>
                {form.propertyType !== "terrain" ? (
                  <SelectRow legend="État général" options={conditionOptions} value={form.condition} onChange={(v) => update("condition", v)} />
                ) : null}
                {errors.condition ? <p className="text-xs text-alert">{errors.condition}</p> : null}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <TextField id="fullName" label="Nom complet" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} error={errors.fullName} />
                  <TextField id="email" type="email" label="E-mail" value={form.email} onChange={(e) => update("email", e.target.value)} error={errors.email} />
                  <TextField id="phone" type="tel" label="Téléphone (facultatif)" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                </div>
                <TextAreaField id="message" label="Message (facultatif)" value={form.message} onChange={(e) => update("message", e.target.value)} />
                <label className="flex items-start gap-3 text-xs leading-relaxed text-ink-soft">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => update("consent", e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-clay"
                    aria-invalid={!!errors.consent}
                  />
                  J&rsquo;accepte d&rsquo;être recontacté·e par votrecourtier.ch SA au sujet de ma demande, conformément
                  à la nLPD.
                </label>
                {errors.consent ? <p className="text-xs text-alert">{errors.consent}</p> : null}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-stone pt-8">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="text-sm text-ink-soft transition-colors hover:text-ink disabled:opacity-0"
        >
          ← Précédent
        </button>
        <button
          type="button"
          onClick={goNext}
          className="bg-pine px-7 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-pine-dim"
        >
          {step === stepLabels.length - 1 ? "Envoyer ma demande" : "Continuer"}
        </button>
      </div>
    </div>
  );
}
