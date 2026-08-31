import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Artwork } from "@/components/illustrations/artwork";
import { Monogram } from "@/components/illustrations/monogram";
import { siteConfig } from "@/config/site";
import { founders, teamDescription } from "@/lib/data/team";
import { values } from "@/lib/data/values";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "À propos — histoire, équipe et valeurs",
  description:
    "Courvoisier Immobilier est née en 2020 à l’initiative de Dimitri et Célia Courvoisier. Découvrez notre histoire, notre équipe et nos valeurs.",
  path: "/a-propos",
});

export default function AProposPage() {
  return (
    <>
      <PageIntro
        eyebrow="Courvoisier"
        title="Une agence à son image, plutôt qu’une méthode standardisée."
        lead={`L’histoire commence en ${siteConfig.founded}, lorsque Dimitri et Célia Courvoisier, passionnés d’immobilier et profondément attachés à leur région de La Côte, décident de créer une agence à leur image : indépendante, proche des gens, exigeante et transparente.`}
      />

      <Container className="pb-24">
        <div className="grid gap-x-10 gap-y-16 border-t border-[var(--color-stone-dark)] pt-16 sm:grid-cols-2">
          {founders.map((founder, i) => (
            <Reveal key={founder.slug} delay={i * 100}>
              <Monogram name={founder.name} tone={i === 0 ? "green" : "stone"} />
              <p className="mt-5 font-serif text-2xl italic">{founder.name}</p>
              <p className="mt-1 font-sans text-xs uppercase tracking-[0.15em] text-[var(--color-graphite-light)]">
                {founder.role}
              </p>
              <p className="mt-3 max-w-sm font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
                {founder.bio}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-16 max-w-2xl border-t border-[var(--color-stone-dark)] pt-10">
          <p className="font-sans text-base leading-relaxed text-[var(--color-graphite)]">{teamDescription}</p>
        </Reveal>
      </Container>

      <section className="bg-[var(--color-stone)]/40 py-24 sm:py-32">
        <Container>
          <Eyebrow>Nos valeurs</Eyebrow>
          <div className="mt-8 grid gap-10 border-t border-[var(--color-stone-dark)] pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <Reveal key={value.title} delay={i * 80}>
                <p className="font-serif text-2xl italic">{value.title}</p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
                  {value.description}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-24 sm:py-32">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
          <Reveal>
            <Artwork scene="contour" tone="stone" ratio="landscape" />
          </Reveal>
          <Reveal delay={100}>
            <Eyebrow>Implantation</Eyebrow>
            <h2 className="mt-4 font-serif text-3xl italic sm:text-4xl">
              Trois agences, un même territoire.
            </h2>
            <p className="mt-5 max-w-md font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
              Lausanne, Rolle et Lonay : trois implantations qui nous permettent
              de connaître finement le marché local, entre lac et vignoble.
            </p>
            <Button href="/agences" className="mt-7">
              Découvrir nos agences
            </Button>
          </Reveal>
        </div>
      </Container>
    </>
  );
}
