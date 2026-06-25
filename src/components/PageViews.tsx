"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Affiche le nombre de visiteurs. On ne compte chaque visiteur qu'une seule
 * fois par session (sessionStorage) : un nouveau visiteur incrémente (POST),
 * les visiteurs déjà comptés ne font que lire le total (GET).
 */
export function PageViews({
  className = "",
  label = "clients cherchant un réparateur",
}: {
  className?: string;
  label?: string;
}) {
  const [views, setViews] = useState<number | null>(null);
  const counted = useRef(false);

  useEffect(() => {
    // Garde-fou contre le double-appel de React StrictMode en dev.
    if (counted.current) return;
    counted.current = true;

    let active = true;
    const alreadyCounted = sessionStorage.getItem("qoravo-visitor-counted") === "1";

    (async () => {
      try {
        const res = await fetch("/api/pageviews", {
          method: alreadyCounted ? "GET" : "POST",
        });
        const data = await res.json();
        if (!alreadyCounted) {
          sessionStorage.setItem("qoravo-visitor-counted", "1");
        }
        if (active && typeof data.views === "number") {
          setViews(data.views);
        }
      } catch {
        /* silencieux */
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (views === null) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      aria-live="polite"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      <span>
        <strong>{views.toLocaleString("fr-FR")}</strong> {label}
      </span>
    </span>
  );
}
