"use client";

import { useEffect, useRef, useState } from "react";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";

type PropertyType = "maison" | "appartement" | "immeuble" | "terrain" | "autre";
type Method = "en-vrai" | "en-visio" | "en-ligne";
type Timing = "moins-3-mois" | "3-6-mois" | "6-12-mois" | "sans-projet-precis";

interface FormState {
  propertyType: PropertyType | "";
  method: Method | "";
  locality: string;
  rooms: string;
  surface: string;
  projectTiming: Timing | "";
  name: string;
  email: string;
  phone: string;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "maison", label: "Maison" },
  { value: "appartement", label: "Appartement" },
  { value: "immeuble", label: "Immeuble" },
  { value: "terrain", label: "Terrain" },
  { value: "autre", label: "Autre" },
];

const METHODS: { value: Method; label: string; description: string }[] = [
  { value: "en-vrai", label: "En vrai", description: "Un courtier se déplace chez vous." },
  { value: "en-visio", label: "En visio", description: "Estimation en visioconférence, rapide." },
  { value: "en-ligne", label: "En ligne", description: "Une première fourchette, en quelques clics." },
];

const TIMINGS: { value: Timing; label: string }[] = [
  { value: "moins-3-mois", label: "Moins de 3 mois" },
  { value: "3-6-mois", label: "3 à 6 mois" },
  { value: "6-12-mois", label: "6 à 12 mois" },
  { value: "sans-projet-precis", label: "Sans projet précis" },
];

const STEP_LABELS = ["Votre bien", "Localisation", "Caractéristiques", "Votre projet", "Coordonnées"];

const initialState: FormState = {
  propertyType: "",
  method: "",
  locality: "",
  rooms: "",
  surface: "",
  projectTiming: "",
  name: "",
  email: "",
  phone: "",
};

type Status = "idle" | "loading" | "success" | "error";

export function EstimationWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(initialState);
  const [status, setStatus] = useState<Status>("idle");
  const renderedAt = useRef(0);
  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  const canAdvance =
    (step === 0 && data.propertyType !== "" && data.method !== "") ||
    (step === 1 && data.locality.trim().length > 1) ||
    step === 2 ||
    (step === 3 && data.projectTiming !== "") ||
    false;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/estimation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, website: "", renderedAt: renderedAt.current }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex max-w-lg items-start gap-4 border border-[var(--color-stone-dark)] p-8">
        <IconCheck className="mt-1 h-6 w-6 shrink-0 text-[var(--color-green)]" />
        <div>
          <p className="font-serif text-2xl italic">Demande envoyée.</p>
          <p className="mt-2 font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
            Merci {data.name || ""}. Un membre de notre équipe vous recontacte
            rapidement pour organiser votre estimation {data.method === "en-vrai" ? "en vrai" : data.method === "en-visio" ? "en visio" : "en ligne"}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-10">
        <div className="flex gap-2">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="h-[2px] flex-1 bg-[var(--color-stone-dark)]">
              <div
                className="h-full bg-[var(--color-ink)] transition-all duration-500 ease-out"
                style={{ width: i <= step ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>
        <p className="mt-3 font-sans text-xs uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
          Étape {step + 1} / {STEP_LABELS.length} — {STEP_LABELS[step]}
        </p>
      </div>

      <form onSubmit={onSubmit}>
        {step === 0 && (
          <div>
            <h2 className="font-serif text-3xl italic">Votre bien</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {PROPERTY_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => update("propertyType", t.value)}
                  className={`border px-5 py-2.5 font-sans text-sm transition-colors ${
                    data.propertyType === t.value
                      ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-ivory)]"
                      : "border-[var(--color-stone-dark)] hover:border-[var(--color-ink)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <h3 className="mt-10 font-sans text-xs uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
              Comment souhaitez-vous être estimé ?
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {METHODS.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => update("method", m.value)}
                  className={`border p-4 text-left transition-colors ${
                    data.method === m.value
                      ? "border-[var(--color-ink)] bg-[var(--color-stone)]/50"
                      : "border-[var(--color-stone-dark)] hover:border-[var(--color-ink)]"
                  }`}
                >
                  <p className="font-sans text-sm font-medium">{m.label}</p>
                  <p className="mt-1 font-sans text-xs text-[var(--color-graphite)]">{m.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-serif text-3xl italic">Localisation du bien</h2>
            <label className="mt-6 block max-w-sm">
              <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
                Localité
              </span>
              <input
                autoFocus
                type="text"
                value={data.locality}
                onChange={(e) => update("locality", e.target.value)}
                placeholder="Lausanne, Rolle, Lonay…"
                className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-2.5 font-sans text-lg focus:border-[var(--color-ink)] focus:outline-none"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-serif text-3xl italic">Caractéristiques (optionnel)</h2>
            <div className="mt-6 grid max-w-sm grid-cols-2 gap-6">
              <label className="block">
                <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
                  Pièces
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={data.rooms}
                  onChange={(e) => update("rooms", e.target.value)}
                  placeholder="4.5"
                  className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-2.5 font-sans text-lg focus:border-[var(--color-ink)] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
                  Surface (m²)
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={data.surface}
                  onChange={(e) => update("surface", e.target.value)}
                  placeholder="120"
                  className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-2.5 font-sans text-lg focus:border-[var(--color-ink)] focus:outline-none"
                />
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-serif text-3xl italic">Votre projet</h2>
            <p className="mt-2 font-sans text-sm text-[var(--color-graphite)]">Sous quel délai envisagez-vous une vente ?</p>
            <div className="mt-6 flex flex-col gap-3 sm:max-w-sm">
              {TIMINGS.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => update("projectTiming", t.value)}
                  className={`border px-5 py-3 text-left font-sans text-sm transition-colors ${
                    data.projectTiming === t.value
                      ? "border-[var(--color-ink)] bg-[var(--color-stone)]/50"
                      : "border-[var(--color-stone-dark)] hover:border-[var(--color-ink)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="font-serif text-3xl italic">Vos coordonnées</h2>
            <div className="mt-6 flex flex-col gap-5 sm:max-w-sm">
              <label className="block">
                <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
                  Nom
                </span>
                <input
                  required
                  autoFocus
                  type="text"
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-2.5 font-sans text-lg focus:border-[var(--color-ink)] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
                  E-mail
                </span>
                <input
                  required
                  type="email"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-2.5 font-sans text-lg focus:border-[var(--color-ink)] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
                  Téléphone (optionnel)
                </span>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-2.5 font-sans text-lg focus:border-[var(--color-ink)] focus:outline-none"
                />
              </label>
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center gap-6">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="font-sans text-sm text-[var(--color-graphite)] link-underline"
            >
              Retour
            </button>
          )}
          {step < STEP_LABELS.length - 1 ? (
            <button
              type="button"
              disabled={!canAdvance}
              onClick={() => setStep((s) => s + 1)}
              className="group ml-auto flex items-center gap-2.5 bg-[var(--color-ink)] px-7 py-3 font-sans text-sm text-[var(--color-ivory)] transition-opacity disabled:opacity-30"
            >
              Continuer
              <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={status === "loading" || !data.name || !data.email}
              className="ml-auto flex items-center gap-2.5 bg-[var(--color-ink)] px-7 py-3 font-sans text-sm text-[var(--color-ivory)] transition-opacity disabled:opacity-30"
            >
              {status === "loading" ? "Envoi en cours…" : "Envoyer ma demande"}
            </button>
          )}
        </div>
        {status === "error" && (
          <p className="mt-4 font-sans text-xs text-red-700">
            Une erreur est survenue. Contactez-nous directement par téléphone.
          </p>
        )}
      </form>
    </div>
  );
}
