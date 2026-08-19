"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { QuantityStepper } from "@/components/QuantityStepper";
import { formatPrice } from "@/lib/money";
import { SHIPPING } from "@/lib/shop";

export function CartDrawer() {
  const { cart, isOpen, close, setQuantity, remove } = useCart();

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const remaining = Math.max(0, SHIPPING.freeThreshold - cart.subtotal);
  const progress = Math.min(100, (cart.subtotal / SHIPPING.freeThreshold) * 100);

  // Rien à commander tant qu'aucune ligne n'est disponible : le tiroir peut
  // contenir des pièces épuisées, qu'il faut retirer avant de continuer.
  const commandable = cart.lines.some((line) => line.available);

  return (
    <>
      <div
        className="drawer-backdrop"
        onClick={close}
        role="presentation"
        aria-hidden="true"
      />

      <aside
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Panier"
      >
        <header className="hairline-b flex items-center justify-between px-6 py-5">
          <h2 className="label">
            Panier
            <span className="ml-2 opacity-50">
              ({cart.count} article{cart.count > 1 ? "s" : ""})
            </span>
          </h2>
          <button type="button" onClick={close} className="label link-sweep" aria-label="Fermer le panier">
            Fermer
          </button>
        </header>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
            <p className="display-lg">Panier vide</p>
            <p className="max-w-[26ch] text-sm text-[color:var(--color-smoke)]">
              Aucune pièce sélectionnée pour le moment.
            </p>
            <Link href="/boutique" onClick={close} className="btn btn-outline btn-sm">
              Voir la collection
            </Link>
          </div>
        ) : (
          <>
            {/* Jauge de livraison offerte : incite au panier moyen sans pop-up. */}
            <div className="hairline-b px-6 py-4">
              <p className="label-sm mb-2 text-[color:var(--color-smoke)]">
                {remaining > 0 ? (
                  <>
                    Plus que <span className="text-[color:var(--color-ink)]">{formatPrice(remaining)}</span> pour la livraison offerte
                  </>
                ) : (
                  "Livraison offerte débloquée"
                )}
              </p>
              <div className="h-px w-full bg-[color:var(--color-ash)]">
                <div
                  className="h-px bg-[color:var(--color-ink)] transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {cart.lines.map((line) => (
                <article key={line.id} className="hairline-b flex gap-4 px-6 py-5">
                  <Link
                    href={`/produit/${line.product.slug}`}
                    onClick={close}
                    className="relative h-[110px] w-[88px] shrink-0 overflow-hidden bg-[color:var(--color-paper-pure)]"
                  >
                    {line.product.imageUrl ? (
                      <Image
                        src={line.product.imageUrl}
                        alt={line.product.name}
                        fill
                        sizes="88px"
                        className="object-cover"
                      />
                    ) : (
                      <PlaceholderMark />
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/produit/${line.product.slug}`}
                          onClick={close}
                          className="text-sm font-medium leading-tight link-underline"
                        >
                          {line.product.name}
                        </Link>
                        <span className="font-mono text-sm">{formatPrice(line.lineTotal)}</span>
                      </div>
                      <p className="label-sm mt-1.5 text-[color:var(--color-smoke)]">
                        {line.variantName}
                      </p>
                      {!line.available && (
                        <p className="label-sm mt-2 text-[color:var(--color-ink)]">
                          Épuisé — retirez cet article pour continuer
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
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

            <footer className="hairline px-6 py-5">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="label">Sous-total</span>
                <span className="font-mono">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="label text-[color:var(--color-smoke)]">Livraison</span>
                <span className="font-mono text-[color:var(--color-smoke)]">
                  {cart.shipping === 0 ? "Offerte" : formatPrice(cart.shipping)}
                </span>
              </div>

              {/* Le tiroir mène au panier, jamais droit à la caisse : c'est
                  là que se saisit le code promo et que le total se lit en
                  entier. Le paiement part de cette page-là. */}
              {commandable ? (
                <Link href="/panier" onClick={close} className="btn btn-block">
                  Passer commande — {formatPrice(cart.total)}
                </Link>
              ) : (
                <button type="button" disabled className="btn btn-block">
                  Retirez les pièces épuisées
                </button>
              )}
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

function PlaceholderMark() {
  return (
    <div className="grid h-full w-full place-items-center bg-[color:var(--color-ash)]">
      <span className="display text-lg opacity-30">NB</span>
    </div>
  );
}
