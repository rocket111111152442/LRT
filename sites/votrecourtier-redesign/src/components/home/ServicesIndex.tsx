"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/animation/Reveal";
import { ArchitecturalScene, type SceneVariant } from "@/components/illustrations/ArchitecturalScene";

const services: { title: string; description: string; href: string; scene: SceneVariant }[] = [
  {
    title: "Développement foncier",
    description: "Acquisition et valorisation de terrains à fort potentiel, seuls ou en partenariat.",
    href: "/developpement-foncier",
    scene: "terrain",
  },
  {
    title: "Vendre mon terrain",
    description: "Analyse de constructibilité et solutions de valorisation avant la mise en vente.",
    href: "/vendre-mon-terrain",
    scene: "projet-neuf",
  },
  {
    title: "Vendre mon bien résidentiel",
    description: "Estimation, mise en valeur et négociation jusqu'à la signature chez le notaire.",
    href: "/vendre-mon-bien-residentiel",
    scene: "villa",
  },
  {
    title: "Projets neufs",
    description: "Commercialisation de programmes neufs, de la vente sur plan à la livraison.",
    href: "/projets-neufs",
    scene: "appartement",
  },
  {
    title: "Estimation immobilière",
    description: "Évaluation gratuite et réaliste par un expert breveté, sans engagement.",
    href: "/estimation-immobiliere",
    scene: "investissement",
  },
];

export function ServicesIndex() {
  const [active, setActive] = useState(0);

  return (
    <Section tone="dim">
      <Container>
        <div className="mb-14 flex items-end justify-between gap-6">
          <Reveal>
            <Eyebrow index="03">Prestations</Eyebrow>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ul className="border-t border-stone-dark/60">
              {services.map((service, i) => (
                <li key={service.title} className="border-b border-stone-dark/60">
                  <Link
                    href={service.href}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group flex items-center justify-between gap-6 py-6 sm:py-8"
                  >
                    <div className="flex items-baseline gap-5 sm:gap-8">
                      <span className="font-feature-numeric text-xs text-ink-faint">0{i + 1}</span>
                      <span className="font-serif text-[1.4rem] leading-tight text-ink transition-colors duration-300 group-hover:text-clay sm:text-[1.85rem]">
                        {service.title}
                      </span>
                    </div>
                    <span className="hidden max-w-[13rem] text-right text-sm leading-snug text-ink-faint sm:block">
                      {service.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative hidden aspect-[4/5] overflow-hidden lg:col-span-5 lg:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <ArchitecturalScene variant={services[active]!.scene} className="h-full w-full" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </Section>
  );
}
