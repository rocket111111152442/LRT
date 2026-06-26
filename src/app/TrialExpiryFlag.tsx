"use client";

import { useEffect } from "react";

// Quand le minuteur promo 72h (par visiteur) est ecoule, on pose l'attribut
// data-trial-over sur <html>. Les elements promotionnels marques .trial-promo
// sont alors masques par CSS (on n'annonce plus l'offre gratuite).
const TRIAL_PROMO_KEY = "qoravo_trial_countdown_started_at";
const TRIAL_PROMO_MS = 72 * 60 * 60 * 1000;

export function TrialExpiryFlag() {
  useEffect(() => {
    const stored = window.localStorage.getItem(TRIAL_PROMO_KEY);
    if (!stored) return;
    const startedAt = Number(stored);
    if (Number.isNaN(startedAt)) return;
    if (Date.now() - startedAt >= TRIAL_PROMO_MS) {
      document.documentElement.setAttribute("data-trial-over", "1");
    }
  }, []);

  return null;
}
