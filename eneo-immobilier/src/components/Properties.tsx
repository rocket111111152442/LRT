"use client";

import { useState } from "react";
import { properties } from "@/lib/data";
import Reveal from "./Reveal";
import PlaceholderVisual from "./PlaceholderVisual";

const filters = [
  { id: "tous", label: "Tous les biens" },
  { id: "vente", label: "Ventes" },
  { id: "location", label: "Locations" },
] as const;

export default function Properties() {
  const [active, setActive] = useState<(typeof filters)[number]["id"]>("tous");

  const visible =
    active === "tous"
      ? properties
      : properties.filter((p) => p.category === active);

  return (
    <section id="biens" className="bg-mist/40 px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <Reveal>
            <p className="text-[11px] uppercase tracking-widest2 text-stone">
              Sélection
            </p>
            <h2 className="mt-4 max-w-xl font-display text-4xl italic leading-tight text-ink md:text-5xl">
              Des biens choisis avec exigence, à Genève et sa région.
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActive(f.id)}
                  className={`rounded-full border px-5 py-2.5 text-[13px] uppercase tracking-widest2 transition-colors duration-300 ${
                    active === f.id
                      ? "border-ink bg-ink text-ivory"
                      : "border-ink/20 text-ink/70 hover:border-ink/50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
          {visible.map((property, i) => (
            <Reveal key={property.id} delay={(i % 2) * 0.1}>
              <article className="group cursor-pointer">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/5">
                  <div className="absolute inset-0 transition-transform duration-[1.1s] ease-premium group-hover:scale-110">
                    <PlaceholderVisual tone={property.tone} mark={property.type.slice(0, 2).toUpperCase()} />
                  </div>
                  <span className="absolute left-4 top-4 rounded-full bg-ivory/90 px-4 py-1.5 text-[11px] uppercase tracking-widest2 text-ink">
                    {property.category === "vente" ? "À vendre" : "À louer"}
                  </span>
                </div>

                <div className="overflow-hidden pt-5">
                  <div className="transition-transform duration-500 ease-premium group-hover:-translate-y-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-2xl italic text-ink">
                        {property.title}
                      </h3>
                      <span className="whitespace-nowrap text-sm text-stone">
                        {property.surface}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] uppercase tracking-widest2 text-stone">
                      {property.type} · {property.location}
                    </p>

                    <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
                      <span className="text-sm text-ink/80">
                        {property.price}
                      </span>
                      <span className="inline-flex items-center gap-2 text-[13px] uppercase tracking-widest2 text-ink opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        Découvrir le bien →
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
