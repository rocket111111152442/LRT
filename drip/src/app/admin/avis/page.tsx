import Link from "next/link";
import { prisma, safeQuery } from "@/lib/prisma";
import { Stars } from "@/components/Stars";
import { moderateReviewAction } from "@/app/actions/admin";
import { ReviewReplyForm } from "@/components/admin/AdminForms";

type SearchParams = Promise<{ statut?: string }>;

const FILTERS = [
  { key: "PENDING", label: "À modérer" },
  { key: "APPROVED", label: "Publiés" },
  { key: "REJECTED", label: "Refusés" },
] as const;

export default async function AdminAvisPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filter = FILTERS.some((item) => item.key === params.statut)
    ? (params.statut as "PENDING" | "APPROVED" | "REJECTED")
    : "PENDING";

  const data = await safeQuery(
    async () => {
      const [reviews, counts] = await Promise.all([
        prisma.review.findMany({
          where: { status: filter },
          orderBy: { createdAt: "desc" },
          take: 100,
          include: {
            product: { select: { name: true, slug: true } },
            user: { select: { email: true } },
          },
        }),
        prisma.review.groupBy({ by: ["status"], _count: true }),
      ]);

      return { reviews, counts };
    },
    { reviews: [], counts: [] },
    "modération des avis",
  );

  const countFor = (status: string) =>
    data.counts.find((row) => row.status === status)?._count ?? 0;

  return (
    <div className="space-y-10">
      <header>
        <p className="label mb-4 text-[color:var(--color-smoke)]">(Modération)</p>
        <h1 className="display-xl">Avis clients</h1>
        <p className="mt-3 max-w-[62ch] text-sm text-[color:var(--color-smoke)]">
          Un avis n&apos;est publié qu&apos;après validation. Refusez ce qui est
          injurieux ou hors sujet, mais laissez passer les critiques : une page
          d&apos;avis uniquement élogieuse n&apos;est crédible pour personne.
        </p>
      </header>

      <nav className="flex flex-wrap gap-5" aria-label="Filtrer les avis">
        {FILTERS.map((item) => (
          <Link
            key={item.key}
            href={`/admin/avis?statut=${item.key}`}
            className={`label link-sweep ${filter === item.key ? "opacity-100" : "opacity-50"}`}
          >
            {item.label} ({countFor(item.key)})
          </Link>
        ))}
      </nav>

      {data.reviews.length === 0 ? (
        <p className="hairline py-16 text-sm text-[color:var(--color-smoke)]">
          Aucun avis dans cette vue.
        </p>
      ) : (
        <div className="space-y-px">
          {data.reviews.map((review) => (
            <article
              key={review.id}
              className="border-t border-[color:var(--color-hairline)] py-6 last:border-b"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <Stars rating={review.rating} size={13} />
                  <Link
                    href={`/produit/${review.product.slug}`}
                    className="label-sm link-sweep"
                  >
                    {review.product.name}
                  </Link>
                </div>

                <span className="label-sm text-[color:var(--color-smoke)]">
                  {review.createdAt.toLocaleDateString("fr-FR")}
                </span>
              </div>

              {review.title && <h2 className="mb-2 text-sm font-medium">{review.title}</h2>}

              <p className="max-w-[80ch] text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
                {review.body}
              </p>

              <p className="label-sm mt-3 text-[color:var(--color-smoke)]">
                {review.authorName}
                {review.user && ` — ${review.user.email}`}
                {review.verifiedPurchase && " — achat vérifié"}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                {review.status !== "APPROVED" && (
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input type="hidden" name="decision" value="APPROVED" />
                    <button type="submit" className="btn btn-sm">
                      Publier
                    </button>
                  </form>
                )}

                {review.status !== "REJECTED" && (
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input type="hidden" name="decision" value="REJECTED" />
                    <button type="submit" className="btn btn-outline btn-sm">
                      Refuser
                    </button>
                  </form>
                )}

                {review.status !== "PENDING" && (
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input type="hidden" name="decision" value="PENDING" />
                    <button type="submit" className="label-sm link-sweep">
                      Remettre en attente
                    </button>
                  </form>
                )}

                <ReviewReplyForm reviewId={review.id} reply={review.reply} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
