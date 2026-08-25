"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PlaceholderVisual from "./PlaceholderVisual";

const stats = [
  { value: "3", label: "Étages" },
  { value: "3", label: "Ascenseurs" },
  { value: "27", label: "Nouveaux appartements" },
];

export default function ProjectShowcase() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { scale: 1.15 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );

      gsap.fromTo(
        ".croisette-reveal",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 60%",
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="projets" ref={wrapperRef} className="relative h-[200vh]">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-ink">
        <div ref={imageRef} className="absolute inset-0">
          <PlaceholderVisual tone="forest" mark="LC" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />

        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-16 md:px-10 md:pb-24">
          <p className="croisette-reveal text-[11px] uppercase tracking-widest2 text-ivory/60">
            Projet immobilier
          </p>
          <h2 className="croisette-reveal mt-4 font-display text-[13vw] italic leading-[0.95] text-ivory md:text-[6vw]">
            La Croisette
          </h2>
          <p className="croisette-reveal mt-6 max-w-lg text-[15px] font-light leading-relaxed text-ivory/80 md:text-base">
            3 étages, 3 ascenseurs et 27 nouveaux appartements : un projet
            immobilier d&rsquo;envergure à Genève.
          </p>

          <div className="croisette-reveal mt-10 flex flex-wrap gap-10 border-t border-ivory/15 pt-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl italic text-ivory">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-widest2 text-ivory/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
