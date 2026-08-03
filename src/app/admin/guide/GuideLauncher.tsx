"use client";

import { Route } from "lucide-react";

export function GuideLauncher() {
  function openGuide() {
    window.dispatchEvent(new Event("Qoravo-admin-tour-open"));
  }

  return (
    <button
      type="button"
      onClick={openGuide}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
    >
      <Route aria-hidden="true" className="size-4 text-emerald-300" />
      Lancer le guide interactif
    </button>
  );
}
