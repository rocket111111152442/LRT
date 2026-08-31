"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Révèle un élément une seule fois lorsqu’il entre dans le viewport.
 * Sous prefers-reduced-motion, la transition est neutralisée en CSS
 * (voir globals.css) : l’élément apparaît sans animation dès
 * l’intersection, sans logique JS séparée.
 */
export function useReveal<T extends HTMLElement>(options?: { threshold?: number; rootMargin?: string }) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: options?.threshold ?? 0.15, rootMargin: options?.rootMargin ?? "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin]);

  return { ref, isVisible };
}
