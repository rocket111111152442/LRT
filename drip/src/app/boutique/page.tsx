import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Marquee } from "@/components/Marquee";
import {
  SORT_LABELS,
  getRatingsFor,
  listCategories,
  listProducts,
  parseSort,
} from "@/lib/catalog";
import { SHIPPING } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "Tout l'équipement NATURAL BRUTAL : vêtements pour les sports de combat et la salle, fabriqués à la commande.",
};

type SearchParams = Promise<{
  rayon?: string;
  tri?: string;
  q?: string;
}>;

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sort = parseSort(params.tri);
  const search = params.q?.trim() || undefined;

  const [{ products, total }, categories] = await Promise.all([
    listProducts({ category: params.rayon, sort, search }),
    listCategories(),
  ]);

  const ratings = await getRatingsFor(products.map((product) => product.id));
  const activeCategory = categories.find(
    (category) => category.slug === params.rayon,
  );

  /** Conserve les filtres en place quand on n'en change qu'un seul. */
  const buildHref = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { rayon: params.rayon, tri: params.tri, q: search, ...patch };

    for (const [key, value] of Object.entries(merged)) {
      if (value) next.set(key, value);
    }

    const query = next.toString();
    return query ? `/boutique?${query}` : "/boutique";
  };

  return (
    <>
      <header className="shell pb-12 pt-16 lg:pt-24">
        <p className="label reveal mb-6 text-[color:var(--color-smoke)]">
          (Boutique)
        </p>

        <div className="flex flex-wrap items-end justify-between gap-8">
          <h1 className="display-xl reveal-mask max-w-[16ch]">
            <span>{activeCategory ? activeCategory.name : "L'équipement"}</span>
          </h1>

          <p className="label reveal text-[color:var(--color-smoke)]">
            {total} pièce{total > 1 ? "s" : ""}
            {search && ` pour « ${search} »`}
          </p>
        </div>

        {activeCategory?.tagline && (
          <p className="reveal mt-6 max-w-[52ch] text-sm text-[color:var(--color-smoke)]">
            {activeCategory.tagline}
          </p>
        )}
      </header>

      {/* Barre de filtres collante sous l'en-tête. */}
      <div className="sticky top-[68px] z-30 border-y border-[color:var(--color-hairline)] bg-[color:var(--color-paper)]/92 backdrop-blur-md">
        <div className="shell flex items-center gap-6 overflow-x-auto py-3.5 no-scrollbar">
          <div className="flex shrink-0 items-center gap-5">
            <Link
              href={buildHref({ rayon: undefined })}
              className={`label whitespace-nowrap link-sweep ${
                params.rayon ? "opacity-55" : "opacity-100"
              }`}
            >
              Tout
            </Link>

            {categories.map((category) => (
              <Link
                key={category.slug}
                href={buildHref({ rayon: category.slug })}
                className={`label whitespace-nowrap link-sweep ${
                  params.rayon === category.slug ? "opacity-100" : "opacity-55"
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>

          <span className="ml-auto hidden h-4 w-px shrink-0 bg-[color:var(--color-hairline)] sm:block" />

          <div className="flex shrink-0 items-center gap-5">
            {(Object.keys(SORT_LABELS) as (keyof typeof SORT_LABELS)[]).map((key) => (
              <Link
                key={key}
                href={buildHref({ tri: key })}
                className={`label whitespace-nowrap link-sweep ${
                  sort === key ? "opacity-100" : "opacity-55"
                }`}
              >
                {SORT_LABELS[key]}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <section className="shell py-14">
        {products.length === 0 ? (
          <EmptyState hasFilters={Boolean(params.rayon || search)} />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                rating={ratings.get(product.id)}
                priority={index < 4}
                index={index}
              />
            ))}
          </div>
        )}
      </section>

      <Marquee
        invert
        items={[
          `Livraison offerte dès ${SHIPPING.freeThreshold / 100} €`,
          "Coupes testées à l'entraînement",
          "Fabriqué à la commande",
          "Paiement sécurisé Stripe",
        ]}
      />
    </>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="hairline hairline-b flex flex-col items-center gap-6 py-28 text-center">
      <p className="display-lg">
        {hasFilters ? "Aucun résultat" : "Collection en préparation"}
      </p>
      <p className="max-w-[46ch] text-sm text-[color:var(--color-smoke)]">
        {hasFilters
          ? "Rien ne correspond à cette recherche pour le moment. Essayez un autre rayon."
          : "Les premières pièces arrivent. Laissez votre adresse pour être prévenu du lancement."}
      </p>
      <Link href={hasFilters ? "/boutique" : "/"} className="btn btn-outline btn-sm">
        {hasFilters ? "Voir tout l'équipement" : "Retour à l'accueil"}
      </Link>
    </div>
  );
}
