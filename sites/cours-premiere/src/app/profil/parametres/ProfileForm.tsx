"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileFormState } from "./actions";

const initialState: ProfileFormState = {};

export function ProfileForm({
  firstName,
  classe,
}: {
  firstName: string;
  classe: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-brand-border bg-brand-card p-6">
      <div className="space-y-1">
        <label htmlFor="firstName" className="text-sm font-medium text-brand-ink">
          Prénom
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          defaultValue={firstName}
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="classe" className="text-sm font-medium text-brand-ink">
          Classe / niveau
        </label>
        <input
          id="classe"
          name="classe"
          type="text"
          placeholder="Terminale, BTS SIO, Licence 2..."
          defaultValue={classe}
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-600" role="status">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-primary px-4 py-2.5 font-medium text-white hover:bg-brand-primary-dark transition disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
