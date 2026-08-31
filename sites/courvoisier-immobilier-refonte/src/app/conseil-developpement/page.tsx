import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Artwork } from "@/components/illustrations/artwork";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Conseil & développement immobilier",
  description:
    "Financement, fiscalité, potentiel d’un bien et développement de projets : le conseil de Courvoisier Immobilier pour propriétaires, héritiers, investisseurs et promoteurs.",
  path: "/conseil-developpement",
});

const AUDIENCES = [
  { title: "Propriétaires", description: "Qui s’interrogent sur le potentiel réel de leur bien." },
  { title: "Héritiers", description: "Confrontés à des décisions patrimoniales à plusieurs." },
  { title: "Investisseurs", description: "En recherche d’opportunités de rendement sur l’arc lémanique." },
  { title: "Promoteurs", description: "À la recherche d’un partenaire local pour un projet de développement." },
];

const CAPABILITIES = [
  {
    number: "01",
    title: "Financement & fiscalité",
    description: "Un accompagnement dans les démarches de financement et l’optimisation fiscale d’un projet.",
  },
  {
    number: "02",
    title: "Potentiel d’un bien",
    description: "Analyse des possibilités de transformation ou de division d’un bien existant.",
  },
  {
    number: "03",
    title: "Développement",
    description: "Étude, acquisition, développement, permis, construction et commercialisation d’un projet, de A à Z.",
  },
  {
    number: "04",
    title: "Partenaires & architectes",
    description: "Mise en relation avec un réseau de partenaires et d’architectes de confiance.",
  },
];

export default function ConseilDeveloppementPage() {
  return (
    <>
      <PageIntro
        eyebrow="Conseil & développement"
        title="Voir le potentiel avant tout le monde."
        lead="Financement, fiscalité, transformation, division ou développement d’un projet neuf : un conseil indépendant pour ceux qui envisagent l’immobilier comme un patrimoine à faire fructifier."
      />

      <Container className="pb-20">
        <div className="grid gap-8 border-y border-[var(--color-stone-dark)] py-10 sm:grid-cols-4">
          {AUDIENCES.map((audience, i) => (
            <Reveal key={audience.title} delay={i * 80}>
              <p className="font-serif text-xl italic">{audience.title}</p>
              <p className="mt-2 font-sans text-sm text-[var(--color-graphite)]">{audience.description}</p>
            </Reveal>
          ))}
        </div>
      </Container>

      <Container className="pb-28 sm:pb-36">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <div>
            {CAPABILITIES.map((c, i) => (
              <Reveal key={c.number} delay={i * 80} className="border-t border-[var(--color-stone-dark)] py-8 first:border-t-0">
                <div className="flex items-baseline gap-6">
                  <span className="font-serif text-lg italic text-[var(--color-brown)]">{c.number}</span>
                  <div>
                    <p className="font-sans text-lg font-medium">{c.title}</p>
                    <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
                      {c.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={100}>
            <Artwork scene="plan" tone="stone" ratio="portrait" />
          </Reveal>
        </div>

        <div className="mt-20 flex flex-col items-start gap-6 border-t border-[var(--color-stone-dark)] pt-16">
          <p className="max-w-lg font-serif text-2xl italic">
            Un projet, un terrain, un héritage à structurer&nbsp;? Parlons-en.
          </p>
          <Button href="/contact">Prendre contact</Button>
        </div>
      </Container>
    </>
  );
}
