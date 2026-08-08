"use client";

import { FormEvent, useEffect, useState } from "react";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string;
};

export function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState("");

  const [name, setName] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/moderateur/reviews", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/moderateur/login";
        return;
      }
      const payload = await res.json();
      setReviews(Array.isArray(payload.reviews) ? payload.reviews : []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function sendPrompt() {
    setSending(true);
    setSendMsg("");
    try {
      const res = await fetch("/api/moderateur/review-prompt", { method: "POST" });
      if (!res.ok) throw new Error("failed");
      setSendMsg(
        "Pop d'avis envoyée. Elle s'affichera pour chaque atelier à sa prochaine visite de l'espace admin.",
      );
    } catch {
      setSendMsg("Envoi impossible. Réessayez.");
    } finally {
      setSending(false);
    }
  }

  async function addReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/moderateur/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating: Number(rating), comment }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Ajout impossible.");
        return;
      }
      setReviews((current) => [payload.review, ...current]);
      setName("");
      setRating("5");
      setComment("");
    } catch {
      setError("Ajout impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteReview(id: string) {
    const previous = reviews;
    setReviews((current) => current.filter((review) => review.id !== id));
    try {
      const res = await fetch(`/api/moderateur/reviews?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      setReviews(previous); // rollback en cas d'échec
    }
  }

  return (
    <div className="grid gap-6">
      {/* Envoi manuel de la pop d'avis */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-base font-semibold text-white">Demander des avis</h3>
        <p className="mt-1 text-sm text-slate-400">
          Envoie une pop à tous les ateliers : elle leur demandera de laisser un
          avis sur Qoravo à leur prochaine connexion à l&apos;espace admin.
          (Automatique tous les 7 jours en plus de cet envoi manuel.)
        </p>
        <button
          type="button"
          onClick={sendPrompt}
          disabled={sending}
          className="mt-4 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {sending ? "Envoi..." : "Envoyer la pop d'avis maintenant"}
        </button>
        {sendMsg ? <p className="mt-3 text-sm text-emerald-300">{sendMsg}</p> : null}
      </section>

      {/* Ajout manuel d'un avis */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-base font-semibold text-white">Ajouter un avis</h3>
        <p className="mt-1 text-sm text-slate-400">
          Ajoute un avis qui apparaîtra sur la page publique. À n&apos;utiliser que
          pour de vrais retours (ex. transmis par téléphone).
        </p>
        <form onSubmit={addReview} className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nom"
              className="min-h-11 rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-blue"
            />
            <select
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              className="min-h-11 rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-blue"
            >
              <option value="5">5 étoiles</option>
              <option value="4">4 étoiles</option>
              <option value="3">3 étoiles</option>
              <option value="2">2 étoiles</option>
              <option value="1">1 étoile</option>
            </select>
          </div>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Commentaire"
            rows={3}
            className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-blue"
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <button
            type="submit"
            disabled={saving}
            className="w-fit rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:opacity-50"
          >
            {saving ? "Ajout..." : "Ajouter l'avis"}
          </button>
        </form>
      </section>

      {/* Liste des avis */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-base font-semibold text-white">
          Avis publiés ({reviews.length})
        </h3>
        {loading ? (
          <p className="mt-3 text-sm text-slate-400">Chargement...</p>
        ) : reviews.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">Aucun avis pour le moment.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-white/10 bg-slate-900 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-300">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </p>
                  <p className="mt-1 text-sm text-slate-200">{review.comment}</p>
                  <p className="mt-1 text-xs text-slate-400">{review.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteReview(review.id)}
                  className="shrink-0 rounded-md border border-red-400/30 px-2 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
