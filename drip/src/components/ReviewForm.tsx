"use client";

import { useActionState, useState } from "react";
import { submitReviewAction } from "@/app/actions/account";
import type { FormState } from "@/app/actions/auth";
import { FormError, FormSuccess, SubmitButton } from "@/components/forms";

const initialState: FormState = {};

export function ReviewForm({
  productId,
  productName,
  orderId,
}: {
  productId: string;
  productName: string;
  orderId?: string;
}) {
  const [state, formAction] = useActionState(submitReviewAction, initialState);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  if (state.success) {
    return <FormSuccess message={state.message} />;
  }

  const displayed = hovered || rating;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="productId" value={productId} />
      {orderId && <input type="hidden" name="orderId" value={orderId} />}
      <input type="hidden" name="rating" value={rating} />

      <FormError message={state.errors?.form} />

      <div>
        <p className="field-label">Votre note *</p>
        <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHovered(value)}
              className="p-1 transition-transform duration-300 hover:scale-110"
              aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
              aria-pressed={rating === value}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill={value <= displayed ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.4"
                className={value <= displayed ? "" : "opacity-30"}
                aria-hidden="true"
              >
                <path d="m12 2.5 2.9 6.3 6.6.8-4.9 4.6 1.3 6.8L12 17.7 6.1 21l1.3-6.8L2.5 9.6l6.6-.8L12 2.5Z" />
              </svg>
            </button>
          ))}
        </div>

        {state.errors?.rating && (
          <p className="label-sm mt-2" role="alert">
            {state.errors.rating}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="review-title" className="field-label">
          Titre
        </label>
        <input
          id="review-title"
          name="title"
          maxLength={120}
          className="field"
          placeholder={`Mon avis sur ${productName}`}
        />
      </div>

      <div>
        <label htmlFor="review-body" className="field-label">
          Votre avis *
        </label>
        <textarea
          id="review-body"
          name="body"
          required
          rows={5}
          maxLength={2000}
          className={`field resize-y ${state.errors?.body ? "field-error" : ""}`}
          placeholder="Coupe, matière, tenue dans le temps… dites ce qui vous a marqué."
        />
        {state.errors?.body && (
          <p className="label-sm mt-2" role="alert">
            {state.errors.body}
          </p>
        )}
      </div>

      <p className="text-xs text-[color:var(--color-smoke)]">
        Votre avis est publié sous votre prénom et l&apos;initiale de votre nom,
        après relecture. Il porte la mention « achat vérifié ».
      </p>

      <SubmitButton className="btn" pendingLabel="Envoi…">
        Publier mon avis
      </SubmitButton>
    </form>
  );
}
