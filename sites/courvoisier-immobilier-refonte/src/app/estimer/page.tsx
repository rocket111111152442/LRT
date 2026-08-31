import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { Reveal } from "@/components/ui/reveal";
import { EstimationWizard } from "@/components/forms/estimation-wizard";
import { pageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { faqJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = pageMetadata({
  title: "Estimer son bien — en vrai, en visio ou en ligne",
  description:
    "Trois façons d’estimer gratuitement votre maison ou appartement avec Courvoisier Immobilier : sur place, en visioconférence ou en ligne.",
  path: "/estimer",
});

const PATHS = [
  {
    number: "01",
    title: "Rencontrer",
    description:
      "Un courtier se déplace chez vous pour une estimation détaillée, en tenant compte de l’état général, de la surface et du potentiel du bien.",
  },
  {
    number: "02",
    title: "Échanger",
    description:
      "Une estimation en visioconférence : rapide, sans rendez-vous à domicile, pour une première approche fiable.",
  },
  {
    number: "03",
    title: "Estimer",
    description:
      "Une première fourchette de prix en ligne, basée sur le marché local, en quelques clics.",
  },
];

const FAQ = [
  {
    question: "L’estimation est-elle payante ?",
    answer: "Non, les trois formats d’estimation proposés par Courvoisier Immobilier sont gratuits.",
  },
  {
    question: "Quelle méthode choisir ?",
    answer:
      "L’estimation en ligne convient pour une première idée rapide, la visio pour un échange sans déplacement, et l’estimation en vrai pour une évaluation détaillée avant une mise en vente.",
  },
];

export default function EstimerPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(FAQ)} />
      <PageIntro eyebrow="Estimation" title="Combien vaut votre bien ?" />

      <Container className="pb-20">
        <div className="grid gap-10 border-y border-[var(--color-stone-dark)] py-12 sm:grid-cols-3">
          {PATHS.map((path, i) => (
            <Reveal key={path.number} delay={i * 90} className="border-t border-[var(--color-stone-dark)] pt-6 sm:border-t-0 sm:pt-0">
              <span className="font-serif text-2xl italic text-[var(--color-brown)]">{path.number}</span>
              <p className="mt-3 font-sans text-lg font-medium">{path.title}</p>
              <p className="mt-2 font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
                {path.description}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>

      <Container className="pb-32">
        <Reveal>
          <EstimationWizard />
        </Reveal>
      </Container>
    </>
  );
}
