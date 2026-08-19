"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { CapSilhouette } from "@/components/CapSilhouette";
import { formatPrice, formatPriceSmart } from "@/lib/money";
import { RETURN_WINDOW_DAYS, SHIPPING } from "@/lib/shop";

export type PurchaseVariant = {
  id: string;
  name: string;
  color: string | null;
  colorHex: string | null;
  size: string | null;
  price: number;
  available: boolean;
  imageUrl: string | null;
};

export type PurchaseImage = { url: string; alt: string | null };

/**
 * Galerie et sélecteur d'achat de la fiche produit.
 *
 * Les deux sont réunis dans un seul composant client parce qu'ils partagent le
 * même état : choisir une couleur fait défiler la galerie jusqu'au visuel
 * correspondant.
 */
export function ProductPurchase({
  productName,
  images,
  variants,
  compareAtPrice,
}: {
  productName: string;
  images: PurchaseImage[];
  variants: PurchaseVariant[];
  compareAtPrice: number | null;
}) {
  const { add, cart, isBusy } = useCart();

  const colors = useMemo(
    () =>
      Array.from(
        new Map(
          variants
            .filter((variant) => variant.color)
            .map((variant) => [variant.color as string, variant]),
        ).entries(),
      ),
    [variants],
  );

  const sizes = useMemo(
    () => Array.from(new Set(variants.map((variant) => variant.size).filter(Boolean))) as string[],
    [variants],
  );

  const firstAvailable = variants.find((variant) => variant.available) ?? variants[0];

  const [color, setColor] = useState<string | null>(firstAvailable?.color ?? null);
  const [size, setSize] = useState<string | null>(firstAvailable?.size ?? null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const actions = useRef<HTMLDivElement>(null);

  // La variante retenue est celle qui satisfait les deux critères ; si le
  // produit n'a qu'un axe (taille unique par exemple), l'autre est ignoré.
  const selected = useMemo(() => {
    return (
      variants.find(
        (variant) =>
          (color === null || variant.color === color) &&
          (size === null || variant.size === size),
      ) ?? firstAvailable
    );
  }, [variants, color, size, firstAvailable]);

  const gallery: PurchaseImage[] =
    images.length > 0
      ? images
      : selected?.imageUrl
        ? [{ url: selected.imageUrl, alt: productName }]
        : [];

  const price = selected?.price ?? 0;
  const canBuy = Boolean(selected?.available);
  const busy = isBusy || redirecting;

  const discount =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

  // Ce qu'il manque pour la livraison offerte, panier courant compris : c'est
  // l'information qui décide un deuxième article, autant la donner ici.
  const projectedSubtotal = cart.subtotal + price * quantity;
  const missingForFreeShipping = Math.max(0, SHIPPING.freeThreshold - projectedSubtotal);

  // Sur téléphone les boutons disparaissent dès qu'on lit la description :
  // une barre d'achat prend le relais en bas de l'écran.
  useEffect(() => {
    const target = actions.current;
    if (!target || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setBarVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const chooseColor = (nextColor: string, variant: PurchaseVariant) => {
    setColor(nextColor);

    // Si la taille courante n'existe pas dans cette couleur, on bascule sur la
    // première taille réellement disponible plutôt que d'afficher « épuisé ».
    const sizesForColor = variants
      .filter((item) => item.color === nextColor && item.available)
      .map((item) => item.size);

    if (size && !sizesForColor.includes(size)) {
      setSize(sizesForColor[0] ?? null);
    }

    const index = gallery.findIndex((image) => image.url === variant.imageUrl);
    if (index >= 0) setActiveImage(index);
  };

  const submit = async () => {
    if (!selected || !canBuy) return;
    setFeedback(null);
    setError(null);
    await add(selected.id, quantity, productName);
    setFeedback("Ajouté au panier");
  };

  /**
   * Achat direct : la pièce rejoint le panier puis le client part vers la
   * caisse Stripe sans passer par la page panier. Le tiroir ne s'ouvre pas —
   * il serait balayé par la redirection.
   */
  const buyNow = async () => {
    if (!selected || !canBuy || busy) return;

    setFeedback(null);
    setError(null);
    setRedirecting(true);

    try {
      await add(selected.id, quantity, productName, { openDrawer: false });

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? "Le paiement n'a pas pu être lancé.");
        setRedirecting(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Connexion impossible. Réessayez dans un instant.");
      setRedirecting(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      {/* --- Galerie ------------------------------------------------- */}
      <div className="flex flex-col-reverse gap-4 md:flex-row">
        {gallery.length > 1 && (
          <div className="flex gap-3 overflow-x-auto md:w-[86px] md:flex-col md:overflow-visible no-scrollbar">
            {gallery.map((image, index) => (
              <button
                key={image.url + index}
                type="button"
                onClick={() => setActiveImage(index)}
                className={`relative aspect-4/5 w-[70px] shrink-0 overflow-hidden border transition-colors md:w-full ${
                  activeImage === index
                    ? "border-[color:var(--color-ink)]"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
                aria-label={`Visuel ${index + 1}`}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="86px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="relative flex-1">
          <div className="relative aspect-4/5 overflow-hidden bg-[color:var(--color-paper-pure)]">
            {gallery.length > 0 ? (
              gallery.map((image, index) => (
                <Image
                  key={image.url + index}
                  src={image.url}
                  alt={image.alt ?? productName}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className={`object-cover transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    activeImage === index ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))
            ) : (
              <CapSilhouette />
            )}
          </div>

          {gallery.length > 1 && (
            <div className="mt-3 flex items-center justify-between">
              <span className="label-sm text-[color:var(--color-smoke)]">
                {String(activeImage + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveImage((index) => (index - 1 + gallery.length) % gallery.length)
                  }
                  className="label px-2 py-1 transition-transform duration-300 hover:-translate-x-0.5"
                  aria-label="Visuel précédent"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImage((index) => (index + 1) % gallery.length)}
                  className="label px-2 py-1 transition-transform duration-300 hover:translate-x-0.5"
                  aria-label="Visuel suivant"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Achat ---------------------------------------------------- */}
      <div className="lg:sticky lg:top-[100px] lg:self-start">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <p className="font-mono text-2xl">{formatPriceSmart(price)}</p>

          {compareAtPrice && compareAtPrice > price && (
            <>
              <p className="font-mono text-sm text-[color:var(--color-smoke)] line-through">
                {formatPriceSmart(compareAtPrice)}
              </p>
              {discount > 0 && <span className="tag tag-solid">−{discount} %</span>}
            </>
          )}
        </div>

        <p className="label-sm mt-3 text-[color:var(--color-smoke)]">
          TVA incluse — livraison offerte dès {SHIPPING.freeThreshold / 100} €
        </p>

        {colors.length > 0 && (
          <fieldset className="mt-9">
            <legend className="label mb-4 text-[color:var(--color-smoke)]">
              Coloris — <span className="text-[color:var(--color-ink)]">{color}</span>
            </legend>

            <div className="flex flex-wrap gap-3">
              {colors.map(([colorName, variant]) => (
                <button
                  key={colorName}
                  type="button"
                  onClick={() => chooseColor(colorName, variant)}
                  data-selected={color === colorName}
                  className="swatch"
                  style={{ backgroundColor: variant.colorHex ?? "var(--color-smoke)" }}
                  aria-label={colorName}
                  aria-pressed={color === colorName}
                  title={colorName}
                />
              ))}
            </div>
          </fieldset>
        )}

        {sizes.length > 0 && (
          <fieldset className="mt-8">
            <legend className="label mb-4 text-[color:var(--color-smoke)]">Taille</legend>

            <div className="flex flex-wrap gap-2">
              {sizes.map((sizeName) => {
                const variant = variants.find(
                  (item) =>
                    item.size === sizeName && (color === null || item.color === color),
                );
                const disabled = !variant?.available;

                return (
                  <button
                    key={sizeName}
                    type="button"
                    onClick={() => setSize(sizeName)}
                    disabled={disabled}
                    className={`label border px-4 py-3 transition-colors ${
                      size === sizeName
                        ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
                        : "border-[color:var(--color-hairline)] hover:border-[color:var(--color-ink)]"
                    } ${disabled ? "cursor-not-allowed line-through opacity-35" : ""}`}
                    aria-pressed={size === sizeName}
                  >
                    {sizeName}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <div ref={actions} className="mt-8 space-y-3">
          <div className="flex items-stretch gap-3">
            <div className="flex items-center border border-[color:var(--color-hairline)]">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="h-full w-11 transition-colors hover:bg-[color:var(--color-ink)] hover:text-[color:var(--color-paper)]"
                aria-label="Diminuer la quantité"
              >
                −
              </button>
              <span className="w-10 text-center font-mono text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(10, value + 1))}
                className="h-full w-11 transition-colors hover:bg-[color:var(--color-ink)] hover:text-[color:var(--color-paper)]"
                aria-label="Augmenter la quantité"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={buyNow}
              disabled={!canBuy || busy}
              className="btn min-w-0 flex-1"
            >
              {!canBuy ? (
                "Épuisé"
              ) : redirecting ? (
                "Redirection…"
              ) : (
                <>
                  Acheter maintenant
                  {/* Le montant est déjà lu juste au-dessus : sur un écran
                      étroit il ferait passer le bouton sur trois lignes. */}
                  <span className="hidden sm:inline">
                    {" "}
                    — {formatPrice(price * quantity)}
                  </span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={!canBuy || busy}
            className="btn btn-outline btn-block"
          >
            {isBusy && !redirecting ? "Ajout…" : "Ajouter au panier"}
          </button>
        </div>

        {feedback && (
          <p className="label mt-4 text-[color:var(--color-smoke)]" role="status">
            {feedback}
          </p>
        )}

        {error && (
          <p
            className="mt-4 border border-[color:var(--color-ink)] px-3 py-2 text-xs"
            role="alert"
          >
            {error}
          </p>
        )}

        {canBuy && missingForFreeShipping > 0 && (
          <p className="mt-4 text-xs text-[color:var(--color-smoke)]">
            Plus que {formatPriceSmart(missingForFreeShipping)} pour la livraison offerte.
          </p>
        )}

        {!canBuy && (
          <p className="mt-4 text-xs text-[color:var(--color-smoke)]">
            Cette référence est momentanément indisponible. Inscrivez-vous à la
            liste pour être prévenu du retour en stock.
          </p>
        )}

        {/* Les quatre réponses que l'on se pose avant de payer : quand
            j'expédie, ce que je paie, si je peux renvoyer, si c'est sûr. */}
        <ul className="mt-9 space-y-3 border-t border-[color:var(--color-hairline)] pt-7">
          {[
            {
              titre: "Fabriqué à la commande",
              detail:
                "Rien n'est produit à l'avance : aucune pièce ne finit détruite faute d'acheteur.",
            },
            {
              titre: "Expédition sous 2 à 5 jours ouvrés",
              detail: "Confection puis envoi suivi, numéro de suivi par e-mail.",
            },
            {
              titre: `Retour sous ${RETURN_WINDOW_DAYS} jours`,
              detail: "Pièce non portée, dans son état d'origine.",
            },
            {
              titre: "Paiement sécurisé",
              detail:
                "Carte bancaire, Apple Pay et Google Pay via Stripe. Vos coordonnées bancaires ne passent jamais par nos serveurs.",
            },
          ].map((item) => (
            <li key={item.titre} className="flex gap-3">
              <span
                aria-hidden
                className="mt-[7px] h-px w-4 shrink-0 bg-[color:var(--color-ink)]"
              />
              <span className="min-w-0">
                <span className="block text-sm">{item.titre}</span>
                <span className="block text-xs leading-relaxed text-[color:var(--color-smoke)]">
                  {item.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Barre d'achat mobile : elle reprend la sélection en cours, elle ne la
          redemande pas. Masquée tant que les vrais boutons sont à l'écran. */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-hairline)] bg-[color:var(--color-paper)]/95 backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${
          barVisible && canBuy ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden={!barVisible || !canBuy}
      >
        <div className="shell flex items-center gap-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{productName}</p>
            <p className="label-sm truncate text-[color:var(--color-smoke)]">
              {[selected?.color, selected?.size].filter(Boolean).join(" / ") || "Sélection"}
              {" — "}
              {formatPrice(price * quantity)}
            </p>
          </div>

          <button
            type="button"
            onClick={buyNow}
            disabled={!canBuy || busy}
            className="btn btn-sm shrink-0"
            tabIndex={barVisible && canBuy ? 0 : -1}
          >
            {redirecting ? "Redirection…" : "Acheter"}
          </button>
        </div>
      </div>
    </div>
  );
}
