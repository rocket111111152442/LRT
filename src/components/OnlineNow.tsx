"use client";

import { useEffect, useState } from "react";

/**
 * Affiche le nombre de personnes connectées en direct.
 * Envoie un battement toutes les 15 s et rafraîchit le compteur.
 */
export function OnlineNow({ className = "" }: { className?: string }) {
  const [online, setOnline] = useState<number | null>(null);

  useEffect(() => {
    let id = sessionStorage.getItem("qoravo-presence-id");
    if (!id) {
      id =
        Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("qoravo-presence-id", id);
    }

    let active = true;

    async function ping() {
      try {
        const res = await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = await res.json();
        if (active && typeof data.online === "number") {
          setOnline(data.online);
        }
      } catch {
        /* silencieux */
      }
    }

    void ping();
    const interval = window.setInterval(ping, 15_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  if (online === null) {
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
        <strong>{online}</strong>{" "}
        {online > 1 ? "personnes en ligne" : "personne en ligne"}
      </span>
    </span>
  );
}
