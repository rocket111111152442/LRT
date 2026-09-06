"use client";

import { useActionState, useState } from "react";
import { signUpAction, type SignUpState } from "./actions";
import type { Subject } from "@/lib/subjects";

const initialState: SignUpState = {};

export function SignUpForm({
  specialites,
  maxSpecialites,
}: {
  specialites: Subject[];
  maxSpecialites: number;
}) {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(slug: string) {
    setSelected((current) => {
      if (current.includes(slug)) return current.filter((s) => s !== slug);
      if (current.length >= maxSpecialites) return current;
      return [...current, slug];
    });
  }

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-brand-border bg-brand-card p-6">
      <div className="space-y-1">
        <label htmlFor="firstName" className="text-sm font-medium text-brand-ink">
          Prénom (optionnel)
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          autoComplete="given-name"
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-brand-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-brand-ink">
          Mot de passe (8 caractères minimum)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-brand-ink">
          Confirme le mot de passe
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

      <div className="space-y-2">
        <p className="text-sm font-medium text-brand-ink">
          Tes spécialités ({selected.length}/{maxSpecialites})
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {specialites.map((s) => {
            const checked = selected.includes(s.slug);
            const disabled = !checked && selected.length >= maxSpecialites;
            return (
              <label
                key={s.slug}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${
                  checked
                    ? "border-brand-primary bg-indigo-50"
                    : "border-brand-border"
                } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <input
                  type="checkbox"
                  name="specialites"
                  value={s.slug}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(s.slug)}
                  className="accent-indigo-600"
                />
                {s.name}
              </label>
            );
          })}
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-primary px-4 py-2.5 font-medium text-white hover:bg-brand-primary-dark transition disabled:opacity-60"
      >
        {pending ? "Création…" : "Créer mon compte"}
      </button>
    </form>
  );
}
