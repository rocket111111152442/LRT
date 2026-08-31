import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { PricingTable } from "@/components/pricing/PricingTable";
import { JsonLd } from "@/components/seo/JsonLd";
import { offerJsonLd } from "@/lib/seo/jsonld";
import { pricingTiers } from "@/config/site-numbers";
import { siteFaq } from "@/lib/data/faq";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, path: "/offres", title: dict.pricing.hero.title, description: dict.pricing.hero.description });
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const t = dict.pricing;

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <Breadcrumbs locale={locale} items={[{ label: dict.common.breadcrumbHome, href: "" }, { label: t.hero.title }]} />
        {pricingTiers.map((tier) => (
          <JsonLd key={tier.id} data={offerJsonLd(tier.name, tier.price)} />
        ))}
        <div className="mt-6 max-w-2xl">
          <SectionHeading eyebrow={t.hero.eyebrow} title={t.hero.title} description={t.hero.description} />
        </div>

        <div className="mt-10">
          <PricingTable locale={locale} dict={dict} />
        </div>

        <div className="mt-10 flex gap-3 rounded-2xl border border-bronze-500/50 bg-bronze-100/60 p-5">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-bronze-600" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-ink-700">{t.disclaimer}</p>
        </div>

        <div className="mt-16 max-w-2xl">
          <h2 className="font-display text-2xl text-ink-900">{t.faqTitle}</h2>
          <div className="mt-6">
            <FaqAccordion items={siteFaq.slice(0, 4)} />
          </div>
        </div>
      </Container>
    </div>
  );
}
