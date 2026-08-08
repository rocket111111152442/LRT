import { getGoogleReviews } from "@/lib/googleReviews";

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  const full = Math.round(rating);
  return (
    <span className={`inline-flex ${className}`} aria-label={`${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          viewBox="0 0 20 20"
          className="h-5 w-5"
          fill={index < full ? "#FBBC05" : "#E2E8F0"}
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85L10 1.5Z" />
        </svg>
      ))}
    </span>
  );
}

export async function GoogleReviews() {
  const data = await getGoogleReviews();

  if (!data || data.total === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <GoogleLogo />
          Avis Google
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-slate-950">
            {data.rating.toFixed(1).replace(".", ",")}
          </span>
          <span className="text-sm text-slate-500">/ 5</span>
        </div>
        <Stars rating={data.rating} />
        <p className="text-sm text-slate-600">
          Basé sur {data.total} avis Google
        </p>
        {data.url ? (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            <GoogleLogo />
            Voir / laisser un avis
          </a>
        ) : null}
      </div>

      {data.reviews.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.reviews.map((review, index) => (
            <figure
              key={index}
              className="flex h-full flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-sm font-bold text-brand-blue">
                  {(review.author[0] ?? "C").toUpperCase()}
                </span>
                <div className="min-w-0">
                  <figcaption className="truncate text-sm font-semibold text-slate-950">
                    {review.author}
                  </figcaption>
                  <p className="text-xs text-slate-500">{review.relativeTime}</p>
                </div>
              </div>
              <Stars rating={review.rating} className="[&_svg]:h-4 [&_svg]:w-4" />
              <blockquote className="line-clamp-5 text-sm leading-6 text-slate-700">
                {review.text}
              </blockquote>
            </figure>
          ))}
        </div>
      ) : null}
    </div>
  );
}
