"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, TextAreaField } from "@/components/forms/FormField";
import { propertyStatusLabels, propertyTypeLabels } from "@/lib/data/properties";

const selectClasses =
  "mt-2 w-full border-0 border-b border-stone-dark bg-transparent py-3 text-[1.0625rem] text-ink focus:border-clay focus:outline-none";

function Select({
  id,
  label,
  options,
}: {
  id: string;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[0.75rem] uppercase tracking-[0.1em] text-ink-faint">
        {label}
      </label>
      <select id={id} name={id} required className={selectClasses} defaultValue={options[0]?.value}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AddPropertyForm({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/properties", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "L'ajout du bien a échoué.");
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      formRef.current?.reset();
      router.refresh();
    } catch {
      setError("Une erreur réseau est survenue. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-7">
      <fieldset disabled={disabled} className="space-y-7 disabled:opacity-50">
        <TextField id="title" label="Titre du bien" required />

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-3">
          <Select
            id="type"
            label="Type de bien"
            options={Object.entries(propertyTypeLabels).map(([value, label]) => ({ value, label }))}
          />
          <Select
            id="status"
            label="Statut"
            options={Object.entries(propertyStatusLabels).map(([value, label]) => ({ value, label }))}
          />
          <Select
            id="canton"
            label="Canton"
            options={[
              { value: "VD", label: "Vaud" },
              { value: "FR", label: "Fribourg" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
          <TextField id="city" label="Localité" required />
          <TextField id="priceChf" label="Prix (CHF)" type="number" min="0" required />
        </div>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-4">
          <TextField id="rooms" label="Pièces" type="number" step="0.5" min="0" />
          <TextField id="surfaceM2" label="Surface (m²)" type="number" min="0" />
          <TextField id="landM2" label="Terrain (m²)" type="number" min="0" />
          <TextField id="yearAvailable" label="Disponibilité (facultatif)" placeholder="Ex. Livraison 2027" />
        </div>

        <TextField id="summary" label="Résumé (une phrase)" required />

        <TextAreaField id="description" label="Description (un paragraphe par ligne)" rows={4} required />

        <TextAreaField id="features" label="Caractéristiques (une par ligne)" rows={4} />

        <div>
          <label htmlFor="photos" className="block text-[0.75rem] uppercase tracking-[0.1em] text-ink-faint">
            Photos (jusqu&rsquo;à 12)
          </label>
          <input
            id="photos"
            name="photos"
            type="file"
            accept="image/*"
            multiple
            className="mt-2 w-full text-sm text-ink-soft file:mr-4 file:border-0 file:bg-pine file:px-4 file:py-2 file:text-xs file:font-medium file:uppercase file:tracking-[0.08em] file:text-paper"
          />
        </div>
      </fieldset>

      {error ? <p className="text-sm text-alert">{error}</p> : null}
      {success ? <p className="text-sm text-pine">Bien ajouté — visible sur le site immédiatement.</p> : null}
      {disabled ? (
        <p className="text-sm text-ink-faint">Connectez le stockage Blob (voir ci-dessus) pour activer ce formulaire.</p>
      ) : null}

      <button
        type="submit"
        disabled={disabled || submitting}
        className="bg-pine px-7 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-pine-dim disabled:opacity-50"
      >
        {submitting ? "Envoi en cours…" : "Ajouter le bien"}
      </button>
    </form>
  );
}
