import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { FeaturedProperties } from "@/components/home/featured-properties";
import { PromotionsSection } from "@/components/home/promotions-section";
import { EstimationTeaser } from "@/components/home/estimation-teaser";
import { ServicesTeaser } from "@/components/home/services-teaser";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { AgenciesSection } from "@/components/home/agencies-section";
import { CtaSection } from "@/components/home/cta-section";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Courvoisier Immobilier — courtage, promotion, conseil et gérance",
  description:
    "Agence immobilière indépendante à Lausanne, Rolle et Lonay. Estimation, vente, location, promotion et gérance sur l’arc lémanique.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProperties />
      <PromotionsSection />
      <EstimationTeaser />
      <ServicesTeaser />
      <TestimonialsSection />
      <AgenciesSection />
      <CtaSection />
    </>
  );
}
