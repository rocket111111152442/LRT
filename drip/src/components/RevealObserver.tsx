"use client";

import { useEffect } from "react";

/**
 * Anime l'apparition des éléments marqués `.reveal`, `.reveal-mask` ou
 * `.reveal-line` quand ils entrent dans le viewport.
 *
 * Deux observateurs travaillent ensemble :
 *
 *  - un IntersectionObserver, qui déclenche l'animation à l'entrée dans l'écran ;
 *  - un MutationObserver, indispensable ici. Next.js envoie le contenu des pages
 *    en streaming : il arrive dans le DOM *après* le montage de ce composant, qui
 *    vit dans la coquille de la mise en page. Un scan unique au montage ne voyait
 *    donc que l'en-tête et le pied de page, et tout le corps des pages restait à
 *    `opacity: 0` — écran blanc garanti. Le MutationObserver rattrape chaque bloc
 *    au moment où il est inséré.
 *
 * Un seul couple d'observateurs pour toute l'application : le défilement reste
 * fluide même avec plusieurs centaines d'éléments animés.
 */

const SELECTOR =
  ".reveal:not(.is-visible), .reveal-mask:not(.is-visible), .reveal-line:not(.is-visible)";

export function RevealObserver() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const show = (element: Element) => element.classList.add("is-visible");

    if (prefersReducedMotion) {
      // Aucune animation : on se contente de tout afficher, y compris ce qui
      // arrivera plus tard.
      const revealAll = () =>
        document.querySelectorAll(SELECTOR).forEach(show);

      revealAll();

      const mutations = new MutationObserver(revealAll);
      mutations.observe(document.body, { childList: true, subtree: true });

      return () => mutations.disconnect();
    }

    const intersections = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          intersections.unobserve(entry.target);
        }
      },
      // Déclenchement un peu avant le bas de l'écran : l'élément est déjà animé
      // quand le regard l'atteint.
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );

    const register = (root: ParentNode) => {
      if (root instanceof Element && root.matches(SELECTOR)) {
        intersections.observe(root);
      }
      root.querySelectorAll(SELECTOR).forEach((element) => {
        intersections.observe(element);
      });
    };

    register(document);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            register(node as Element);
          }
        }
      }
    });

    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      intersections.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
