"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

// Identifiants Trustpilot (renseignés via variables d'environnement Vercel).
// Tant que le Business Unit ID est vide, le widget ne s'affiche pas.
const BUSINESS_UNIT_ID = process.env.NEXT_PUBLIC_TRUSTPILOT_BUSINESS_UNIT_ID ?? "";
const TEMPLATE_ID =
  process.env.NEXT_PUBLIC_TRUSTPILOT_TEMPLATE_ID ?? "56278e9abfbbba0bdcd568bc"; // "Micro Combo" par défaut
const PROFILE_URL = process.env.NEXT_PUBLIC_TRUSTPILOT_PROFILE_URL ?? "";

declare global {
  interface Window {
    Trustpilot?: { loadFromElement: (el: HTMLElement, force?: boolean) => void };
  }
}

export function TrustpilotWidget({
  theme = "light",
  height = "120px",
}: {
  theme?: "light" | "dark";
  height?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Le script peut déjà être chargé (navigation interne) : on force le rendu.
    if (ref.current && window.Trustpilot) {
      window.Trustpilot.loadFromElement(ref.current, true);
    }
  }, []);

  if (!BUSINESS_UNIT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
        strategy="afterInteractive"
      />
      {/* TrustBox widget officiel Trustpilot */}
      <div
        ref={ref}
        className="trustpilot-widget"
        data-locale="fr-FR"
        data-template-id={TEMPLATE_ID}
        data-businessunit-id={BUSINESS_UNIT_ID}
        data-style-height={height}
        data-style-width="100%"
        data-theme={theme}
      >
        <a href={PROFILE_URL || undefined} target="_blank" rel="noopener noreferrer">
          Voir nos avis sur Trustpilot
        </a>
      </div>
    </>
  );
}
