import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { ServicesExplorer } from "@/components/services/services-explorer";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Nos services — courtage, promotion, conseil, gérance",
  description:
    "Estimation, vente, location, promotion immobilière, conseil et gérance : les cinq métiers de Courvoisier Immobilier.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Nos métiers"
        title="Une maison immobilière complète."
        lead="Du premier rendez-vous d’estimation à la gestion locative dans la durée, cinq métiers pensés pour se compléter."
      />
      <Container className="pb-28 sm:pb-36">
        <ServicesExplorer />
      </Container>
    </>
  );
}
