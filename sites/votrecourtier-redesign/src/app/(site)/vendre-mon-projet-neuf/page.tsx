import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Vendre mon projet neuf — Commercialisation sur plan",
  description:
    "Promoteurs et propriétaires : votrecourtier.ch SA commercialise vos programmes neufs à Vaud et Fribourg, de la vente sur plan à la livraison.",
  alternates: { canonical: "/vendre-mon-projet-neuf" },
};

const pillars = [
  {
    title: "Positionnement du programme",
    description: "Analyse de la cible, du prix au m² du secteur et du calendrier de commercialisation le plus favorable.",
  },
  {
    title: "Supports de vente",
    description: "Plans, argumentaire technique et présentation du programme adaptés à une vente sur plan.",
  },
  {
    title: "Suivi des réservations",
    description: "Gestion des dossiers acquéreurs, des choix de finitions et de la coordination avec le notaire jusqu'à la livraison.",
  },
];

export default function VendreMonProjetNeufPage() {
  return (
    <>
      <PageHero
        eyebrow="Vendre mon projet neuf"
        title="Commercialiser un programme neuf demande un rythme différent."
        intro="Notre équipe accompagne promoteurs et propriétaires fonciers dans la vente sur plan de leurs programmes, avec la même rigueur que pour un bien existant."
        scene="projet-neuf"
      />

      <Section tone="paper">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              <Eyebrow index="01">Notre accompagnement</Eyebrow>
              <h2 className="mt-4 max-w-xs font-serif text-[1.9rem] leading-[1.15] text-ink sm:text-[2.2rem]">
                De la mise en vente à la livraison
              </h2>
            </div>
            <div className="lg:col-span-8">
              <ul className="grid grid-cols-1 gap-x-10 gap-y-10 border-t border-stone pt-10 sm:grid-cols-2">
                {pillars.map((p, i) => (
                  <Reveal as="li" key={p.title} delay={i * 0.07}>
                    <span className="font-feature-numeric text-xs text-clay">0{i + 1}</span>
                    <h3 className="mt-3 font-serif text-lg text-ink">{p.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{p.description}</p>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="dim" compact>
        <Container className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-ink sm:text-[1.9rem]">Un programme à commercialiser ?</h2>
            <p className="mt-2 max-w-md text-sm text-ink-soft">Parlons-en directement avec notre équipe.</p>
          </div>
          <Button href="/contact">Nous contacter</Button>
        </Container>
      </Section>
    </>
  );
}
