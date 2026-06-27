"use client";

import { useEffect } from "react";

// On pose l'attribut data-trial-over sur <html> quand l'offre d'essai gratuit
// n'est plus disponible : soit le minuteur promo 72h (par visiteur) est ecoule,
// soit un compte a deja ete cree avec l'essai gratuit depuis ce navigateur.
// Les elements promotionnels marques .trial-promo sont alors masques par CSS.
const TRIAL_PROMO_KEY = "qoravo_trial_countdown_started_at";
const TRIAL_USED_KEY = "qoravo_trial_used";
const TRIAL_PROMO_MS = 72 * 60 * 60 * 1000;

export function TrialExpiryFlag() {
  useEffect(() => {
    const trialUsed = window.localStorage.getItem(TRIAL_USED_KEY) === "1";

    let promoExpired = false;
    const stored = window.localStorage.getItem(TRIAL_PROMO_KEY);
    if (stored) {
      const startedAt = Number(stored);
      if (!Number.isNaN(startedAt) && Date.now() - startedAt >= TRIAL_PROMO_MS) {
        promoExpired = true;
      }
    }

    if (trialUsed || promoExpired) {
      document.documentElement.setAttribute("data-trial-over", "1");
    }
  }, []);

  return null;
}
