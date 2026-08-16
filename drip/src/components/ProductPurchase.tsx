"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { CapSilhouette } from "@/components/CapSilhouette";
import { formatPrice, formatPriceSmart } from "@/lib/money";

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
  const { add, isBusy } = useCart();

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
    await add(selected.id, quantity, productName);
    setFeedback("Ajouté au panier");
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
        <div className="flex items-baseline gap-4">
          <p className="font-mono text-2xl">{formatPriceSmart(price)}</p>
          {compareAtPrice && compareAtPrice > price && (
            <p className="font-mono text-sm text-[color:var(--color-smoke)] line-through">
              {formatPriceSmart(compareAtPrice)}
            </p>
          )}
        </div>

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

        <div className="mt-8 flex items-stretch gap-3">
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
            onClick={submit}
            disabled={!canBuy || isBusy}
            className="btn flex-1"
          >
            {!canBuy
              ? "Épuisé"
              : isBusy
                ? "Ajout…"
                : `Ajouter — ${formatPrice(price * quantity)}`}
          </button>
        </div>

        {feedback && (
          <p className="label mt-4 text-[color:var(--color-smoke)]" role="status">
            {feedback}
          </p>
        )}

        {!canBuy && (
          <p className="mt-4 text-xs text-[color:var(--color-smoke)]">
            Cette référence est momentanément indisponible. Inscrivez-vous à la
            liste pour être prévenu du retour en stock.
          </p>
        )}
      </div>
    </div>
  );
}
