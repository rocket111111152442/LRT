"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { QuantityStepper } from "@/components/QuantityStepper";
import { formatPrice } from "@/lib/money";
import { SHIPPING, RETURN_WINDOW_DAYS } from "@/lib/shop";

export function CartPageContent({ loggedIn }: { loggedIn: boolean }) {
  const { cart, setQuantity, remove, isBusy } = useCart();
  const [coupon, setCoupon] = useState("");
  const [couponState, setCouponState] = useState<{
    code: string;
    discount: number;
    freeShipping: boolean;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unavailable = cart.lines.some((line) => !line.available);
  const remaining = Math.max(0, SHIPPING.freeThreshold - cart.subtotal);
  const discount = couponState?.discount ?? 0;
  const portOffert = couponState?.freeShipping ?? false;
  const shipping = portOffert ? 0 : cart.shipping;
  const total = Math.max(0, cart.subtotal - discount) + shipping;

  const checkCoupon = async () => {
    setCouponError(null);

    const response = await fetch("/api/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon }),
    });

    const data = (await response.json()) as {
      ok?: boolean;
      code?: string;
      discount?: number;
      freeShipping?: boolean;
      error?: string;
    };

    if (!response.ok || !data.ok || !data.code) {
      setCouponState(null);
      setCouponError(data.error ?? "Code invalide.");
      return;
    }

    setCouponState({
      code: data.code,
      discount: data.discount ?? 0,
      freeShipping: data.freeShipping ?? false,
    });
  };

  const checkout = async () => {
    setCheckingOut(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupon: couponState?.code }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? "Le paiement n'a pas pu être lancé.");
        setCheckingOut(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Connexion impossible. Réessayez dans un instant.");
      setCheckingOut(false);
    }
  };

  if (cart.lines.length === 0) {
    return (
      <div className="hairline hairline-b flex flex-col items-center gap-6 py-28 text-center">
        <p className="display-lg">Votre panier est vide</p>
        <p className="max-w-[42ch] text-sm text-[color:var(--color-smoke)]">
          Parcourez la collection et ajoutez la pièce qui vous plaît. Elle sera
          conservée ici même si vous fermez la page.
        </p>
        <Link href="/boutique" className="btn">
          Voir la collection
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
      <section>
        <div className="hairline">
          {cart.lines.map((line) => (
            <article key={line.id} className="hairline-b flex gap-5 py-6 sm:gap-8">
              <Link
                href={`/produit/${line.product.slug}`}
                className="relative aspect-4/5 w-[110px] shrink-0 overflow-hidden bg-[color:var(--color-paper-pure)] sm:w-[140px]"
              >
                {line.product.imageUrl ? (
                  <Image
                    src={line.product.imageUrl}
                    alt={line.product.name}
                    fill
                    sizes="140px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center bg-[color:var(--color-ash)]">
                    <span className="display text-2xl opacity-30">NB</span>
                  </span>
                )}
              </Link>

              <div className="flex flex-1 flex-col justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <Link
                      href={`/produit/${line.product.slug}`}
                      className="text-base font-medium link-underline"
                    >
                      {line.product.name}
                    </Link>
                    <span className="font-mono text-sm">{formatPrice(line.lineTotal)}</span>
                  </div>

                  <p className="label-sm mt-2 text-[color:var(--color-smoke)]">
                    {line.variantName}
                  </p>

                  {!line.available && (
                    <p className="tag mt-3 inline-flex">Épuisé — à retirer</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <QuantityStepper
                    value={line.quantity}
                    onChange={(quantite) => setQuantity(line.id, quantite)}
                    size="sm"
                  />

                  <button
                    type="button"
                    onClick={() => remove(line.id)}
                    className="label-sm text-[color:var(--color-smoke)] link-sweep hover:text-[color:var(--color-ink)]"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <Link href="/boutique" className="label mt-8 inline-block link-sweep">
          ← Continuer mes achats
        </Link>
      </section>

      <aside className="lg:sticky lg:top-[100px] lg:self-start">
        <div className="border border-[color:var(--color-hairline)] p-7">
          <h2 className="label mb-6">Récapitulatif</h2>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[color:var(--color-smoke)]">Sous-total</dt>
              <dd className="font-mono">{formatPrice(cart.subtotal)}</dd>
            </div>

            {couponState && !portOffert && (
              <div className="flex justify-between">
                <dt className="text-[color:var(--color-smoke)]">
                  Code {couponState.code}
                </dt>
                <dd className="font-mono">−{formatPrice(discount)}</dd>
              </div>
            )}

            <div className="flex justify-between">
              <dt className="text-[color:var(--color-smoke)]">
                Livraison
                {portOffert && ` — code ${couponState?.code}`}
              </dt>
              <dd className="font-mono">
                {shipping === 0 ? "Offerte" : formatPrice(shipping)}
              </dd>
            </div>
          </dl>

          {remaining > 0 && !portOffert && (
            <p className="label-sm mt-4 text-[color:var(--color-smoke)]">
              Plus que {formatPrice(remaining)} pour la livraison offerte.
            </p>
          )}

          <div className="hairline mt-6 flex items-baseline justify-between pt-5">
            <span className="label">Total</span>
            <span className="font-mono text-xl">{formatPrice(total)}</span>
          </div>

          <p className="label-sm mt-2 text-[color:var(--color-smoke)]">TVA incluse</p>

          {/* Code promo */}
          <div className="mt-7">
            <label htmlFor="coupon" className="field-label">
              Code promo
            </label>
            <div className="flex gap-2">
              <input
                id="coupon"
                value={coupon}
                onChange={(event) => setCoupon(event.target.value.toUpperCase())}
                className="field"
                placeholder="NB10"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={checkCoupon}
                disabled={!coupon}
                className="btn btn-outline btn-sm shrink-0"
              >
                OK
              </button>
            </div>

            {couponError && (
              <p className="label-sm mt-2 text-[color:var(--color-smoke)]" role="alert">
                {couponError}
              </p>
            )}
            {couponState && (
              <p className="label-sm mt-2" role="status">
                {portOffert
                  ? "Code appliqué : livraison offerte"
                  : `Code appliqué : −${formatPrice(discount)}`}
              </p>
            )}
          </div>

          {error && (
            <p className="mt-5 border border-[color:var(--color-ink)] px-3 py-2 text-xs" role="alert">
              {error}
            </p>
          )}

          {loggedIn ? (
            <>
              <button
                type="button"
                onClick={checkout}
                disabled={checkingOut || isBusy || unavailable}
                className="btn btn-block mt-7"
              >
                {checkingOut ? "Redirection…" : "Passer au paiement"}
              </button>

              {unavailable && (
                <p className="label-sm mt-3 text-center text-[color:var(--color-smoke)]">
                  Retirez les pièces épuisées pour continuer.
                </p>
              )}
            </>
          ) : (
            <div className="mt-7 border border-[color:var(--color-ink)] p-5">
              <p className="label mb-2">Un compte est nécessaire</p>
              <p className="mb-5 text-sm leading-relaxed text-[color:var(--color-smoke)]">
                Pour suivre votre commande et vous recontacter si besoin, la
                commande se fait avec un compte. Cela prend une minute.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/connexion?suite=/panier" className="btn btn-block">
                  Se connecter
                </Link>
                <Link
                  href="/inscription?suite=/panier"
                  className="btn btn-outline btn-block"
                >
                  Créer un compte
                </Link>
              </div>
            </div>
          )}

          <ul className="mt-7 space-y-2 text-xs text-[color:var(--color-smoke)]">
            <li>— Paiement sécurisé par Stripe</li>
            <li>— Défaut repris sous {RETURN_WINDOW_DAYS} jours</li>
            <li>— Fabriqué à la commande</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
