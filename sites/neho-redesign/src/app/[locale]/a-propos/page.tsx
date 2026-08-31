import type { Metadata } from "next";
import { Sparkles, ShieldCheck, MapPinned, Cpu } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animation/Reveal";

const icons = [ShieldCheck, MapPinned, Sparkles, Cpu];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, path: "/a-propos", title: dict.about.hero.title, description: dict.about.hero.description });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const t = dict.about;

  return (
    <div>
      <div className="bg-cream-100/60 py-14 sm:py-20">
        <Container>
          <Breadcrumbs locale={locale} items={[{ label: dict.common.breadcrumbHome, href: "" }, { label: dict.nav.menu.discoverAbout }]} />
          <div className="mt-6 max-w-2xl">
            <SectionHeading eyebrow={t.hero.eyebrow} title={t.hero.title} description={t.hero.description} />
          </div>
        </Container>
      </div>

      <section className="py-16 sm:py-24">
        <Container className="max-w-3xl">
          <h2 className="font-display text-2xl text-ink-900">{t.story.title}</h2>
          <div className="mt-4 space-y-4 text-ink-700">
            {t.story.paragraphs.map((p) => (
              <p key={p} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-night-900 py-16 text-cream-50 sm:py-24">
        <Container>
          <h2 className="font-display text-2xl">{t.values.title}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.values.items.map((item, i) => {
              const Icon = icons[i % icons.length] ?? Sparkles;
              return (
                <Reveal key={item.title} delay={i * 0.06} className="rounded-2xl border border-cream-50/15 bg-cream-50/5 p-6">
                  <Icon size={22} className="text-ivy-300" aria-hidden="true" />
                  <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-cream-50/70">{item.description}</p>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container className="max-w-3xl">
          <h2 className="font-display text-2xl text-ink-900">{t.timeline.title}</h2>
          <ol className="mt-8 space-y-6 border-l border-stone-300 pl-6">
            {t.timeline.items.map((item) => (
              <li key={item.year} className="relative">
                <span aria-hidden="true" className="absolute -left-[1.65rem] top-1 h-3 w-3 rounded-full bg-ivy-600" />
                <p className="text-xs font-semibold uppercase tracking-wide text-ivy-600">{item.year}</p>
                <p className="mt-1 text-ink-700">{item.label}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </div>
  );
}
