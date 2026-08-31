"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { getGsap, prefersReducedMotion } from "./gsap-client";
import { cn } from "@/lib/utils/format";

/**
 * Enveloppe d'apparition progressive au scroll. Toujours un `<div>` pour
 * garder un typage simple ; utiliser un élément sémantique autour si
 * besoin (`<section><Reveal>…</Reveal></section>`).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    const { gsap, ScrollTrigger } = getGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once,
          },
        },
      );
    }, el);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.trigger === el && t.kill());
    };
  }, [delay, y, once]);

  return (
    <div ref={ref} className={cn(className)} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
