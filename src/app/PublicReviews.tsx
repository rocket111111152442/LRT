"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function truncate(text: string, max = 160) {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "").trimEnd() + " …";
}

type PublicReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
};

function StarRow({
  rating,
  size = "h-4 w-4",
}: {
  rating: number;
  size?: string;
}) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex" aria-label={`${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          viewBox="0 0 20 20"
          className={size}
          fill={index < full ? "#F59E0B" : "#E2E8F0"}
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85L10 1.5Z" />
        </svg>
      ))}
    </span>
  );
}

export function PublicReviews({ displayOnly = false }: { displayOnly?: boolean }) {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [expanded, setExpanded] = useState<PublicReview | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollByCards(direction: -1 | 1) {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollBy({
      left: direction * Math.min(element.clientWidth * 0.9, 340),
      behavior: "smooth",
    });
  }

  useEffect(() => {
    let ignore = false;

    async function loadReviews() {
      try {
        const response = await fetch("/api/public-reviews");
        const payload = await response.json();

        if (!ignore) {
          setReviews(Array.isArray(payload.reviews) ? payload.reviews : []);
        }
      } catch {
        if (!ignore) {
          setError("Les avis publics n'ont pas pu charger.");
        }
      }
    }

    void loadReviews();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/public-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating: Number(rating), comment }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Avis impossible a enregistrer.");
        return;
      }

      setReviews((current) => [payload.review, ...current]);
      setName("");
      setRating("5");
      setComment("");
      setMessage("Merci, votre avis public est enregistre.");
    } catch {
      setError("Avis impossible a enregistrer.");
    } finally {
      setIsSaving(false);
    }
  }

  if (displayOnly && reviews.length === 0) {
    return null;
  }

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
        reviews.length
      : 0;

  return (
    <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Avis clients
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Ce que les utilisateurs pensent de Qoravo
          </h2>
        </div>
        {reviews.length > 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-3xl font-extrabold text-slate-950">
              {average.toFixed(1).replace(".", ",")}
            </span>
            <div className="grid gap-1">
              <StarRow rating={average} size="h-5 w-5" />
              <span className="text-xs font-medium text-slate-500">
                {reviews.length} avis
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {reviews.length > 0 ? (
        <div className="relative">
          {reviews.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                aria-label="Avis précédents"
                className="absolute left-0 top-1/2 z-10 hidden -translate-x-1 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 shadow-md transition hover:bg-slate-50 sm:block"
              >
                <ChevronLeft className="h-5 w-5 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCards(1)}
                aria-label="Avis suivants"
                className="absolute right-0 top-1/2 z-10 hidden translate-x-1 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 shadow-md transition hover:bg-slate-50 sm:block"
              >
                <ChevronRight className="h-5 w-5 text-slate-700" />
              </button>
            </>
          ) : null}

          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {reviews.map((review) => {
              const isLong = review.comment.length > 160;
              return (
                <button
                  key={review.id}
                  type="button"
                  onClick={() => setExpanded(review)}
                  className="flex min-w-[260px] max-w-[300px] shrink-0 snap-start flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-sky-300 hover:bg-white"
                >
                  <StarRow rating={review.rating} />
                  <p className="text-sm leading-6 text-slate-700">
                    {truncate(review.comment)}
                    {isLong ? (
                      <span className="font-semibold text-sky-700"> Lire</span>
                    ) : null}
                  </p>
                  <p className="mt-auto text-sm font-semibold text-slate-950">
                    {review.name}
                  </p>
                </button>
              );
            })}
          </div>

          {displayOnly ? (
            <div className="mt-4 text-center">
              <Link
                href="/avis"
                className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 underline-offset-4 hover:underline"
              >
                Voir tous les avis
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-sky-200 bg-sky-50/60 p-4 text-sm text-slate-700">
          Vous utilisez Qoravo ? Partagez votre expérience ci-dessous — soyez le
          premier à laisser un avis public.
        </p>
      )}

      {expanded ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4"
          onClick={() => setExpanded(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <StarRow rating={expanded.rating} size="h-5 w-5" />
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {expanded.comment}
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-950">
              {expanded.name}
            </p>
            <button
              type="button"
              onClick={() => setExpanded(null)}
              className="mt-5 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Fermer
            </button>
          </div>
        </div>
      ) : null}

      {!displayOnly ? <form onSubmit={handleSubmit} className="grid gap-3 border-t border-slate-200 pt-4">
        <h3 className="text-base font-semibold text-slate-950">
          Laisser un avis public
        </h3>
        <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Votre nom"
            className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          />
          <select
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="5">5 etoiles</option>
            <option value="4">4 etoiles</option>
            <option value="3">3 etoiles</option>
            <option value="2">2 etoiles</option>
            <option value="1">1 etoile</option>
          </select>
        </div>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Votre avis"
          rows={3}
          className="min-h-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
        />
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={isSaving}
          className="w-fit rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSaving ? "Envoi..." : "Publier l'avis"}
        </button>
      </form> : null}
    </section>
  );
}
