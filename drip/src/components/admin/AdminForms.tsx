"use client";

import { useActionState, useState } from "react";
import {
  addProductImageAction,
  createCategoryAction,
  createCouponAction,
  pushOrderToPrintfulAction,
  replyToReviewAction,
  syncPrintfulAction,
  updateOrderAction,
  updateProductAction,
} from "@/app/actions/admin";
import type { FormState } from "@/app/actions/auth";
import { Field, FormError, FormSuccess, SubmitButton } from "@/components/forms";

const initialState: FormState = {};

export function PrintfulSyncButton() {
  const [state, formAction] = useActionState(syncPrintfulAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <SubmitButton className="btn btn-sm" pendingLabel="Synchronisation…">
        Synchroniser Printful
      </SubmitButton>

      {state.success && <FormSuccess message={state.message} />}
      <FormError message={state.errors?.form} />
    </form>
  );
}

export function ProductAdminForm({
  product,
  categories,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    subtitle: string | null;
    description: string;
    composition: string | null;
    badge: string | null;
    basePrice: number;
    compareAtPrice: number | null;
    categoryId: string | null;
    position: number;
    seoTitle: string | null;
    seoDescription: string | null;
  };
  categories: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(updateProductAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={product.id} />

      {state.success && <FormSuccess message={state.message} />}
      <FormError message={state.errors?.form} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom" name="name" required defaultValue={product.name} error={state.errors?.name} />
        <Field
          label="Slug (URL)"
          name="slug"
          required
          defaultValue={product.slug}
          error={state.errors?.slug}
          hint="Apparaît dans l'adresse : /produit/mon-slug"
        />
      </div>

      <Field
        label="Accroche"
        name="subtitle"
        defaultValue={product.subtitle ?? ""}
        error={state.errors?.subtitle}
        placeholder="Coton lourd, visière structurée"
      />

      <div>
        <label htmlFor="admin-description" className="field-label">
          Description *
        </label>
        <textarea
          id="admin-description"
          name="description"
          required
          rows={7}
          defaultValue={product.description}
          className={`field resize-y ${state.errors?.description ? "field-error" : ""}`}
        />
        {state.errors?.description && (
          <p className="label-sm mt-2" role="alert">
            {state.errors.description}
          </p>
        )}
        <p className="label-sm mt-2 text-[color:var(--color-smoke)]">
          Un saut de ligne crée un nouveau paragraphe sur la fiche.
        </p>
      </div>

      <div>
        <label htmlFor="admin-composition" className="field-label">
          Matière & entretien
        </label>
        <textarea
          id="admin-composition"
          name="composition"
          rows={4}
          defaultValue={product.composition ?? ""}
          className="field resize-y"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label="Prix (€)"
          name="basePrice"
          type="number"
          required
          defaultValue={(product.basePrice / 100).toFixed(2)}
          error={state.errors?.basePrice}
        />
        <Field
          label="Prix barré (€)"
          name="compareAtPrice"
          type="number"
          defaultValue={product.compareAtPrice ? (product.compareAtPrice / 100).toFixed(2) : ""}
          error={state.errors?.compareAtPrice}
        />
        <Field
          label="Ordre d'affichage"
          name="position"
          type="number"
          defaultValue={String(product.position)}
          error={state.errors?.position}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="admin-category" className="field-label">
            Rayon
          </label>
          <select
            id="admin-category"
            name="categoryId"
            defaultValue={product.categoryId ?? ""}
            className="field"
          >
            <option value="">Aucun</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="Badge"
          name="badge"
          defaultValue={product.badge ?? ""}
          placeholder="NOUVEAU"
          error={state.errors?.badge}
        />
      </div>

      <fieldset className="hairline space-y-5 pt-6">
        <legend className="label mb-4 text-[color:var(--color-smoke)]">Référencement</legend>

        <Field
          label="Titre SEO"
          name="seoTitle"
          defaultValue={product.seoTitle ?? ""}
          error={state.errors?.seoTitle}
          hint="60 caractères environ. Vide = nom du produit."
        />

        <div>
          <label htmlFor="admin-seo-description" className="field-label">
            Description SEO
          </label>
          <textarea
            id="admin-seo-description"
            name="seoDescription"
            rows={3}
            maxLength={200}
            defaultValue={product.seoDescription ?? ""}
            className="field resize-y"
          />
        </div>
      </fieldset>

      <SubmitButton className="btn">Enregistrer la pièce</SubmitButton>
    </form>
  );
}

export function ProductImageForm({ productId }: { productId: string }) {
  const [state, formAction] = useActionState(addProductImageAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />

      {state.success && <FormSuccess message={state.message} />}
      <FormError message={state.errors?.form} />

      <Field
        label="Adresse du visuel"
        name="url"
        required
        error={state.errors?.url}
        placeholder="https://…"
        hint="Collez l'URL https d'une image déjà hébergée (Printful, Vercel Blob, Cloudinary…)."
      />

      <Field label="Texte alternatif" name="alt" placeholder="Rashguard noir, vue de dos" />

      <SubmitButton className="btn btn-sm">Ajouter le visuel</SubmitButton>
    </form>
  );
}

export function OrderAdminForm({
  order,
}: {
  order: {
    id: string;
    status: string;
    trackingNumber: string | null;
    trackingUrl: string | null;
    printfulOrderId: string | null;
  };
}) {
  const [state, formAction] = useActionState(updateOrderAction, initialState);
  const [pushState, pushAction] = useActionState(pushOrderToPrintfulAction, initialState);

  const STATUSES = [
    ["PENDING", "En attente de paiement"],
    ["PAID", "Payée"],
    ["IN_PRODUCTION", "En fabrication"],
    ["SHIPPED", "Expédiée"],
    ["DELIVERED", "Livrée"],
    ["CANCELED", "Annulée"],
    ["REFUNDED", "Remboursée"],
  ] as const;

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="orderId" value={order.id} />

        {state.success && <FormSuccess message={state.message} />}
        <FormError message={state.errors?.form} />

        <div>
          <label htmlFor="order-status" className="field-label">
            Statut
          </label>
          <select
            id="order-status"
            name="status"
            defaultValue={order.status}
            className="field"
          >
            {STATUSES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="Numéro de suivi"
          name="trackingNumber"
          defaultValue={order.trackingNumber ?? ""}
          error={state.errors?.trackingNumber}
        />

        <Field
          label="Lien de suivi"
          name="trackingUrl"
          defaultValue={order.trackingUrl ?? ""}
          error={state.errors?.trackingUrl}
          placeholder="https://…"
        />

        <SubmitButton className="btn btn-sm">Mettre à jour</SubmitButton>
      </form>

      <div className="hairline pt-6">
        <p className="label mb-3 text-[color:var(--color-smoke)]">Printful</p>

        {order.printfulOrderId ? (
          <p className="text-sm">
            Transmise à Printful sous le numéro{" "}
            <span className="font-mono">#{order.printfulOrderId}</span>.
          </p>
        ) : (
          <form action={pushAction} className="space-y-3">
            <input type="hidden" name="orderId" value={order.id} />
            <p className="mb-3 max-w-[52ch] text-sm text-[color:var(--color-smoke)]">
              Cette commande n&apos;a pas encore été envoyée en production. Utile
              si l&apos;envoi automatique a échoué.
            </p>
            <SubmitButton className="btn btn-outline btn-sm" pendingLabel="Envoi…">
              Envoyer à Printful
            </SubmitButton>

            {pushState.success && <FormSuccess message={pushState.message} />}
            <FormError message={pushState.errors?.form} />
          </form>
        )}
      </div>
    </div>
  );
}

export function ReviewReplyForm({
  reviewId,
  reply,
}: {
  reviewId: string;
  reply: string | null;
}) {
  const [state, formAction] = useActionState(replyToReviewAction, initialState);
  const [open, setOpen] = useState(Boolean(reply));

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="label-sm link-sweep">
        Répondre
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="reviewId" value={reviewId} />

      {state.success && <FormSuccess message={state.message} />}
      <FormError message={state.errors?.form} />

      <textarea
        name="reply"
        rows={3}
        defaultValue={reply ?? ""}
        maxLength={2000}
        className="field resize-y"
        placeholder="Réponse publique de la boutique…"
      />

      <div className="flex gap-3">
        <SubmitButton className="btn btn-sm">Enregistrer</SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="label-sm link-sweep">
          Fermer
        </button>
      </div>
    </form>
  );
}

export function CouponForm() {
  const [state, formAction] = useActionState(createCouponAction, initialState);
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");

  return (
    <form action={formAction} className="space-y-5">
      {state.success && <FormSuccess message={state.message} />}
      <FormError message={state.errors?.form} />

      <Field label="Code" name="code" required error={state.errors?.code} placeholder="NB10" />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="coupon-type" className="field-label">
            Type
          </label>
          <select
            id="coupon-type"
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value as "PERCENT" | "FIXED")}
            className="field"
          >
            <option value="PERCENT">Pourcentage</option>
            <option value="FIXED">Montant fixe</option>
          </select>
        </div>

        <Field
          label={type === "PERCENT" ? "Remise (%)" : "Remise (€)"}
          name="value"
          type="number"
          required
          error={state.errors?.value}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label="Panier minimum (€)"
          name="minSubtotal"
          type="number"
          defaultValue="0"
          error={state.errors?.minSubtotal}
        />
        <Field
          label="Utilisations max"
          name="maxUses"
          type="number"
          error={state.errors?.maxUses}
          hint="Vide = illimité"
        />
        <Field label="Expire le" name="expiresAt" type="date" error={state.errors?.expiresAt} />
      </div>

      <SubmitButton className="btn btn-sm">Créer le code</SubmitButton>
    </form>
  );
}

export function CategoryForm() {
  const [state, formAction] = useActionState(createCategoryAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.success && <FormSuccess message={state.message} />}
      <FormError message={state.errors?.form} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom du rayon" name="name" required error={state.errors?.name} />
        <Field
          label="Slug"
          name="slug"
          required
          error={state.errors?.slug}
          placeholder="casquettes"
        />
      </div>

      <Field label="Accroche" name="tagline" error={state.errors?.tagline} />

      <SubmitButton className="btn btn-sm">Créer le rayon</SubmitButton>
    </form>
  );
}
