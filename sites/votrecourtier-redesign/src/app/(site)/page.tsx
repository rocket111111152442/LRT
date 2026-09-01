import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { ServicesIndex } from "@/components/home/ServicesIndex";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { Stats } from "@/components/home/Stats";
import { WhyUs } from "@/components/home/WhyUs";
import { Process } from "@/components/home/Process";
import { Testimonials } from "@/components/home/Testimonials";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { EstimationCta } from "@/components/home/EstimationCta";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `${site.legalName} — Courtage et développement immobilier à Vaud & Fribourg`,
  description: site.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifesto />
      <ServicesIndex />
      <FeaturedProperties />
      <Stats />
      <WhyUs />
      <Process />
      <Testimonials />
      <AboutTeaser />
      <EstimationCta />
    </>
  );
}
