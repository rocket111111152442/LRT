import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PropertyGrid } from "@/components/properties/PropertyGrid";
import { properties } from "@/lib/data/properties";

export const metadata: Metadata = {
  title: "Biens résidentiels à vendre — Vaud & Fribourg",
  description: "Maisons, villas et appartements à vendre dans les cantons de Vaud et Fribourg.",
  alternates: { canonical: "/biens-residentiels" },
};

export default function BiensResidentielsPage() {
  const residential = properties.filter((p) => p.type === "maison" || p.type === "appartement");

  return (
    <>
      <PageHero
        eyebrow="Biens résidentiels"
        title="Maisons et appartements à vendre"
        intro="Une sélection de biens résidentiels à Vaud et à Fribourg, présentée avec la même rigueur que nos mandats de vente."
        scene="villa"
      />
      <Section tone="paper">
        <Container>
          <PropertyGrid properties={residential} />
        </Container>
      </Section>
    </>
  );
}
