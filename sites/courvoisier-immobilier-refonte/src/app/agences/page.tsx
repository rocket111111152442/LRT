import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { Reveal } from "@/components/ui/reveal";
import { Artwork } from "@/components/illustrations/artwork";
import { IconArrowUpRight } from "@/components/ui/icons";
import { agencies } from "@/lib/data/agencies";
import { pageMetadata } from "@/lib/seo/metadata";
import type { SceneName } from "@/components/illustrations/scenes";

export const metadata: Metadata = pageMetadata({
  title: "Nos agences — Lausanne, Rolle, Lonay",
  description: "Retrouvez Courvoisier Immobilier dans ses trois agences de l’arc lémanique.",
  path: "/agences",
});

const SCENES: SceneName[] = ["horizon", "contour", "facade"];

export default function AgencesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Territoire"
        title="Trois agences, un même terrain de jeu."
        lead="Lausanne, Rolle et Lonay : nos équipes connaissent leur secteur dans le détail, rue par rue, quartier par quartier."
      />

      <Container className="pb-28 sm:pb-36">
        <div className="divide-y divide-[var(--color-stone-dark)] border-t border-[var(--color-stone-dark)]">
          {agencies.map((agency, i) => (
            <Reveal
              key={agency.id}
              delay={i * 100}
              className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20"
            >
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <Artwork scene={SCENES[i % SCENES.length] ?? "facade"} ratio="landscape" />
              </div>
              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
                  Agence 0{i + 1}
                </p>
                <h2 className="mt-3 font-serif text-4xl italic sm:text-5xl">{agency.city}</h2>
                <p className="mt-5 font-sans text-base text-[var(--color-graphite)]">
                  {agency.street}, {agency.postalCode} {agency.city}
                </p>
                <p className="mt-1 font-sans text-sm text-[var(--color-graphite-light)]">{agency.hours}</p>
                <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 font-sans text-sm">
                  <a href={agency.phoneHref} className="link-underline">
                    {agency.phone}
                  </a>
                  <a
                    href={agency.mapsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2 link-underline"
                  >
                    Itinéraire
                    <IconArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
