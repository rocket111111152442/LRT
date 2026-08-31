"use client";

import { useEffect, useRef } from "react";
import { SwissRegionsMap } from "@/components/illustrations/SwissRegionsMap";
import { getGsap, prefersReducedMotion } from "@/components/animation/gsap-client";

export function RegionsMapAnimated() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const { gsap, ScrollTrigger } = getGsap();
    const lines = el.querySelectorAll<SVGLineElement>(".map-line");
    const nodes = el.querySelectorAll<SVGGElement>(".map-node");
    const facets = el.querySelectorAll<SVGPathElement>(".regions-map-facets path");

    lines.forEach((line) => {
      const length = line.getTotalLength();
      line.style.strokeDasharray = `${length}`;
      line.style.strokeDashoffset = `${length}`;
    });

    const ctx = gsap.context(() => {
      gsap.set(facets, { opacity: 0, transformOrigin: "center" });
      gsap.set(nodes, { opacity: 0, scale: 0.4, transformOrigin: "center" });

      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 75%", once: true } });
      tl.to(facets, { opacity: 1, duration: 0.6, stagger: 0.05, ease: "power1.out" })
        .to(lines, { strokeDashoffset: 0, duration: 0.9, stagger: 0.12, ease: "power2.inOut" }, "-=0.3")
        .to(nodes, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: "back.out(2)" }, "-=0.6");
    }, el);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.trigger === el && t.kill());
    };
  }, []);

  return (
    <div ref={ref} className="h-full w-full">
      <SwissRegionsMap />
    </div>
  );
}
