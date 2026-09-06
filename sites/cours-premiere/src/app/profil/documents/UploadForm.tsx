"use client";

import { useActionState } from "react";
import { uploadDocumentAction, type DocumentFormState } from "./actions";
import type { Subject } from "@/lib/subjects";

const initialState: DocumentFormState = {};

export function UploadForm({ subjects }: { subjects: Subject[] }) {
  const [state, formAction, pending] = useActionState(uploadDocumentAction, initialState);

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-brand-border bg-brand-card p-6"
    >
      <div className="space-y-1 sm:col-span-2">
        <label htmlFor="file" className="text-sm font-medium text-brand-ink">
          Fichier (4 Mo maximum)
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div className="space-y-1">
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

      {state.error && (
        <p className="sm:col-span-3 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="sm:col-span-3 rounded-lg bg-brand-primary px-4 py-2.5 font-medium text-white hover:bg-brand-primary-dark transition disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Envoyer le fichier"}
      </button>
    </form>
  );
}
