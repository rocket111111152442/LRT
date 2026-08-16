"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Anime l'apparition des éléments marqués `.reveal`, `.reveal-mask` ou
 * `.reveal-line` quand ils entrent dans le viewport.
 *
 * Un unique IntersectionObserver pour toute la page (plutôt qu'un par
 * composant) : c'est ce qui garde le défilement fluide même avec plusieurs
 * centaines d'éléments animés.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".reveal:not(.is-visible), .reveal-mask:not(.is-visible), .reveal-line:not(.is-visible)",
      ),
    );

    if (prefersReducedMotion) {
      targets.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      // Déclenchement un peu avant le bas de l'écran : l'élément est déjà
      // animé quand le regard l'atteint.
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    targets.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
