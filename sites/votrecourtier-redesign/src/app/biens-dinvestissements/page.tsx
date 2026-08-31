import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PropertyGrid } from "@/components/properties/PropertyGrid";
import { properties } from "@/lib/data/properties";

export const metadata: Metadata = {
  title: "Biens d'investissement — Immeubles de rendement",
  description: "Immeubles de rendement et biens d'investissement à Vaud et Fribourg, avec état locatif détaillé.",
  alternates: { canonical: "/biens-dinvestissements" },
};

export default function BiensInvestissementPage() {
  const investment = properties.filter((p) => p.type === "investissement");

  return (
    <>
      <PageHero
        eyebrow="Biens d'investissement"
        title="Immeubles de rendement, analysés pour investir"
        intro="Rendement locatif, état d'entretien et potentiel de valorisation : chaque bien d'investissement fait l'objet d'une analyse dédiée avant sa mise en vente."
        scene="investissement"
      />
      <Section tone="paper">
        <Container>
          <PropertyGrid properties={investment} />
        </Container>
      </Section>
    </>
  );
}
