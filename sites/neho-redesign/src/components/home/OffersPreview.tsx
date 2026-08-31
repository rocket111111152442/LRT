import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/animation/Reveal";
import { pricingTiers, pricingFeatureMatrix } from "@/config/site-numbers";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

export function OffersPreview({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.offers;
  const table = dict.pricing.table;

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={t.eyebrow} title={t.title} description={t.description} align="center" className="mx-auto" />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier, i) => {
            const highlights = pricingFeatureMatrix.filter((f) => f[tier.id]).slice(0, 5);
            return (
              <Reveal key={tier.id} delay={i * 0.08}>
                <Card
                  className={`flex h-full flex-col p-7 ${tier.recommended ? "border-ivy-500 ring-1 ring-ivy-500" : ""}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display text-2xl text-ink-900">{tier.name}</h3>
                    {tier.recommended ? <Badge tone="bronze">{table.recommended}</Badge> : null}
                  </div>
                  <p className="text-sm text-ink-500">{tier.tagline}</p>
                  <p className="mt-5 font-display text-3xl text-ink-900">
                    {dict.common.from} {tier.price}
                  </p>
                  <p className="text-xs text-ink-500">{table.priceCaveat}</p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {highlights.map((f) => (
                      <li key={f.feature} className="flex items-start gap-2 text-sm text-ink-700">
                        <Check size={16} className="mt-0.5 shrink-0 text-ivy-600" aria-hidden="true" />
                        {f.feature}
                      </li>
                    ))}
                  </ul>
                  <Button href={`/${locale}/offres`} variant={tier.recommended ? "primary" : "outline"} className="mt-7 w-full">
                    {table.ctaChoose}
                  </Button>
                </Card>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button href={`/${locale}/offres`} variant="ghost">
            {t.ctaCompare} →
          </Button>
        </div>
      </Container>
    </section>
  );
}
