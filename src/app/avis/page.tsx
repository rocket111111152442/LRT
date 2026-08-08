import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QoravoLogo } from "@/components/QoravoLogo";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Avis clients — Qoravo",
  description:
    "Tous les avis des utilisateurs de Qoravo, le logiciel de gestion pour réparateurs.",
};

export const dynamic = "force-dynamic";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
};

function Stars({ rating, size = "h-5 w-5" }: { rating: number; size?: string }) {
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

async function loadReviews(): Promise<Review[]> {
  try {
    const reviews = await prisma.publicReview.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, name: true, rating: true, comment: true },
    });
    return reviews;
  } catch {
    return [];
  }
}

export default async function AvisPage() {
  const reviews = await loadReviews();
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
        reviews.length
      : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <QoravoLogo />
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            Avis clients
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Ce que les utilisateurs pensent de Qoravo
          </h1>
          {reviews.length > 0 ? (
            <div className="mt-4 inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
              <span className="text-3xl font-extrabold text-slate-950">
                {average.toFixed(1).replace(".", ",")}
              </span>
              <div className="grid gap-1 text-left">
                <Stars rating={average} />
                <span className="text-xs font-medium text-slate-500">
                  {reviews.length} avis
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {reviews.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            Aucun avis pour le moment.
          </p>
        ) : (
          <div className="mt-10 grid gap-4">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-bold text-slate-950">
                    {review.name}
                  </p>
                  <Stars rating={review.rating} size="h-4 w-4" />
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {review.comment}
                </p>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Vous utilisez Qoravo ?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Votre avis aide d&apos;autres réparateurs à se décider. Merci de
            partager votre expérience.
          </p>
          <Link
            href="/#faq"
            className="mt-4 inline-flex rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
