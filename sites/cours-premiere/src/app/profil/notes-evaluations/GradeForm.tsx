"use client";

import { useActionState } from "react";
import { createGradeAction, type GradeFormState } from "./actions";

const initialState: GradeFormState = {};

export function GradeForm({ subjects }: { subjects: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createGradeAction, initialState);

  if (subjects.length === 0) {
    return (
      <p className="text-sm text-slate-500 rounded-xl border border-brand-border bg-brand-card p-6">
        Ajoute d&apos;abord une matière dans l&apos;onglet Matières pour pouvoir y noter des évaluations.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl border border-brand-border bg-brand-card p-6"
    >
      <div className="space-y-1 col-span-2 sm:col-span-4">
        <label htmlFor="subjectId" className="text-sm font-medium text-brand-ink">
          Matière
        </label>
        <select
          id="subjectId"
          name="subjectId"
          required
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1 col-span-2 sm:col-span-4">
        <label htmlFor="label" className="text-sm font-medium text-brand-ink">
          Intitulé
        </label>
        <input
          id="label"
          name="label"
          type="text"
          required
          placeholder="Contrôle chapitre 3"
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="value" className="text-sm font-medium text-brand-ink">
          Note
        </label>
        <input
          id="value"
          name="value"
          type="number"
          step="0.25"
          min="0"
          required
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="maxValue" className="text-sm font-medium text-brand-ink">
          Sur
        </label>
        <input
          id="maxValue"
          name="maxValue"
          type="number"
          step="0.25"
          min="1"
          defaultValue={20}
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="coefficient" className="text-sm font-medium text-brand-ink">
          Coefficient
        </label>
        <input
          id="coefficient"
          name="coefficient"
          type="number"
          step="0.5"
          min="0.5"
          defaultValue={1}
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="date" className="text-sm font-medium text-brand-ink">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      {state.error && (
        <p className="col-span-2 sm:col-span-4 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="col-span-2 sm:col-span-4 rounded-lg bg-brand-primary px-4 py-2.5 font-medium text-white hover:bg-brand-primary-dark transition disabled:opacity-60"
      >
        {pending ? "Ajout…" : "Ajouter la note"}
      </button>
    </form>
  );
}
