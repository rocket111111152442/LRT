import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { RegionsMapAnimated } from "@/components/home/RegionsMapAnimated";
import { coveredCantons } from "@/config/site";
import { companyStats } from "@/config/site-numbers";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

export function RegionsMapSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.home.regionsMap;

  return (
    <section className="relative overflow-hidden bg-night-900 py-20 text-cream-50 sm:py-28">
      <div className="grain pointer-events-none absolute inset-0" />
      <Container className="relative grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <SectionHeading eyebrow={t.eyebrow} title={t.title} description={t.description} tone="dark" />
          <div className="mt-8 flex gap-8">
            <div>
              <p className="font-display text-3xl">9</p>
              <p className="text-sm text-cream-50/65">{t.statAgents}</p>
            </div>
            <div>
              <p className="font-display text-3xl">{companyStats.cantonsCovered.value}</p>
              <p className="text-sm text-cream-50/65">{t.statRegions}</p>
            </div>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            {coveredCantons.map((canton) => (
              <li key={canton.slug}>
                <Link
                  href={`/${locale}/antennes/${canton.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-cream-50/25 px-3.5 py-1.5 text-sm hover:border-ivy-400 hover:text-ivy-300"
                >
                  {canton.name}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <Button href={`/${locale}/antennes`} variant="outline-light" className="mt-8">
            {t.ctaAll}
          </Button>
        </div>
        <div className="aspect-square w-full">
          <RegionsMapAnimated />
        </div>
      </Container>
    </section>
  );
}
