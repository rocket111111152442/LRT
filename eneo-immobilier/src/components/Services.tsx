"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { services } from "@/lib/data";
import PlaceholderVisual from "./PlaceholderVisual";

export default function Services() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const blocks = gsap.utils.toArray<HTMLElement>(".service-block");

      blocks.forEach((block) => {
        const image = block.querySelector(".service-image");
        const content = block.querySelectorAll(".service-content > *");

        gsap.fromTo(
          image,
          { yPercent: -12 },
          {
            yPercent: 12,
            ease: "none",
            scrollTrigger: {
              trigger: block,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );

        gsap.fromTo(
          content,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 70%",
            },
          }
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="services" ref={rootRef} className="bg-ivory">
      <div className="border-t border-ink/10 px-6 pt-24 md:px-10">
        <p className="text-[11px] uppercase tracking-widest2 text-stone">
          Nos expertises
        </p>
        <h2 className="mt-4 max-w-2xl font-display text-4xl italic leading-tight text-ink md:text-5xl">
          Un accompagnement complet, de la gestion quotidienne aux grands
          projets.
        </h2>
      </div>

      {services.map((service, i) => (
        <div
          key={service.id}
          className={`service-block group flex flex-col gap-10 border-t border-ink/10 px-6 py-20 md:flex-row md:items-center md:gap-16 md:px-10 md:py-28 ${
            i % 2 === 1 ? "md:flex-row-reverse" : ""
          }`}
        >
          <div className="relative h-[52vw] w-full overflow-hidden md:h-[34vw] md:w-1/2">
            <div className="service-image absolute inset-0 -top-[12%] h-[124%] w-full transition-transform duration-[1.2s] ease-premium group-hover:scale-[1.06]">
              <PlaceholderVisual tone={service.tone} mark={service.index} />
            </div>
          </div>

          <div className="service-content w-full md:w-1/2">
            <span className="block text-sm text-gold">{service.index}</span>
            <h3 className="mt-4 font-display text-5xl italic leading-none text-ink md:text-6xl">
              {service.title}
            </h3>
            <p className="mt-6 max-w-md text-[15px] font-light leading-relaxed text-stone md:text-base">
              {service.description}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
