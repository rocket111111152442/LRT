"use client";

import { FormEvent, useEffect, useState } from "react";

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

      <div className="grid gap-3 md:grid-cols-3">
        {reviews.slice(0, 6).map((review) => (
          <article
            key={review.id}
            className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <StarRow rating={review.rating} />
            <p className="text-sm leading-6 text-slate-700">{review.comment}</p>
            <p className="text-sm font-semibold text-slate-950">{review.name}</p>
          </article>
        ))}
        {reviews.length === 0 ? (
          <p className="rounded-xl border border-dashed border-sky-200 bg-sky-50/60 p-4 text-sm text-slate-700 md:col-span-3">
            Vous utilisez Qoravo ? Partagez votre expérience ci-dessous — soyez le
            premier à laisser un avis public.
          </p>
        ) : null}
      </div>

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
