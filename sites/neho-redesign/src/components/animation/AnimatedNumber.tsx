"use client";

import { useEffect, useRef, useState } from "react";
import { getGsap, prefersReducedMotion } from "./gsap-client";

/**
 * Anime la transition d'un nombre lors d'un changement de valeur (ex.
 * calculateur d'économies), indépendamment du scroll — contrairement à
 * `Counter`, qui déclenche une seule fois à l'entrée dans le viewport.
 */
export function AnimatedNumber({ value, formatter, className }: { value: number; formatter: (n: number) => string; className?: string }) {
  const [display, setDisplay] = useState(formatter(value));
  const current = useRef(value);

  useEffect(() => {
    if (prefersReducedMotion()) {
      // Synchronisation avec une préférence système lue côté client
      // (window.matchMedia) : impossible à connaître avant le montage,
      // donc l'effet est le bon outil ici (pas de calcul pur possible).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(formatter(value));
      current.current = value;
      return;
    }
    const { gsap } = getGsap();
    const obj = { n: current.current };
    const tween = gsap.to(obj, {
      n: value,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => setDisplay(formatter(Math.round(obj.n))),
      onComplete: () => {
        current.current = value;
      },
    });
    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className={className}>{display}</span>;
}
