import { Stars } from "@/components/Stars";

type ReviewItem = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string;
  verifiedPurchase: boolean;
  product: { name: string; slug: string } | null;
};

/**
 * Fresque d'avis qui défile en continu. Deux pistes en sens inverse : le regard
 * accroche, et l'ensemble reste lisible même sans interaction.
 */
export function ReviewsMarquee({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) return null;

  const half = Math.ceil(reviews.length / 2);
  const rows = [reviews.slice(0, half), reviews.slice(half)].filter(
    (row) => row.length > 0,
  );

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`marquee ${rowIndex % 2 === 1 ? "marquee--reverse" : ""}`}
        >
          {[0, 1].map((copy) => (
            <div className="marquee__track !gap-4 !pr-4" key={copy} aria-hidden={copy === 1}>
              {row.map((review) => (
                <figure
                  key={`${copy}-${review.id}`}
                  className="flex w-[320px] shrink-0 flex-col justify-between border border-[color:var(--color-hairline)] bg-[color:var(--color-paper-pure)] p-5 sm:w-[380px]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <Stars rating={review.rating} size={12} />
                      {review.verifiedPurchase && (
                        <span className="label-sm text-[color:var(--color-smoke)]">
                          Achat vérifié
                        </span>
                      )}
                    </div>

                    {review.title && (
                      <p className="mt-3 text-sm font-medium">{review.title}</p>
                    )}

                    <blockquote className="mt-2 line-clamp-4 text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
                      « {review.body} »
                    </blockquote>
                  </div>

                  <figcaption className="label-sm mt-4 flex items-center justify-between text-[color:var(--color-smoke)]">
                    <span>{review.authorName}</span>
                    {review.product && <span className="truncate pl-3">{review.product.name}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
