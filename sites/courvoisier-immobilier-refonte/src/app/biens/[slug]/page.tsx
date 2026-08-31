import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PropertyGallery } from "@/components/properties/property-gallery";
import { PropertyCard } from "@/components/properties/property-card";
import { VisitRequestForm } from "@/components/forms/visit-request-form";
import { IconBed, IconPin, IconRuler } from "@/components/ui/icons";
import { properties, getProperty, getSimilarProperties } from "@/lib/data/properties";
import { getAgency } from "@/lib/data/agencies";
import { formatPrice, formatRooms, formatSurface } from "@/lib/utils/format";
import { pageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import type { SceneName } from "@/components/illustrations/scenes";

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

const SCENE_BY_CATEGORY: Record<string, SceneName> = {
  Maison: "roofline",
  Appartement: "facade",
  Immeuble: "facade",
  Terrain: "contour",
  Commercial: "plan",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) return {};
  return pageMetadata({
    title: property.title,
    description: property.description,
    path: `/biens/${property.slug}`,
  });
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) notFound();

  const agency = getAgency(property.agencyId);
  const similar = getSimilarProperties(property);
  const scene = SCENE_BY_CATEGORY[property.category] ?? "facade";
  const galleryScenes: SceneName[] = [scene, "plan", "staircase", "contour"];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: property.transaction === "vente" ? "Acheter" : "Louer", path: `/${property.transaction === "vente" ? "acheter" : "louer"}` },
          { name: property.title, path: `/biens/${property.slug}` },
        ])}
      />

      <div className="pt-24 sm:pt-28">
        <Container>
          <PropertyGallery scenes={galleryScenes} />
        </Container>
      </div>

      <Container className="pb-32 pt-10 sm:pt-14">
        <div className="grid gap-16 lg:grid-cols-[1fr_22rem]">
          <div>
            <div className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.15em] text-[var(--color-graphite-light)]">
              <IconPin className="h-3.5 w-3.5" />
              {property.locality} · {property.category}
            </div>
            <h1 className="mt-4 max-w-2xl font-serif text-4xl italic leading-tight sm:text-5xl">
              {property.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-[var(--color-stone-dark)] py-5 font-sans text-sm">
              <span className="text-xl font-medium">
                {formatPrice(property.price, { perMonth: property.transaction === "location" })}
              </span>
              {property.rooms > 0 && (
                <span className="flex items-center gap-2 text-[var(--color-graphite)]">
                  <IconBed className="h-4 w-4" /> {formatRooms(property.rooms)}
                </span>
              )}
              <span className="flex items-center gap-2 text-[var(--color-graphite)]">
                <IconRuler className="h-4 w-4" /> {formatSurface(property.surface || property.landSurface || 0)}
              </span>
              {property.yearBuilt && (
                <span className="text-[var(--color-graphite)]">Construit en {property.yearBuilt}</span>
              )}
            </div>

            <p className="mt-8 max-w-2xl font-sans text-base leading-relaxed text-[var(--color-graphite)]">
              {property.description}
            </p>

            <ul className="mt-8 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
              {property.highlights.map((h) => (
                <li key={h} className="border-l border-[var(--color-brown)] pl-3 font-sans text-sm">
                  {h}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Eyebrow>Situation</Eyebrow>
              <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
                {property.locality}, canton de Vaud — à proximité de notre agence de {agency.city}. Plan de
                situation détaillé et documents transmis sur demande par le courtier en charge du dossier.
              </p>
            </div>
          </div>

          <aside id="contact-bien" className="h-fit space-y-8 border border-[var(--color-stone-dark)] p-7 lg:sticky lg:top-28">
            <div>
              <Eyebrow>Votre courtier</Eyebrow>
              <p className="mt-3 font-serif text-2xl italic">{agency.name}</p>
              <p className="mt-2 font-sans text-sm text-[var(--color-graphite)]">
                {agency.street}, {agency.postalCode} {agency.city}
              </p>
              <a href={agency.phoneHref} className="link-underline mt-2 inline-block font-sans text-sm">
                {agency.phone}
              </a>
            </div>
            <VisitRequestForm propertySlug={property.slug} propertyTitle={property.title} />
          </aside>
        </div>

        {similar.length > 0 && (
          <div className="mt-28 border-t border-[var(--color-stone-dark)] pt-16">
            <Eyebrow>À découvrir aussi</Eyebrow>
            <h2 className="mt-4 font-serif text-3xl italic sm:text-4xl">Biens similaires</h2>
            <div className="mt-10 grid gap-x-10 gap-y-14 sm:grid-cols-3">
              {similar.map((p) => (
                <PropertyCard key={p.slug} property={p} variant="compact" />
              ))}
            </div>
          </div>
        )}
      </Container>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-stone-dark)] bg-[var(--color-ivory)]/95 p-4 backdrop-blur-sm lg:hidden">
        <Link
          href="#contact-bien"
          className="block w-full bg-[var(--color-ink)] py-3 text-center font-sans text-sm text-[var(--color-ivory)]"
        >
          Demander une visite
        </Link>
      </div>
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </>
  );
}
