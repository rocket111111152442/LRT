import type { Metadata } from "next";
import Link from "next/link";
import { Stars } from "@/components/Stars";
import { PageHeader } from "@/components/PageHeader";
import { prisma, safeQuery } from "@/lib/prisma";
import { getGlobalRating } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Avis clients",
  description:
    "Tous les avis vérifiés des clients NATURAL BRUTAL : notes, retours sur la coupe, la matière et la tenue à l'entraînement.",
};

export const revalidate = 600;

export default async function AvisPage() {
  const [rating, reviews] = await Promise.all([
    getGlobalRating(),
    safeQuery(
      () =>
        prisma.review.findMany({
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          take: 60,
          select: {
            id: true,
            authorName: true,
            rating: true,
            title: true,
            body: true,
            createdAt: true,
            verifiedPurchase: true,
            reply: true,
            product: { select: { name: true, slug: true } },
          },
        }),
      [],
      "avis publics",
    ),
  ]);

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Avis vérifiés"
        title="Ce qu'on nous dit"
        intro="Seules les personnes ayant réellement commandé peuvent déposer un avis. Chaque texte est relu avant publication, mais jamais réécrit : les retours mitigés restent en ligne."
      />

      {rating.count > 0 && (
        <section className="shell pb-16">
          <div className="hairline grid gap-10 pt-10 sm:grid-cols-[auto_1fr] sm:gap-16">
            <div className="reveal">
              <p className="display text-[5rem] leading-none">{rating.average.toFixed(1)}</p>
              <Stars rating={rating.average} size={16} className="mt-4" />
              <p className="label-sm mt-4 text-[color:var(--color-smoke)]">
                {rating.count} avis publiés
              </p>
            </div>

            <div className="reveal max-w-md space-y-2 self-center">
              {breakdown.map((row) => {
                const percent = reviews.length > 0 ? (row.count / reviews.length) * 100 : 0;

                return (
                  <div key={row.star} className="flex items-center gap-4">
                    <span className="label-sm w-7 shrink-0 text-[color:var(--color-smoke)]">
                      {row.star}★
                    </span>
                    <span className="h-px flex-1 bg-[color:var(--color-ash)]">
                      <span
                        className="block h-px bg-[color:var(--color-ink)]"
                        style={{ width: `${percent}%` }}
                      />
                    </span>
                    <span className="label-sm w-8 shrink-0 text-right text-[color:var(--color-smoke)]">
                      {row.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="shell pb-24">
        {reviews.length === 0 ? (
          <div className="hairline hairline-b flex flex-col items-start gap-5 py-20">
            <p className="display-lg">Pas encore d&apos;avis</p>
            <p className="max-w-[52ch] text-sm text-[color:var(--color-smoke)]">
              Les premiers retours arriveront après les premières livraisons. Ils
              seront tous affichés ici, sans tri sélectif.
            </p>
            <Link href="/boutique" className="btn btn-outline btn-sm">
              Voir la collection
            </Link>
          </div>
        ) : (
          <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
            {reviews.map((review, index) => (
              <article
                key={review.id}
                className="reveal mb-6 break-inside-avoid border border-[color:var(--color-hairline)] p-6"
                style={{ ["--reveal-delay" as string]: `${(index % 3) * 80}ms` }}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
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

                {review.title && <h2 className="mb-2 text-sm font-medium">{review.title}</h2>}

                <p className="text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
                  {review.body}
                </p>

                <footer className="mt-5 flex flex-wrap items-center justify-between gap-2">
                  <span className="label-sm text-[color:var(--color-smoke)]">
                    {review.authorName}
                    {review.verifiedPurchase && " — achat vérifié"}
                  </span>

                  {review.product && (
                    <Link
                      href={`/produit/${review.product.slug}`}
                      className="label-sm link-sweep"
                    >
                      {review.product.name}
                    </Link>
                  )}
                </footer>

                {review.reply && (
                  <div className="mt-5 border-l border-[color:var(--color-ink)] pl-4">
                    <p className="label-sm mb-1">Réponse de l&apos;atelier</p>
                    <p className="text-sm text-[color:var(--color-ink-soft)]">{review.reply}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
