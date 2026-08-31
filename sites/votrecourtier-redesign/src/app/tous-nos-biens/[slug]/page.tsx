import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { PropertyGallery } from "@/components/properties/PropertyGallery";
import { PropertyGrid } from "@/components/properties/PropertyGrid";
import { Reveal } from "@/components/animation/Reveal";
import {
  formatChf,
  getPropertyBySlug,
  getSimilarProperties,
  properties,
  propertyStatusLabels,
  propertyTypeLabels,
} from "@/lib/data/properties";
import { offices } from "@/config/site";

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) return {};
  return {
    title: `${property.title} — ${property.city}`,
    description: property.summary,
    alternates: { canonical: `/tous-nos-biens/${property.slug}` },
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) notFound();

  const similar = getSimilarProperties(property);
  const office = offices.find((o) => o.canton.toLowerCase() === property.canton.toLowerCase()) ?? offices[0]!;

  return (
    <>
      <div className="bg-pine pb-0 pt-28 sm:pt-32">
        <Container className="pb-8">
          <nav aria-label="Fil d'Ariane" className="text-[0.75rem] text-paper/50">
            <Link href="/tous-nos-biens" className="hover:text-paper">
              Tous nos biens
            </Link>
            <span className="mx-2">/</span>
            <span className="text-paper/80">{property.title}</span>
          </nav>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6 text-paper">
            <div>
              <p className="text-[0.6875rem] uppercase tracking-[0.18em] text-clay-soft">
                {property.city} — {property.canton} · {propertyTypeLabels[property.type]}
              </p>
              <h1 className="mt-3 max-w-2xl font-serif text-[2rem] leading-[1.1] sm:text-[2.6rem]">{property.title}</h1>
            </div>
            <div className="text-right">
              <p className="text-[0.6875rem] uppercase tracking-[0.18em] text-paper/50">
                {propertyStatusLabels[property.status]}
              </p>
              <p className="mt-2 font-serif text-2xl">CHF {formatChf(property.priceChf)}.—</p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="-mt-px pb-0">
        <PropertyGallery gallery={property.gallery} title={property.title} />
      </Container>

      <Section tone="paper">
        <Container>
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-8">
              <Reveal>
                <div className="grid grid-cols-2 gap-6 border-y border-stone py-6 sm:grid-cols-4">
                  <Stat label="Prix" value={`CHF ${formatChf(property.priceChf)}.—`} />
                  {property.rooms ? <Stat label="Pièces" value={`${property.rooms}`} /> : null}
                  {property.surfaceM2 ? <Stat label="Surface" value={`${property.surfaceM2} m²`} /> : null}
                  {property.landM2 ? <Stat label="Terrain" value={`${property.landM2} m²`} /> : null}
                  {property.yearAvailable ? <Stat label="Disponibilité" value={property.yearAvailable} /> : null}
                </div>
              </Reveal>

              <Reveal delay={0.06} className="mt-10 space-y-5">
                {property.description.map((p, i) => (
                  <p key={i} className="text-[1.0625rem] leading-relaxed text-ink-soft">
                    {p}
                  </p>
                ))}
              </Reveal>

              <Reveal delay={0.12} className="mt-10">
                <p className="text-[0.6875rem] uppercase tracking-[0.18em] text-ink-faint">Caractéristiques</p>
                <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                  {property.features.map((f) => (
                    <li key={f} className="flex gap-2.5 border-t border-stone pt-3 text-sm text-ink-soft">
                      <span className="text-clay">—</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <div className="lg:col-span-4">
              <Reveal className="sticky top-28 border border-stone p-7">
                <p className="font-serif text-lg text-ink">Intéressé par ce bien ?</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Notre équipe de {office.city} vous accompagne pour organiser une visite ou répondre à vos
                  questions.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Button href={`/contact?bien=${property.slug}`} className="justify-center">
                    Demander une visite
                  </Button>
                  <a
                    href={`tel:${office.phone}`}
                    className="flex items-center justify-center border border-ink/15 px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:border-ink"
                  >
                    {office.phoneDisplay}
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {similar.length > 0 ? (
        <Section tone="dim">
          <Container>
            <p className="mb-10 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-clay">
              Biens similaires
            </p>
            <PropertyGrid properties={similar} />
          </Container>
        </Section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone bg-paper/95 p-4 backdrop-blur-sm sm:hidden">
        <div className="flex items-center justify-between gap-4">
          <p className="font-feature-numeric text-sm text-ink">CHF {formatChf(property.priceChf)}.—</p>
          <Button href={`/contact?bien=${property.slug}`} size="sm">
            Demander une visite
          </Button>
        </div>
      </div>
      <div className="h-20 sm:hidden" aria-hidden="true" />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-faint">{label}</p>
      <p className="mt-1.5 font-feature-numeric text-lg text-ink">{value}</p>
    </div>
  );
}
