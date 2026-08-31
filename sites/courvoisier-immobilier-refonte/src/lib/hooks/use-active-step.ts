"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Observe une liste d’éléments (étapes) et retourne l’index de celui qui
 * est le plus proche du centre du viewport. Sert la timeline scroll-driven
 * de la page Vendre et la navigation verticale de la page Services.
 */
export function useActiveStep(count: number) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const nodes = refs.current.filter((n): n is HTMLElement => Boolean(n));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const index = nodes.indexOf(visible.target as HTMLElement);
          if (index !== -1) setActiveIndex(index);
        }
      },
      { threshold: [0.3, 0.5, 0.7], rootMargin: "-20% 0px -35% 0px" }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [count]);

  const setRef = (index: number) => (node: HTMLElement | null) => {
    refs.current[index] = node;
  };

  return { activeIndex, setRef };
}
