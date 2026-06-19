"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type ReviewRepair = {
  ticketNumber: string | null;
  firstName: string;
  lastName: string;
  deviceType: string;
  brand: string;
  model: string;
  reviewRespondedAt: string | null;
  satisfactionRating: number | null;
  satisfactionComment: string | null;
};

type ReviewClientProps = {
  token: string;
};

export function ReviewClient({ token }: ReviewClientProps) {
  const [repair, setRepair] = useState<ReviewRepair | null>(null);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadReview = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/review/${token}`);
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Lien d'avis introuvable.");
        return;
      }

      setRepair(payload.repair);
    } catch {
      setError("Chargement impossible.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadReview();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadReview]);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/review/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: Number(rating), comment }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Avis impossible a enregistrer.");
        return;
      }

      setRepair(payload.repair);
      setMessage("Merci, votre avis a bien ete enregistre.");
    } catch {
      setError("Avis impossible a enregistrer.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        Chargement...
      </div>
    );
  }

  if (!repair) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error || "Lien d'avis introuvable."}
      </p>
    );
  }

  const alreadyAnswered = Boolean(repair.reviewRespondedAt || repair.satisfactionRating);

  return (
    <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-2">
        <p className="text-sm text-slate-600">
          Ticket {repair.ticketNumber ?? "-"}
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">
          {repair.deviceType} {repair.brand} {repair.model}
        </h2>
        <p className="text-sm text-slate-700">
          Client : {repair.firstName} {repair.lastName}
        </p>
      </div>

      {alreadyAnswered ? (
        <div className="grid gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p className="font-semibold">Votre avis est deja enregistre.</p>
          <p>Note : {repair.satisfactionRating ?? "-"}/5</p>
          {repair.satisfactionComment ? <p>{repair.satisfactionComment}</p> : null}
        </div>
      ) : (
        <form onSubmit={submitReview} className="grid gap-4">
          <label htmlFor="review-rating" className="grid gap-2 text-sm font-medium text-slate-800">
            Note
            <select
              id="review-rating"
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Tres bien</option>
              <option value="3">3 - Correct</option>
              <option value="2">2 - Moyen</option>
              <option value="1">1 - Mauvais</option>
            </select>
          </label>
          <label htmlFor="review-comment" className="grid gap-2 text-sm font-medium text-slate-800">
            Commentaire optionnel
            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={5}
              maxLength={1000}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            />
          </label>
          <button
            type="submit"
            disabled={isSaving}
            className="min-h-11 rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving ? "Enregistrement..." : "Envoyer mon avis"}
          </button>
        </form>
      )}

      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}
    </section>
  );
}
