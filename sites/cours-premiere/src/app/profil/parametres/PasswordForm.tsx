"use client";

import { useActionState } from "react";
import { changePasswordAction, type ProfileFormState } from "./actions";

const initialState: ProfileFormState = {};

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-brand-border bg-brand-card p-6">
      <div className="space-y-1">
        <label htmlFor="currentPassword" className="text-sm font-medium text-brand-ink">
          Mot de passe actuel
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="newPassword" className="text-sm font-medium text-brand-ink">
          Nouveau mot de passe
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-brand-ink">
          Confirme le nouveau mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
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
        {pending ? "Modification…" : "Changer le mot de passe"}
      </button>
    </form>
  );
}
