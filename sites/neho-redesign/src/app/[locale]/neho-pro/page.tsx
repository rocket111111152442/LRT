import type { Metadata } from "next";
import { Share2, Headset, Users } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { DemoBadge } from "@/components/ui/Badge";
import { Reveal } from "@/components/animation/Reveal";

const icons = [Share2, Headset, Users];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, path: "/neho-pro", title: dict.nehoPro.hero.title, description: dict.nehoPro.hero.description });
}

export default async function NehoProPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const t = dict.nehoPro;

  return (
    <div>
      <div className="bg-night-900 py-16 text-cream-50 sm:py-24">
        <Container>
          <Breadcrumbs locale={locale} items={[{ label: dict.common.breadcrumbHome, href: "" }, { label: dict.nav.menu.discoverPro }]} />
          <div className="mt-6 max-w-2xl">
            <div className="mb-4">
              <DemoBadge label={dict.meta.demoBadge} />
            </div>
            <SectionHeading eyebrow={t.hero.eyebrow} title={t.hero.title} description={t.hero.description} tone="dark" />
            <Button href={`/${locale}/contact`} variant="dark" size="lg" className="mt-7 bg-cream-50 text-ink-900 hover:bg-cream-100">
              {t.hero.cta}
            </Button>
          </div>
        </Container>
      </div>

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-5 sm:grid-cols-3">
            {t.points.map((point, i) => {
              const Icon = icons[i % icons.length] ?? Share2;
              return (
                <Reveal key={point.title} delay={i * 0.07} className="rounded-2xl border border-stone-200 bg-cream-100/50 p-6">
                  <Icon size={22} className="text-ivy-600" aria-hidden="true" />
                  <h3 className="mt-3 text-base font-semibold text-ink-900">{point.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{point.description}</p>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>
    </div>
  );
}
