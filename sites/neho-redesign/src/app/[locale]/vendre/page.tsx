import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/animation/Reveal";
import { SellingSteps } from "@/components/home/SellingSteps";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, path: "/vendre", title: dict.sell.hero.title, description: dict.sell.hero.description });
}

export default async function SellPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const t = dict.sell;

  return (
    <div>
      <div className="bg-cream-100/60 py-14 sm:py-20">
        <Container>
          <Breadcrumbs locale={locale} items={[{ label: dict.common.breadcrumbHome, href: "" }, { label: dict.nav.sell }]} />
          <div className="mt-6 max-w-2xl">
            <SectionHeading eyebrow={t.hero.eyebrow} title={t.hero.title} description={t.hero.description} />
            <Button href={`/${locale}/estimation`} size="lg" className="mt-6">
              {t.hero.cta}
            </Button>
          </div>
        </Container>
      </div>

      <section className="py-16 sm:py-24">
        <Container>
          <h2 className="font-display text-2xl text-ink-900 sm:text-3xl">{t.why.title}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {t.why.points.map((point, i) => (
              <Reveal key={point.title} delay={i * 0.08} className="rounded-2xl border border-stone-200 bg-cream-50 p-6">
                <h3 className="text-base font-semibold text-ink-900">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{point.description}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <div className="mb-4 px-5 text-center sm:px-8 lg:px-12">
        <p className="mx-auto max-w-2xl font-display text-2xl text-ink-900 sm:text-3xl">{t.process.title}</p>
        <p className="mx-auto mt-3 max-w-xl text-ink-500">{t.process.description}</p>
      </div>
      <SellingSteps dict={dict} />

      <section className="bg-ivy-700 py-16 text-center text-cream-50 sm:py-24">
        <Container className="flex flex-col items-center">
          <h2 className="max-w-xl font-display text-3xl">{t.ctaEstimate.title}</h2>
          <p className="mt-3 max-w-lg text-cream-50/80">{t.ctaEstimate.description}</p>
          <Button href={`/${locale}/estimation`} variant="dark" size="lg" className="mt-7">
            {t.ctaEstimate.cta}
          </Button>
        </Container>
      </section>
    </div>
  );
}
