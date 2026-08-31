"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "neho-demo-favorites";

/**
 * Favoris stockés en localStorage (par appareil/navigateur), aucune
 * synchronisation serveur dans ce concept de démonstration.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // Lecture d'un système externe (localStorage) impossible avant le montage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      // localStorage indisponible (navigation privée, etc.) : on continue sans favoris persistés.
    }
    setReady(true);
  }, []);

  const toggle = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);

  return { favorites, toggle, isFavorite, ready };
}
