import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/Button";
import { PropertyGrid } from "@/components/properties/PropertyGrid";
import { getLocalityBySlug, localities } from "@/lib/data/localities";
import { offices } from "@/config/site";
import { getAllProperties } from "@/lib/data/allProperties";

const PREFIX = "agence-immobiliere-a-";

function resolveLocality(localityParam: string) {
  if (!localityParam.startsWith(PREFIX)) return undefined;
  return getLocalityBySlug(localityParam.slice(PREFIX.length));
}

export function generateStaticParams() {
  return localities.map((l) => ({ locality: `${PREFIX}${l.slug}` }));
}

export async function generateMetadata({ params }: { params: Promise<{ locality: string }> }): Promise<Metadata> {
  const { locality: localityParam } = await params;
  const locality = resolveLocality(localityParam);
  if (!locality) return {};
  return {
    title: `Agence immobilière à ${locality.city}`,
    description: `Courtage, estimation et développement foncier à ${locality.city} (${locality.canton}) — votrecourtier.ch SA, présente en Suisse romande depuis 2006.`,
    alternates: { canonical: `/${PREFIX}${locality.slug}` },
  };
}

export default async function LocalAgencyPage({ params }: { params: Promise<{ locality: string }> }) {
  const { locality: localityParam } = await params;
  const locality = resolveLocality(localityParam);
  if (!locality) notFound();

  const office = offices.find((o) => o.id === locality.office)!;
  const allProperties = await getAllProperties();
  const localProperties = allProperties.filter((p) => p.canton === locality.canton).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={`Agence immobilière — ${locality.city}`}
        title={`Courtage et estimation à ${locality.city}`}
        intro={locality.intro}
        scene={locality.canton === "VD" ? "villa" : "appartement"}
      />

      <Section tone="paper">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              <Eyebrow index="01">Le marché local</Eyebrow>
              <h2 className="mt-4 max-w-xs font-serif text-[1.7rem] leading-[1.2] text-ink">
                Ce que nous observons à {locality.city}
              </h2>
            </div>
            <div className="lg:col-span-8">
              <Reveal>
                <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-ink-soft">{locality.context}</p>
              </Reveal>
              <Reveal delay={0.08} className="mt-8 border-t border-stone pt-8">
                <p className="font-serif text-lg text-ink">Notre antenne de référence</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {office.label} — {office.street}, {office.postalCode} {office.city}
                  <br />
                  <a href={`tel:${office.phone}`} className="text-ink transition-colors hover:text-clay">
                    {office.phoneDisplay}
                  </a>{" "}
                  —{" "}
                  <a href={`mailto:${office.email}`} className="text-ink transition-colors hover:text-clay">
                    {office.email}
                  </a>
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {localProperties.length > 0 ? (
        <Section tone="dim">
          <Container>
            <p className="mb-10 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-clay">
              Biens dans la région
            </p>
            <PropertyGrid properties={localProperties} />
          </Container>
        </Section>
      ) : null}

      <Section tone="paper" compact>
        <Container className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-ink sm:text-[1.9rem]">
              Un projet immobilier à {locality.city} ?
            </h2>
            <p className="mt-2 max-w-md text-sm text-ink-soft">Estimation gratuite, sans engagement.</p>
          </div>
          <Button href="/estimation-immobiliere">Demander une estimation</Button>
        </Container>
      </Section>
    </>
  );
}
