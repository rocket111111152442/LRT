"use client";

import { useActionState } from "react";
import { createEventAction, type EventFormState } from "./actions";
import type { Subject } from "@/lib/subjects";

const initialState: EventFormState = {};

const TYPE_LABELS: Record<string, string> = {
  COURS: "Cours",
  DEVOIR: "Devoir",
  CONTROLE: "Contrôle",
  AUTRE: "Autre",
};

export function EventForm({ subjects }: { subjects: Subject[] }) {
  const [state, formAction, pending] = useActionState(createEventAction, initialState);

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-brand-border bg-brand-card p-6"
    >
      <div className="space-y-1 sm:col-span-2">
        <label htmlFor="title" className="text-sm font-medium text-brand-ink">
          Titre
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="date" className="text-sm font-medium text-brand-ink">
          Date et heure
        </label>
        <input
          id="date"
          name="date"
          type="datetime-local"
          required
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="type" className="text-sm font-medium text-brand-ink">
          Type
        </label>
        <select
          id="type"
          name="type"
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        >
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1 sm:col-span-2">
        <label htmlFor="subjectSlug" className="text-sm font-medium text-brand-ink">
          Matière (optionnel)
        </label>
        <select
          id="subjectSlug"
          name="subjectSlug"
          defaultValue=""
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option value="">Aucune / général</option>
          {subjects.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1 sm:col-span-2">
        <label htmlFor="description" className="text-sm font-medium text-brand-ink">
          Description (optionnel)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      {state.error && (
        <p className="sm:col-span-2 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="sm:col-span-2 rounded-lg bg-brand-primary px-4 py-2.5 font-medium text-white hover:bg-brand-primary-dark transition disabled:opacity-60"
      >
        {pending ? "Ajout…" : "Ajouter à l'agenda"}
      </button>
    </form>
  );
}
