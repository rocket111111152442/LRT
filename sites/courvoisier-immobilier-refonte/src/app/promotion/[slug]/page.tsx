import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Artwork } from "@/components/illustrations/artwork";
import { promotions, getPromotion } from "@/lib/data/promotions";
import { pageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export function generateStaticParams() {
  return promotions.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const promotion = getPromotion(slug);
  if (!promotion) return {};
  return pageMetadata({
    title: promotion.name,
    description: promotion.concept,
    path: `/promotion/${promotion.slug}`,
  });
}

export default async function PromotionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const promotion = getPromotion(slug);
  if (!promotion) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Promotion", path: "/promotion" },
          { name: promotion.name, path: `/promotion/${promotion.slug}` },
        ])}
      />

      <section className="relative flex min-h-[70svh] flex-col justify-end bg-[var(--color-ink)] text-[var(--color-ivory)]">
        <div className="absolute inset-0">
          <Artwork scene="facade" tone="ink" ratio="full" showCaption={false} className="opacity-60" />
        </div>
        <Container className="relative pb-16 pt-40">
          <Eyebrow light>{promotion.locality} — {promotion.status}</Eyebrow>
          <h1 className="mt-5 max-w-2xl font-serif text-5xl italic leading-[1.05] sm:text-7xl">
            {promotion.name}
          </h1>
        </Container>
      </section>

      <Container className="py-20 sm:py-28">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <Reveal>
            <Eyebrow>Concept</Eyebrow>
            <div className="mt-5 space-y-5">
              {promotion.description.map((paragraph) => (
                <p key={paragraph} className="font-sans text-base leading-relaxed text-[var(--color-graphite)]">
                  {paragraph}
                </p>
              ))}
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-[var(--color-stone-dark)] pt-8">
              {promotion.architect && (
                <div>
                  <dt className="font-sans text-xs uppercase tracking-[0.15em] text-[var(--color-graphite-light)]">Architecte</dt>
                  <dd className="mt-1 font-serif text-lg italic">{promotion.architect}</dd>
                </div>
              )}
              {promotion.delivery && (
                <div>
                  <dt className="font-sans text-xs uppercase tracking-[0.15em] text-[var(--color-graphite-light)]">Livraison</dt>
                  <dd className="mt-1 font-serif text-lg italic">{promotion.delivery}</dd>
                </div>
              )}
              {promotion.units && (
                <div>
                  <dt className="font-sans text-xs uppercase tracking-[0.15em] text-[var(--color-graphite-light)]">Programme</dt>
                  <dd className="mt-1 font-serif text-lg italic">{promotion.units}</dd>
                </div>
              )}
            </dl>
          </Reveal>

          <Reveal delay={100}>
            <Artwork scene="plan" tone="stone" ratio="square" />
          </Reveal>
        </div>

        {promotion.typologies && (
          <div className="mt-24 border-t border-[var(--color-stone-dark)] pt-16">
            <Eyebrow>Typologies</Eyebrow>
            <h2 className="mt-4 font-serif text-3xl italic sm:text-4xl">Les appartements</h2>
            <div className="mt-10 divide-y divide-[var(--color-stone-dark)] border-y border-[var(--color-stone-dark)]">
              {promotion.typologies.map((typology) => (
                <div key={typology.label} className="flex items-center justify-between py-5 font-sans text-sm">
                  <span className="font-serif text-xl italic">{typology.label}</span>
                  <span className="text-[var(--color-graphite)]">{typology.surface}</span>
                  <span className="text-[var(--color-graphite)]">{typology.availability}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-20 flex flex-col items-start gap-6 border-t border-[var(--color-stone-dark)] pt-16">
          <p className="max-w-lg font-serif text-2xl italic">
            Documentation complète et disponibilités sur demande auprès de notre équipe promotion.
          </p>
          <Button href="/contact">Contacter l&rsquo;équipe promotion</Button>
          <p className="font-sans text-xs text-[var(--color-graphite-light)]">{promotion.sourceNote}</p>
        </div>
      </Container>
    </>
  );
}
