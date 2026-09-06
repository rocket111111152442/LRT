"use client";

import { useActionState } from "react";
import { createSubjectAction, type SubjectFormState } from "./actions";

const initialState: SubjectFormState = {};

export function SubjectForm() {
  const [state, formAction, pending] = useActionState(createSubjectAction, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col sm:flex-row gap-3 rounded-xl border border-brand-border bg-brand-card p-6"
    >
      <div className="flex-1 space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-brand-ink">
          Nouvelle matière
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Mathématiques, Histoire, Anglais..."
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-primary px-4 py-2.5 font-medium text-white hover:bg-brand-primary-dark transition disabled:opacity-60 sm:self-end"
      >
        {pending ? "Ajout…" : "Ajouter"}
      </button>
      {state.error && (
        <p className="text-sm text-red-600 sm:self-end" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
