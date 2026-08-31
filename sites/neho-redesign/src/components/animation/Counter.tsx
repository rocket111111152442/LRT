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
    const match = value.match(/[\d'’.,]+/);
    const el = ref.current;
    if (!match || !el) {
      setDisplay(value);
      return;
    }

    const numStr = match[0];
    // "." et "," servent tantôt de séparateur de milliers (ex. EN "25,000",
    // FR "25'000"), tantôt de séparateur décimal (ex. "4,7 / 5", "4.7 / 5") :
    // on désambiguïse par la longueur du dernier groupe de chiffres. Un
    // groupe final de 3 chiffres est un regroupement de milliers ; un
    // groupe final de 1 ou 2 chiffres est une décimale.
    const groups = numStr.split(/['’.,]/);
    const lastGroup = groups[groups.length - 1] ?? "";
    const isDecimal = groups.length > 1 && lastGroup.length > 0 && lastGroup.length <= 2;
    const decimals = isDecimal ? lastGroup.length : 0;
    const target = isDecimal
      ? parseFloat(`${groups.slice(0, -1).join("")}.${lastGroup}`)
      : parseFloat(groups.join(""));

    if (Number.isNaN(target)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value);
      return;
    }

    const prefix = value.slice(0, match.index);
    const suffix = value.slice((match.index ?? 0) + numStr.length);
    const hasThousandSep = !isDecimal && groups.length > 1;
    // Préserve le caractère décimal d'origine (« , » en français, « . » en
    // anglais) pour ne pas mélanger les conventions pendant l'animation.
    const decimalChar = isDecimal ? numStr[numStr.length - lastGroup.length - 1] : ",";

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
          // Formatage manuel (voir src/lib/utils/format.ts) plutôt que
          // `toLocaleString` : ce calcul tourne uniquement côté client
          // (après hydratation), mais on garde un séparateur des milliers
          // fixe pour rester visuellement identique au reste du site.
          const fixed = counter.n.toFixed(decimals);
          const [intPart, decimalPart] = fixed.split(".");
          const grouped = hasThousandSep ? (intPart ?? "0").replace(/\B(?=(\d{3})+(?!\d))/g, "'") : (intPart ?? "0");
          const formatted = decimalPart ? `${grouped}${decimalChar}${decimalPart}` : grouped;
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
