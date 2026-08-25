"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const lines = [
  "Depuis 2005, énéo accompagne les",
  "propriétaires dans la gestion, la",
  "transformation et la valorisation de",
  "leurs biens immobiliers à Genève.",
];

export default function Intro() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".intro-line-inner",
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-ivory px-6 py-32 md:px-10 md:py-44">
      <div className="mx-auto max-w-6xl">
        <p className="mb-10 text-[11px] uppercase tracking-widest2 text-stone">
          Notre philosophie
        </p>
        <p className="font-display text-[9vw] font-light italic leading-[1.05] text-ink md:text-[3.4vw]">
          {lines.map((line) => (
            <span key={line} className="reveal-line">
              <span className="intro-line-inner block">{line}</span>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
