"use client";

import { useActionState } from "react";
import { createNoteAction, updateNoteAction, type NoteFormState } from "./actions";

const initialState: NoteFormState = {};

export function NoteForm({
  subjectId,
  mode,
  note,
}: {
  subjectId: string;
  mode: "create" | "edit";
  note?: { id: string; title: string; content: string };
}) {
  const action = mode === "create" ? createNoteAction : updateNoteAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-brand-border bg-brand-card p-6">
      <input type="hidden" name="subjectId" value={subjectId} />
      {note && <input type="hidden" name="noteId" value={note.id} />}

      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium text-brand-ink">
          Titre
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={note?.title}
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="content" className="text-sm font-medium text-brand-ink">
          Contenu
        </label>
        <textarea
          id="content"
          name="content"
          rows={14}
          defaultValue={note?.content}
          className="w-full rounded-lg border border-brand-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-primary font-mono text-sm"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
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
