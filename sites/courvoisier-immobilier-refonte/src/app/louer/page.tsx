import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { PropertyListing } from "@/components/properties/property-listing";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Louer un appartement ou une maison sur l’arc lémanique",
  description:
    "Locations résidentielles et commerciales entre Lausanne, Rolle et Lonay, proposées par Courvoisier Immobilier.",
  path: "/louer",
});

export default async function LouerPage({
  searchParams,
}: {
  searchParams: Promise<{ localite?: string; type?: string; budget?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <PageIntro
        eyebrow="Louer"
        title="Un logement, une adresse, une équipe disponible."
        lead="Appartements et maisons en location entre Lausanne, Rolle et Lonay, avec un suivi direct de nos courtiers."
      />
      <Container className="pb-24 sm:pb-32">
        <PropertyListing
          transaction="location"
          initialLocality={params.localite}
          initialCategory={params.type}
          initialMaxPrice={params.budget}
        />
      </Container>
    </>
  );
}
