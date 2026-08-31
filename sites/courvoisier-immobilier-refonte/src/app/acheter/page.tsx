import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { PropertyListing } from "@/components/properties/property-listing";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Acheter un bien immobilier sur l’arc lémanique",
  description:
    "Maisons, appartements, immeubles et terrains à vendre entre Lausanne, Rolle et Lonay, sélectionnés par Courvoisier Immobilier.",
  path: "/acheter",
});

export default async function AcheterPage({
  searchParams,
}: {
  searchParams: Promise<{ localite?: string; type?: string; budget?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <PageIntro
        eyebrow="Acheter"
        title="Trouver le bien qui vous ressemble."
        lead="Maisons, appartements, immeubles de rendement et terrains sur l’arc lémanique — sélectionnés et accompagnés par nos courtiers."
      />
      <Container className="pb-24 sm:pb-32">
        <PropertyListing
          transaction="vente"
          initialLocality={params.localite}
          initialCategory={params.type}
          initialMaxPrice={params.budget}
        />
      </Container>
    </>
  );
}
