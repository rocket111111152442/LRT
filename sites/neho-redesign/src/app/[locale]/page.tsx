import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Hero } from "@/components/home/Hero";
import { FixedFeeSection } from "@/components/home/FixedFeeSection";
import { CalculatorSection } from "@/components/home/CalculatorSection";
import { OffersPreview } from "@/components/home/OffersPreview";
import { SellingSteps } from "@/components/home/SellingSteps";
import { RegionsMapSection } from "@/components/home/RegionsMapSection";
import { AgentsPreview } from "@/components/home/AgentsPreview";
import { PropertiesPreview } from "@/components/home/PropertiesPreview";
import { DigitalToolsSection } from "@/components/home/DigitalToolsSection";
import { KeyStatsSection } from "@/components/home/KeyStatsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FaqSectionHome } from "@/components/home/FaqSectionHome";
import { EstimationCtaSection } from "@/components/home/EstimationCtaSection";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({
    locale,
    path: "",
    title: `${dict.meta.siteName} — ${dict.meta.tagline}`,
    description: dict.home.hero.subtitle,
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  return (
    <>
      <Hero locale={locale} dict={dict} />
      <FixedFeeSection dict={dict} />
      <CalculatorSection locale={locale} dict={dict} />
      <OffersPreview locale={locale} dict={dict} />
      <SellingSteps dict={dict} />
      <RegionsMapSection locale={locale} dict={dict} />
      <AgentsPreview locale={locale} dict={dict} />
      <PropertiesPreview locale={locale} dict={dict} />
      <DigitalToolsSection dict={dict} />
      <KeyStatsSection dict={dict} />
      <TestimonialsSection locale={locale} dict={dict} />
      <FaqSectionHome dict={dict} />
      <EstimationCtaSection locale={locale} dict={dict} />
    </>
  );
}
