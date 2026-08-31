import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { SellTimeline } from "@/components/sell/sell-timeline";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Vendre son bien avec Courvoisier Immobilier",
  description:
    "Notre méthode de vente : estimation, valorisation, diffusion ciblée, négociation et suivi jusqu’à l’acte notarié.",
  path: "/vendre",
});

const VALORISATION_POINTS = [
  {
    title: "Positionnement",
    description: "Un prix fixé au plus juste, fondé sur une lecture fine du marché local.",
  },
  {
    title: "Photographies professionnelles",
    description: "Un bien présenté sous son meilleur jour, avant toute diffusion.",
  },
  {
    title: "Diffusion sur les canaux adaptés",
    description: "Une visibilité ciblée plutôt qu’une diffusion indifférenciée.",
  },
  {
    title: "Visites ciblées",
    description: "Des visites organisées avec des acquéreurs réellement qualifiés.",
  },
];

export default function VendrePage() {
  return (
    <>
      <PageIntro
        eyebrow="Vendre"
        title="Une méthode, du premier rendez-vous à l’acte notarié."
        lead="Cinq étapes, un seul interlocuteur : notre équipe vous accompagne du premier échange jusqu’à la signature."
      />

      <Container className="pb-28 sm:pb-36">
        <SellTimeline />
      </Container>

      <section className="border-t border-[var(--color-stone-dark)] bg-[var(--color-stone)]/40 py-24 sm:py-32">
        <Container>
          <Reveal className="max-w-lg">
            <h2 className="font-serif text-4xl italic sm:text-5xl">Mettre votre bien en valeur</h2>
            <p className="mt-5 font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
              La valorisation ne se limite pas au prix : elle passe aussi par la
              manière dont votre bien est présenté et diffusé.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-x-10 gap-y-10 border-t border-[var(--color-stone-dark)] pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {VALORISATION_POINTS.map((point, i) => (
              <Reveal key={point.title} delay={i * 80}>
                <p className="font-sans text-xs uppercase tracking-[0.15em] text-[var(--color-brown)]">
                  0{i + 1}
                </p>
                <p className="mt-3 font-sans text-lg font-medium">{point.title}</p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
                  {point.description}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 sm:py-32">
        <Container className="flex flex-col items-start gap-7">
          <Reveal>
            <h2 className="max-w-xl font-serif text-3xl italic sm:text-4xl">
              Une première estimation est le meilleur point de départ.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <Button href="/estimer">Estimer mon bien</Button>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
