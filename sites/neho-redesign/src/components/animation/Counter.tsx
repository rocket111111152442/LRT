"use client";

import { useEffect, useRef, useState } from "react";
import { getGsap, prefersReducedMotion } from "./gsap-client";

/**
 * Anime un nombre de 0 à `value` lorsqu'il entre dans le viewport.
 * Accepte des valeurs textuelles composites (ex. "4,7 / 5", "CHF 25'000")
 * : seule la première séquence numérique est animée, le reste du texte
 * (préfixe/suffixe) est conservé tel quel.
 */
export function Counter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    // Les branches ci-dessous font toutes de la synchronisation avec un
    // état lu uniquement côté client (DOM monté, préférence système) :
    // impossible de le savoir avant l'effet, donc setState y est correct.
    const match = value.match(/[\d'.,]+/);
    const el = ref.current;
    if (!match || !el) {
      setDisplay(value);
      return;
    }

    const numStr = match[0];
    const target = parseFloat(numStr.replace(/[’']/g, "").replace(",", "."));
    if (Number.isNaN(target)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value);
      return;
    }

    const prefix = value.slice(0, match.index);
    const suffix = value.slice((match.index ?? 0) + numStr.length);
    const decimals = numStr.includes(",") || numStr.includes(".") ? 1 : 0;
    const hasThousandSep = numStr.includes("'") || numStr.includes("’");

    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }

    const { gsap, ScrollTrigger } = getGsap();
    const counter = { n: 0 };
    const ctx = gsap.context(() => {
      gsap.to(counter, {
        n: target,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => {
          const formatted = counter.n.toLocaleString("fr-CH", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            useGrouping: hasThousandSep,
          });
          setDisplay(`${prefix}${formatted}${suffix}`);
        },
        onComplete: () => setDisplay(value),
      });
    }, el);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.trigger === el && t.kill());
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
