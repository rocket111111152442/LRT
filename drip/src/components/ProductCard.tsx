import Image from "next/image";
import Link from "next/link";
import { formatPriceSmart } from "@/lib/money";
import { Stars } from "@/components/Stars";
import { CapSilhouette } from "@/components/CapSilhouette";

export type ProductCardProduct = {
  slug: string;
  name: string;
  subtitle: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  badge: string | null;
  images: { url: string; alt: string | null }[];
  variants: { id: string; color: string | null; colorHex: string | null }[];
};

export function ProductCard({
  product,
  rating,
  priority = false,
  index = 0,
}: {
  product: ProductCardProduct;
  rating?: { average: number; count: number };
  priority?: boolean;
  index?: number;
}) {
  const [primary, secondary] = product.images;

  // Une pastille par couleur distincte, sans doublon entre les tailles.
  const colors = Array.from(
    new Map(
      product.variants
        .filter((variant) => variant.color)
        .map((variant) => [variant.color, variant.colorHex]),
    ).entries(),
  ).slice(0, 5);

  return (
    <article
      className="product-card group reveal"
      style={{ ["--reveal-delay" as string]: `${Math.min(index, 6) * 70}ms` }}
    >
      <Link href={`/produit/${product.slug}`} className="block">
        <div className="product-media">
          {primary ? (
            <Image
              src={primary.url}
              alt={primary.alt ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
              priority={priority}
              className="object-cover"
            />
          ) : (
            <CapSilhouette />
          )}

          {secondary && (
            <div className="product-media__alt transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <Image
                src={secondary.url}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover"
              />
            </div>
          )}

          {product.badge && (
            <span className="tag tag-solid absolute left-3 top-3 z-10">{product.badge}</span>
          )}

          {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
            <span className="tag absolute right-3 top-3 z-10 bg-[color:var(--color-paper)]">
              −{Math.round((1 - product.basePrice / product.compareAtPrice) * 100)} %
            </span>
          )}

          {/* Bandeau qui monte depuis le bas du visuel au survol. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 translate-y-full bg-[color:var(--color-ink)] px-4 py-3 text-center text-[color:var(--color-paper)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">
            <span className="label">Voir la pièce</span>
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium tracking-tight">{product.name}</h3>
            {product.subtitle && (
              <p className="mt-1 truncate text-xs text-[color:var(--color-smoke)]">
                {product.subtitle}
              </p>
            )}

            {rating && rating.count > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <Stars rating={rating.average} size={11} />
                <span className="label-sm text-[color:var(--color-smoke)]">
                  {rating.count}
                </span>
              </div>
            )}
          </div>

          <div className="shrink-0 text-right">
            <p className="font-mono text-sm">{formatPriceSmart(product.basePrice)}</p>
            {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
              <p className="font-mono text-xs text-[color:var(--color-smoke)] line-through">
                {formatPriceSmart(product.compareAtPrice)}
              </p>
            )}
          </div>
        </div>

        {colors.length > 1 && (
          <div className="mt-3 flex items-center gap-1.5">
            {colors.map(([color, hex]) => (
              <span
                key={color}
                className="swatch !h-3 !w-3"
                style={{ backgroundColor: hex ?? "var(--color-smoke)" }}
                title={color ?? undefined}
              />
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}
