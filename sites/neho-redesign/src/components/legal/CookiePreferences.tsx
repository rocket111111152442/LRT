"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary-type";

const STORAGE_KEY = "neho-demo-cookie-consent";

export function CookiePreferences({ dict }: { dict: Dictionary }) {
  const t = dict.legal.cookies.manage;
  const [analytics, setAnalytics] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // Lecture d'un système externe (localStorage) impossible avant le montage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setAnalytics(JSON.parse(raw).analytics === true);
    } catch {
      // ignore
    }
  }, []);

  function save(nextAnalytics: boolean) {
    setAnalytics(nextAnalytics);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: nextAnalytics, savedAt: Date.now() }));
    } catch {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="mt-10 rounded-2xl border border-stone-200 bg-cream-100/50 p-6">
      <h2 className="font-display text-xl text-ink-900">{t.title}</h2>
      <p className="mt-2 text-sm text-ink-500">{t.description}</p>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-cream-50 p-4">
          <div>
            <p className="text-sm font-medium text-ink-900">{t.necessary}</p>
            <p className="text-xs text-ink-500">{t.necessaryDesc}</p>
          </div>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ivy-600 text-cream-50">
            <Check size={14} aria-hidden="true" />
          </span>
        </div>

        <label className="flex items-center justify-between rounded-xl border border-stone-200 bg-cream-50 p-4">
          <div>
            <p className="text-sm font-medium text-ink-900">{t.analytics}</p>
            <p className="text-xs text-ink-500">{t.analyticsDesc}</p>
          </div>
          <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="h-5 w-5 accent-ivy-600" />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => save(analytics)} className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-medium text-cream-50 hover:bg-night-800">
          {t.save}
        </button>
        <button type="button" onClick={() => save(true)} className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-ink-900 hover:border-ivy-500">
          {t.acceptAll}
        </button>
        {saved ? (
          <span role="status" className="text-xs font-medium text-ivy-600">
            ✓
          </span>
        ) : null}
      </div>
    </div>
  );
}
