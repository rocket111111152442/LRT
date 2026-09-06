"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, type ProfileFormState } from "./actions";
import type { Subject } from "@/lib/subjects";

const initialState: ProfileFormState = {};

export function ProfileForm({
  specialites,
  maxSpecialites,
  firstName,
  currentSpecialtySlugs,
}: {
  specialites: Subject[];
  maxSpecialites: number;
  firstName: string;
  currentSpecialtySlugs: string[];
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  const [selected, setSelected] = useState<string[]>(currentSpecialtySlugs);

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
                  checked ? "border-brand-primary bg-indigo-50" : "border-brand-border"
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
