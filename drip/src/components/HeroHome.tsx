"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Ouverture de la page d'accueil.
 *
 * Le parti pris est typographique : le mot occupe tout l'écran et le reste se
 * met en orbite autour. La composition tient donc debout sans photographie,
 * puis accueillera les visuels sans être redessinée.
 */
export function HeroHome({
  season,
  productCount,
}: {
  season: string;
  productCount: number;
}) {
  const [mounted, setMounted] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Un tick avant de lancer l'animation d'entrée : les fontes sont chargées,
    // le texte ne saute pas pendant la transition.
    const timer = window.setTimeout(() => setMounted(true), 60);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    let frame = 0;

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (shellRef.current) {
          // Parallaxe légère : le titre monte deux fois moins vite que la page.
          shellRef.current.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
          shellRef.current.style.opacity = String(Math.max(0, 1 - y / 700));
        }
        if (dropRef.current) {
          dropRef.current.style.transform = `translate3d(0, ${y * 0.42}px, 0)`;
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="relative flex min-h-[calc(100svh-108px)] flex-col justify-between overflow-hidden pt-10">
      {/* Colonnes de la grille, très discrètes : elles donnent la sensation
          d'une maquette imprimée plutôt que d'un fond vide. */}
      <div className="pointer-events-none absolute inset-0 flex justify-between px-[clamp(1rem,4vw,3.5rem)]" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} className="h-full w-px bg-[color:var(--color-hairline)] opacity-40" />
        ))}
      </div>

      <div className="shell relative">
        <div className="flex items-start justify-between gap-6">
          <p
            className="label max-w-[16ch] text-[color:var(--color-smoke)] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(14px)",
              transitionDelay: "500ms",
            }}
          >
            {season}
          </p>

          <p
            className="label max-w-[18ch] text-right transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(14px)",
              transitionDelay: "620ms",
            }}
          >
            {productCount > 0
              ? `${String(productCount).padStart(2, "0")} pièces disponibles`
              : "Collection en préparation"}
          </p>
        </div>
      </div>

      <div ref={shellRef} className="shell relative will-change-transform">
        <h1 className="display-hero flex items-end justify-center">
          {"DRIP".split("").map((letter, index) => (
            <span
              key={index}
              className="block overflow-hidden pt-[0.14em] -mt-[0.14em]"
            >
              <span
                className="block transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  transform: mounted ? "none" : "translateY(135%)",
                  transitionDelay: `${index * 85}ms`,
                }}
              >
                {letter}
              </span>
            </span>
          ))}

          {/* La goutte, qui tombe une fois à l'arrivée du titre. */}
          <span className="block overflow-hidden pb-[0.06em] pl-[0.04em] pt-[0.14em] -mt-[0.14em]">
            <svg
              viewBox="0 0 12 20"
              className="h-[0.28em] w-auto transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: mounted ? "none" : "translateY(-260%)",
                transitionDelay: "480ms",
              }}
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6 0c0 4.2 6 7.6 6 13.1A6 6 0 0 1 0 13.1C0 7.6 6 4.2 6 0Z" />
            </svg>
          </span>
        </h1>
      </div>

      <div className="shell relative pb-10">
        <div className="hairline grid gap-8 pt-8 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <p
            className="max-w-[38ch] text-pretty text-sm leading-relaxed text-[color:var(--color-smoke)] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(20px)",
              transitionDelay: "760ms",
            }}
          >
            Des casquettes dessinées en noir et blanc, produites en petites
            séries et fabriquées à la commande. Rien de plus, rien en trop.
          </p>

          <div
            className="flex flex-wrap gap-3 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(20px)",
              transitionDelay: "860ms",
            }}
          >
            <Link href="/boutique" className="btn">
              Voir la collection
            </Link>
            <Link href="/histoire" className="btn btn-outline">
              Le studio
            </Link>
          </div>

          <div
            ref={dropRef}
            className="flex items-center justify-start gap-3 will-change-transform md:justify-end"
            style={{
              opacity: mounted ? 1 : 0,
              transition: "opacity 1s cubic-bezier(0.16,1,0.3,1) 960ms",
            }}
          >
            <span className="label-sm text-[color:var(--color-smoke)]">Défiler</span>
            <span className="block h-10 w-px overflow-hidden bg-[color:var(--color-ash)]">
              <span className="block h-4 w-px animate-[drop_2.2s_ease-in-out_infinite] bg-[color:var(--color-ink)]" />
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes drop {
          0% { transform: translateY(-100%); }
          60%, 100% { transform: translateY(250%); }
        }
      `}</style>
    </section>
  );
}
