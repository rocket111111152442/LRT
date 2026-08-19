import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Marquee } from "@/components/Marquee";
import {
  AUDIENCE_LABELS,
  SORT_LABELS,
  getRatingsFor,
  listAudiences,
  listCategories,
  listProducts,
  parseAudience,
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
  pour?: string;
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
  const audience = parseAudience(params.pour);
  const search = params.q?.trim() || undefined;

  const [{ products, total }, categories, publics] = await Promise.all([
    listProducts({ category: params.rayon, audience, sort, search }),
    listCategories(),
    listAudiences(),
  ]);

  // Le choix homme/femme n'apparaît que si le catalogue distingue vraiment les
  // deux : sur une boutique entièrement unisexe, il n'aurait rien à filtrer.
  const publicsUtiles = publics.filter((valeur) => valeur !== "UNISEXE");

  const ratings = await getRatingsFor(products.map((product) => product.id));
  const activeCategory = categories.find(
    (category) => category.slug === params.rayon,
  );

  /** Conserve les filtres en place quand on n'en change qu'un seul. */
  const buildHref = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = {
      rayon: params.rayon,
      pour: params.pour,
      tri: params.tri,
      q: search,
      ...patch,
    };

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

      {/* Filtres. Ils ne suivent plus le défilement : la barre translucide
          restait plaquée par-dessus les visuels et brouillait la grille. */}
      <div className="shell">
        <div className="hairline hairline-b space-y-3 py-5">
          <FiltreLigne titre="Rayon">
            <FiltreLien href={buildHref({ rayon: undefined })} actif={!params.rayon}>
              Tout
            </FiltreLien>

            {categories.map((category) => (
              <FiltreLien
                key={category.slug}
                href={buildHref({ rayon: category.slug })}
                actif={params.rayon === category.slug}
              >
                {category.name}
              </FiltreLien>
            ))}
          </FiltreLigne>

          {publicsUtiles.length > 0 && (
            <FiltreLigne titre="Pour">
              <FiltreLien href={buildHref({ pour: undefined })} actif={!audience}>
                Tout le monde
              </FiltreLien>

              {(["HOMME", "FEMME", "ENFANT", "UNISEXE"] as const)
                .filter((valeur) => publics.includes(valeur))
                .map((valeur) => (
                  <FiltreLien
                    key={valeur}
                    href={buildHref({ pour: valeur.toLowerCase() })}
                    actif={audience === valeur}
                  >
                    {AUDIENCE_LABELS[valeur]}
                  </FiltreLien>
                ))}
            </FiltreLigne>
          )}

          <FiltreLigne titre="Trier">
            {(Object.keys(SORT_LABELS) as (keyof typeof SORT_LABELS)[]).map((key) => (
              <FiltreLien key={key} href={buildHref({ tri: key })} actif={sort === key}>
                {SORT_LABELS[key]}
              </FiltreLien>
            ))}
          </FiltreLigne>
        </div>
      </div>

      <section className="shell py-14">
        {products.length === 0 ? (
          <EmptyState hasFilters={Boolean(params.rayon || audience || search)} />
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

/** Une ligne de filtres : son intitulé à gauche, les choix à droite. */
function FiltreLigne({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-x-5">
      <span className="label-sm w-14 shrink-0 text-[color:var(--color-smoke)]">
        {titre}
      </span>

      {/* Sur téléphone les choix défilent sur une ligne au lieu de retomber
          en pavé de trois rangs : le bloc de filtres reste lisible d'un coup
          d'œil et ne repousse pas les pièces sous la ligne de flottaison. */}
      <div className="flex items-baseline gap-x-5 gap-y-2 overflow-x-auto no-scrollbar md:flex-wrap md:overflow-visible">
        {children}
      </div>
    </div>
  );
}

function FiltreLien({
  href,
  actif,
  children,
}: {
  href: string;
  actif: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={actif ? "true" : undefined}
      className={`label whitespace-nowrap link-sweep ${
        actif ? "opacity-100" : "opacity-50 hover:opacity-100"
      }`}
    >
      {children}
    </Link>
  );
}
