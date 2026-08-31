import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PropertyGrid } from "@/components/properties/PropertyGrid";
import { properties } from "@/lib/data/properties";

export const metadata: Metadata = {
  title: "Projets neufs — Vente sur plan à Vaud & Fribourg",
  description: "Découvrez nos programmes neufs en vente sur plan dans les cantons de Vaud et Fribourg.",
  alternates: { canonical: "/projets-neufs" },
};

export default function ProjetsNeufsPage() {
  const projects = properties.filter((p) => p.type === "projet-neuf");

  return (
    <>
      <PageHero
        eyebrow="Projets neufs"
        title="Nos programmes en vente sur plan"
        intro="Une sélection de constructions neuves à Vaud et à Fribourg, du studio au 5.5 pièces familial."
        scene="appartement"
      />
      <Section tone="paper">
        <Container>
          <PropertyGrid properties={projects} />
        </Container>
      </Section>
    </>
  );
}
