import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { Stars } from "@/components/Stars";
import { ReviewForm } from "@/components/ReviewForm";

export const metadata: Metadata = {
  title: "Mes avis",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "En relecture",
  APPROVED: "Publié",
  REJECTED: "Non retenu",
};

type SearchParams = Promise<{ produit?: string; commande?: string }>;

export default async function MesAvisPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser("/compte/avis");
  const params = await searchParams;

  const data = await safeQuery(
    async () => {
      const [reviews, purchases] = await Promise.all([
        prisma.review.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          include: { product: { select: { name: true, slug: true } } },
        }),
        // Pièces achetées et payées : ce sont les seules sur lesquelles un avis
        // peut être déposé.
        prisma.orderItem.findMany({
          where: {
            productId: { not: null },
            order: {
              userId: user.id,
              status: { in: ["PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED"] },
            },
          },
          orderBy: { order: { createdAt: "desc" } },
          select: {
            productId: true,
            productName: true,
            orderId: true,
            order: { select: { number: true, createdAt: true } },
          },
        }),
      ]);

      return { reviews, purchases };
    },
    { reviews: [], purchases: [] },
    "mes avis",
  );

  const reviewedKeys = new Set(
    data.reviews.map((review) => `${review.orderId}:${review.productId}`),
  );

  // Une entrée par couple commande / produit encore sans avis.
  const pending = data.purchases.filter(
    (purchase) =>
      purchase.productId && !reviewedKeys.has(`${purchase.orderId}:${purchase.productId}`),
  );

  const highlighted = params.produit
    ? pending.find(
        (purchase) =>
          purchase.productId === params.produit &&
          (!params.commande || purchase.orderId === params.commande),
      )
    : null;

  return (
    <div className="space-y-14">
      {highlighted && (
        <section className="border border-[color:var(--color-hairline)] p-7">
          <p className="label mb-2 text-[color:var(--color-smoke)]">
            (Commande {highlighted.order.number})
          </p>
          <h2 className="display-lg mb-8">{highlighted.productName}</h2>

          <ReviewForm
            productId={highlighted.productId as string}
            productName={highlighted.productName}
            orderId={highlighted.orderId}
          />
        </section>
      )}

      {pending.length > 0 && (
        <section>
          <h2 className="display-lg mb-6">À commenter</h2>
          <p className="mb-7 max-w-[52ch] text-sm text-[color:var(--color-smoke)]">
            Vous avez reçu ces pièces. Un avis prend deux minutes et aide
            réellement les prochains acheteurs.
          </p>

          <div className="hairline">
            {pending.map((purchase) => (
              <div
                key={`${purchase.orderId}-${purchase.productId}`}
                className="hairline-b flex flex-wrap items-center justify-between gap-4 py-5"
              >
                <div>
                  <p className="text-sm font-medium">{purchase.productName}</p>
                  <p className="label-sm mt-2 text-[color:var(--color-smoke)]">
                    Commande {purchase.order.number} —{" "}
                    {purchase.order.createdAt.toLocaleDateString("fr-FR")}
                  </p>
                </div>

                <Link
                  href={`/compte/avis?produit=${purchase.productId}&commande=${purchase.orderId}`}
                  className="btn btn-outline btn-sm"
                >
                  Écrire un avis
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="display-lg mb-7">Mes avis publiés</h2>

        {data.reviews.length === 0 ? (
          <p className="text-sm text-[color:var(--color-smoke)]">
            Vous n&apos;avez pas encore déposé d&apos;avis.
          </p>
        ) : (
          <div className="hairline">
            {data.reviews.map((review) => (
              <article key={review.id} className="hairline-b py-6">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={`/produit/${review.product.slug}`}
                    className="text-sm font-medium link-underline"
                  >
                    {review.product.name}
                  </Link>
                  <span className="tag">{STATUS_LABEL[review.status] ?? review.status}</span>
                </div>

                <Stars rating={review.rating} size={12} />

                {review.title && <p className="mt-3 text-sm font-medium">{review.title}</p>}

                <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
                  {review.body}
                </p>

                <p className="label-sm mt-3 text-[color:var(--color-smoke)]">
                  {review.createdAt.toLocaleDateString("fr-FR")}
                </p>

                {review.reply && (
                  <div className="mt-4 border-l border-[color:var(--color-ink)] pl-4">
                    <p className="label-sm mb-1">Réponse de DRIP</p>
                    <p className="text-sm">{review.reply}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
