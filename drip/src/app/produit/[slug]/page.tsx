import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductPurchase } from "@/components/ProductPurchase";
import { Accordion } from "@/components/Accordion";
import { ProductCard } from "@/components/ProductCard";
import { Stars } from "@/components/Stars";
import {
  getProductBySlug,
  getProductRating,
  getRatingsFor,
  getRelatedProducts,
} from "@/lib/catalog";
import { prisma, safeQuery } from "@/lib/prisma";
import { appUrl } from "@/lib/stripe";
import { RETURN_WINDOW_DAYS, SHIPPING, SHOP } from "@/lib/shop";
import { formatPriceSmart } from "@/lib/money";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Pièce introuvable" };

  const image = product.images[0]?.url;

  return {
    title: product.seoTitle ?? product.name,
    description:
      product.seoDescription ??
      product.subtitle ??
      product.description.slice(0, 155),
    alternates: { canonical: `/produit/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.subtitle ?? product.description.slice(0, 155),
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [rating, related, reviews] = await Promise.all([
    getProductRating(product.id),
    getRelatedProducts(product.id, product.categoryId),
    safeQuery(
      () =>
        prisma.review.findMany({
          where: { productId: product.id, status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          take: 8,
          select: {
            id: true,
            authorName: true,
            rating: true,
            title: true,
            body: true,
            createdAt: true,
            verifiedPurchase: true,
            reply: true,
          },
        }),
      [],
      "avis du produit",
    ),
  ]);

  const relatedRatings = await getRatingsFor(related.map((item) => item.id));

  const availableVariants = product.variants.filter((variant) => variant.available);
  const inStock = availableVariants.length > 0;

  // Données structurées : c'est ce qui permet à Google d'afficher le prix, la
  // disponibilité et les étoiles directement dans les résultats de recherche.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) => image.url),
    brand: { "@type": "Brand", name: SHOP.name },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: (product.basePrice / 100).toFixed(2),
      highPrice: (
        Math.max(...product.variants.map((variant) => variant.price), product.basePrice) / 100
      ).toFixed(2),
      offerCount: product.variants.length,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${appUrl()}/produit/${product.slug}`,
    },
    ...(rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.average,
            reviewCount: rating.count,
          },
        }
      : {}),
  };

  // Fil d'ariane structuré : Google affiche « Accueil › Boutique › Rayon »
  // sous le lien, au lieu de l'adresse brute de la page.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "Accueil", item: appUrl() },
      { name: "Boutique", item: `${appUrl()}/boutique` },
      ...(product.category
        ? [
            {
              name: product.category.name,
              item: `${appUrl()}/boutique?rayon=${product.category.slug}`,
            },
          ]
        : []),
      { name: product.name, item: `${appUrl()}/produit/${product.slug}` },
    ].map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav className="shell flex items-center gap-2 py-6 text-[color:var(--color-smoke)]" aria-label="Fil d'ariane">
        <Link href="/" className="label-sm link-sweep">Accueil</Link>
        <span className="label-sm">/</span>
        <Link href="/boutique" className="label-sm link-sweep">Boutique</Link>
        {product.category && (
          <>
            <span className="label-sm">/</span>
            <Link href={`/boutique?rayon=${product.category.slug}`} className="label-sm link-sweep">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <section className="shell pb-16">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            {product.badge && <span className="tag tag-solid mb-4 inline-flex">{product.badge}</span>}
            <h1 className="display-xl max-w-[18ch]">{product.name}</h1>
            {product.subtitle && (
              <p className="mt-4 max-w-[48ch] text-sm text-[color:var(--color-smoke)]">
                {product.subtitle}
              </p>
            )}
          </div>

          {rating.count > 0 && (
            <a href="#avis" className="flex items-center gap-3">
              <Stars rating={rating.average} size={14} />
              <span className="label link-sweep">
                {rating.average.toFixed(1)} — {rating.count} avis
              </span>
            </a>
          )}
        </header>

        <ProductPurchase
          productId={product.id}
          productName={product.name}
          productSlug={product.slug}
          images={product.images.map((image) => ({ url: image.url, alt: image.alt }))}
          variants={product.variants.map((variant) => ({
            id: variant.id,
            name: variant.name,
            color: variant.color,
            colorHex: variant.colorHex,
            size: variant.size,
            price: variant.price,
            available: variant.available,
            imageUrl: variant.imageUrl,
          }))}
          compareAtPrice={product.compareAtPrice}
        />
      </section>

      {/* --- Description et détails ----------------------------------- */}
      <section className="shell section hairline">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <div>
            <p className="label reveal mb-6 text-[color:var(--color-smoke)]">(La pièce)</p>
            <div className="reveal max-w-[52ch] space-y-4 text-base leading-relaxed text-[color:var(--color-ink-soft)]">
              {product.description
                .split("\n")
                // `filter(Boolean)` laissait passer les lignes blanches, qui
                // s'affichaient en paragraphes vides.
                .filter((paragraph) => paragraph.trim())
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>
          </div>

          <div className="reveal">
            <Accordion
              items={[
                {
                  title: "Matière & entretien",
                  content:
                    product.composition ??
                    "Coton lourd, visière structurée, fermeture ajustable. Lavage à la main à l'eau froide, séchage à l'air libre. Ne pas passer au sèche-linge.",
                },
                {
                  title: "Livraison",
                  content: (
                    <div className="space-y-2">
                      {SHIPPING.zones.map((zone) => (
                        <p key={zone.code} className="flex justify-between gap-4">
                          <span>{zone.label}</span>
                          <span className="font-mono text-xs text-[color:var(--color-smoke)]">
                            {formatPriceSmart(zone.price)} — {zone.delay}
                          </span>
                        </p>
                      ))}
                      <p className="pt-2 text-[color:var(--color-smoke)]">
                        Livraison offerte dès {SHIPPING.freeThreshold / 100} € d&apos;achat.
                        Chaque pièce est fabriquée à la commande : comptez 2 à 5
                        jours ouvrés de confection avant expédition.
                      </p>
                    </div>
                  ),
                },
                {
                  title: "Retours & échanges",
                  content: `Vous disposez de ${RETURN_WINDOW_DAYS} jours après réception pour changer d'avis. La pièce doit être non portée, dans son état d'origine. Les frais de retour sont à votre charge, le remboursement intervient sous 14 jours après réception du colis.`,
                },
                {
                  title: "Paiement sécurisé",
                  content:
                    "Carte bancaire, Apple Pay et Google Pay via Stripe. Vos coordonnées bancaires ne transitent jamais par nos serveurs et ne sont jamais stockées par NATURAL BRUTAL.",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* --- Avis ------------------------------------------------------ */}
      <section id="avis" className="shell section hairline scroll-mt-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label reveal mb-4 text-[color:var(--color-smoke)]">(Avis vérifiés)</p>
            <h2 className="display-lg reveal-mask">
              <span>{rating.count > 0 ? `${rating.count} avis` : "Aucun avis"}</span>
            </h2>
          </div>

          {rating.count > 0 && (
            <div className="reveal flex items-center gap-4">
              <span className="display text-4xl">{rating.average.toFixed(1)}</span>
              <div>
                <Stars rating={rating.average} size={14} />
                <p className="label-sm mt-2 text-[color:var(--color-smoke)]">sur 5</p>
              </div>
            </div>
          )}
        </div>

        {rating.count > 0 && (
          <div className="reveal mb-12 max-w-md space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = rating.breakdown[star - 1];
              const percent = rating.count > 0 ? (count / rating.count) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-4">
                  <span className="label-sm w-6 shrink-0 text-[color:var(--color-smoke)]">
                    {star}★
                  </span>
                  <span className="h-px flex-1 bg-[color:var(--color-ash)]">
                    <span
                      className="block h-px bg-[color:var(--color-ink)]"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                  <span className="label-sm w-6 shrink-0 text-right text-[color:var(--color-smoke)]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="max-w-[50ch] text-sm text-[color:var(--color-smoke)]">
            Cette pièce n&apos;a pas encore été commentée. Les avis sont réservés
            aux personnes qui l&apos;ont achetée : ils apparaîtront ici après les
            premières livraisons.
          </p>
        ) : (
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <article
                key={review.id}
                className="reveal border-t border-[color:var(--color-hairline)] py-7 sm:pr-8"
                style={{ ["--reveal-delay" as string]: `${(index % 3) * 90}ms` }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <Stars rating={review.rating} size={12} />
                  <time
                    dateTime={review.createdAt.toISOString()}
                    className="label-sm text-[color:var(--color-smoke)]"
                  >
                    {review.createdAt.toLocaleDateString("fr-FR", {
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>

                {review.title && <h3 className="mb-2 text-sm font-medium">{review.title}</h3>}

                <p className="text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
                  {review.body}
                </p>

                <p className="label-sm mt-4 text-[color:var(--color-smoke)]">
                  {review.authorName}
                  {review.verifiedPurchase && " — achat vérifié"}
                </p>

                {review.reply && (
                  <div className="mt-4 border-l border-[color:var(--color-ink)] pl-4">
                    <p className="label-sm mb-1">Réponse de l&apos;atelier</p>
                    <p className="text-sm text-[color:var(--color-ink-soft)]">{review.reply}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* --- Suggestions ----------------------------------------------- */}
      {related.length > 0 && (
        <section className="shell section hairline">
          <p className="label reveal mb-10 text-[color:var(--color-smoke)]">(À voir aussi)</p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4">
            {related.map((item, index) => (
              <ProductCard
                key={item.id}
                product={item}
                rating={relatedRatings.get(item.id)}
                index={index}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
