import Link from "next/link";
import type { Metadata } from "next";
import { HeroHome } from "@/components/HeroHome";
import { Marquee } from "@/components/Marquee";
import { ProductCard } from "@/components/ProductCard";
import { ReviewsMarquee } from "@/components/ReviewsMarquee";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Stars } from "@/components/Stars";
import {
  countActiveProducts,
  getFeaturedProducts,
  getGlobalRating,
  getLatestReviews,
  getRatingsFor,
  listCategories,
} from "@/lib/catalog";
import { SHIPPING, RETURN_WINDOW_DAYS } from "@/lib/shop";
import { formatPriceSmart } from "@/lib/money";

export const metadata: Metadata = {
  description:
    "NATURAL BRUTAL — vêtements pour les sports de combat et la salle. Fabriqués à la commande, livraison offerte dès 80 €.",
};

// La page se régénère toutes les 5 minutes : le catalogue reste frais sans
// solliciter la base à chaque visite.
export const revalidate = 300;

const SEASON = "Collection 01";

const PILLARS = [
  {
    index: "01",
    title: "Pour s'entraîner",
    body: "Du matériel de sport, pas du streetwear déguisé. Ça se porte au sol, au sac, à la salle.",
  },
  {
    index: "02",
    title: "Fabriqué à la commande",
    body: "Rien n'est produit d'avance : deux à cinq jours entre la commande et l'expédition. Aucun invendu à détruire, rien de fabriqué ni de pollué pour rien.",
  },
  {
    index: "03",
    title: "Une petite structure",
    body: "On est deux. Pas de service client externalisé : quand vous écrivez, c'est l'un de nous qui lit et qui répond.",
  },
];

export default async function HomePage() {
  const [featured, reviews, globalRating, categories, productCount] =
    await Promise.all([
      getFeaturedProducts(8),
      getLatestReviews(10),
      getGlobalRating(),
      listCategories(),
      countActiveProducts(),
    ]);

  const ratings = await getRatingsFor(featured.map((product) => product.id));

  return (
    <>
      <HeroHome season={SEASON} productCount={productCount} />

      <Marquee
        invert
        fast
        items={[
          "Nouvelle série disponible",
          `Livraison offerte dès ${SHIPPING.freeThreshold / 100} €`,
          "Fabriqué à la commande",
          `Retours ${RETURN_WINDOW_DAYS} jours`,
          "Paiement sécurisé",
        ]}
      />

      {/* --- Manifeste ------------------------------------------------ */}
      <section className="section shell">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-24">
          <div>
            <p className="label reveal mb-8 text-[color:var(--color-smoke)]">
              (Manifeste)
            </p>

            <h2 className="display-xl max-w-[13ch]">
              {["Tout", "se gagne", "à", "l'entraînement."].map(
                (line, index) => (
                  <span
                    key={line}
                    className="reveal-mask"
                    style={{ ["--reveal-delay" as string]: `${index * 90}ms` }}
                  >
                    <span>{line}</span>
                  </span>
                ),
              )}
            </h2>
          </div>

          <div className="flex flex-col justify-end gap-8">
            <p className="reveal max-w-[46ch] text-pretty text-base leading-relaxed text-[color:var(--color-ink-soft)]">
              On fait des vêtements pour les sports de combat et pour la
              salle. Des pièces qu&apos;on enfile trois fois par semaine, qui
              partent à la machine derrière, et qu&apos;on remet le lendemain.
            </p>

            <p
              className="reveal max-w-[46ch] text-pretty text-base leading-relaxed text-[color:var(--color-smoke)]"
              style={{ ["--reveal-delay" as string]: "120ms" }}
            >
              Le nom résume ce qu&apos;on cherche : des matières franches, des
              coupes qui laissent passer le mouvement, et de quoi encaisser
              l&apos;entraînement sans y laisser une couture.
            </p>

            <Link
              href="/histoire"
              className="reveal label link-sweep self-start"
              style={{ ["--reveal-delay" as string]: "240ms" }}
            >
              Lire la suite →
            </Link>
          </div>
        </div>
      </section>

      {/* --- Sélection ------------------------------------------------ */}
      <section className="section hairline">
        <div className="shell">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label reveal mb-4 text-[color:var(--color-smoke)]">
                (L&apos;équipement)
              </p>
              <h2 className="display-lg reveal-mask">
                <span>L&apos;équipement</span>
              </h2>
            </div>

            <Link href="/boutique" className="btn btn-outline btn-sm reveal">
              Tout voir
            </Link>
          </div>

          {featured.length === 0 ? (
            <EmptyCatalog />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {featured.map((product, index) => (
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
        </div>
      </section>

      {/* --- Piliers -------------------------------------------------- */}
      <section className="invert-block section">
        <div className="shell">
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((pillar, index) => (
              <article
                key={pillar.index}
                className="reveal flex flex-col gap-5 border-t border-[color:var(--color-hairline-invert)] pt-8 lg:border-r lg:pr-10 lg:last:border-r-0"
                style={{ ["--reveal-delay" as string]: `${index * 120}ms` }}
              >
                <span className="display text-[3.5rem] leading-none opacity-25">
                  {pillar.index}
                </span>
                <h3 className="display-lg max-w-[12ch] text-[clamp(1.4rem,2.4vw,2rem)]">
                  {pillar.title}
                </h3>
                <p className="max-w-[38ch] text-sm leading-relaxed text-[color:var(--color-ash)]">
                  {pillar.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --- Catégories ----------------------------------------------- */}
      {categories.length > 0 && (
        <section className="section shell">
          <p className="label reveal mb-10 text-[color:var(--color-smoke)]">
            (Rayons)
          </p>

          <div className="flex flex-col">
            {categories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/boutique?rayon=${category.slug}`}
                className="group hairline-b flex items-center justify-between gap-6 py-7 first:border-t first:border-[color:var(--color-hairline)]"
              >
                <span className="flex items-baseline gap-6">
                  <span className="label-sm text-[color:var(--color-smoke)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="display-lg transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
                    {category.name}
                  </span>
                </span>

                <span className="flex items-center gap-6">
                  <span className="label-sm hidden text-[color:var(--color-smoke)] sm:block">
                    {category._count.products} pièce
                    {category._count.products > 1 ? "s" : ""}
                  </span>
                  <span className="text-xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* --- Avis ----------------------------------------------------- */}
      {reviews.length > 0 && (
        <section className="section hairline overflow-hidden">
          <div className="shell mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label reveal mb-4 text-[color:var(--color-smoke)]">
                (Ils s&apos;entraînent avec)
              </p>
              <h2 className="display-lg reveal-mask">
                <span>Le retour du terrain</span>
              </h2>
            </div>

            {globalRating.count > 0 && (
              <div className="reveal flex items-center gap-4">
                <Stars rating={globalRating.average} size={16} />
                <span className="label">
                  {globalRating.average.toFixed(1)} / 5 — {globalRating.count} avis
                </span>
              </div>
            )}
          </div>

          <ReviewsMarquee reviews={reviews} />

          <div className="shell mt-12">
            <Link href="/avis" className="btn btn-outline btn-sm reveal">
              Lire tous les avis
            </Link>
          </div>
        </section>
      )}

      {/* --- Newsletter ----------------------------------------------- */}
      <section className="invert-block section">
        <div className="shell grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <h2 className="display-xl max-w-[14ch]">
              <span className="reveal-mask">
                <span>Nouvelles</span>
              </span>
              <span
                className="reveal-mask"
                style={{ ["--reveal-delay" as string]: "90ms" }}
              >
                <span>pièces.</span>
              </span>
            </h2>

            <p className="reveal mt-8 max-w-[44ch] text-sm leading-relaxed text-[color:var(--color-ash)]">
              Un message quand une pièce sort. Rien entre deux.
            </p>
          </div>

          <div className="reveal w-full max-w-md">
            <NewsletterForm source="accueil" />
            <p className="label-sm mt-4 text-[color:var(--color-smoke)]">
              Désinscription en un clic. Aucune revente de données.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function EmptyCatalog() {
  return (
    <div className="hairline hairline-b flex flex-col items-center gap-5 py-24 text-center">
      <p className="display-lg">Collection en préparation</p>
      <p className="max-w-[44ch] text-sm text-[color:var(--color-smoke)]">
        Les premières pièces arrivent. Synchronisez votre boutique Printify
        depuis l&apos;administration, ou ajoutez un produit à la main pour le
        voir apparaître ici.
      </p>
      <p className="label-sm text-[color:var(--color-smoke)]">
        Prix indicatif de lancement : {formatPriceSmart(3900)}
      </p>
    </div>
  );
}
