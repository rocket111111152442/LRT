import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS, ORDER_STEPS, type OrderStatusKey } from "@/lib/orderStatus";
import { SHOP } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Détail de commande",
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

export default async function CommandeDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await requireUser(`/compte/commandes/${id}`);

  // Filtre sur userId : une commande d'un autre client renvoie 404, pas ses
  // informations personnelles.
  const order = await safeQuery(
    () =>
      prisma.order.findFirst({
        where: { id, userId: user.id },
        include: { items: true, reviews: { select: { productId: true } } },
      }),
    null,
    "détail de commande",
  );

  if (!order) notFound();

  const status = ORDER_STATUS[order.status as OrderStatusKey];
  const reviewedProductIds = new Set(order.reviews.map((review) => review.productId));
  const canReview = ["PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED"].includes(order.status);

  return (
    <div className="space-y-12">
      <div>
        <Link href="/compte/commandes" className="label link-sweep">
          ← Toutes mes commandes
        </Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="display-lg">{order.number}</h2>
            <p className="label-sm mt-3 text-[color:var(--color-smoke)]">
              Passée le{" "}
              {order.createdAt.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <span className="tag tag-solid">{status.label}</span>
        </div>
      </div>

      {/* Suivi visuel : une ligne, quatre jalons. */}
      {status.step > 0 && (
        <section>
          <div className="relative">
            <div className="absolute left-0 right-0 top-[7px] h-px bg-[color:var(--color-ash)]" />
            <div
              className="absolute left-0 top-[7px] h-px bg-[color:var(--color-ink)] transition-[width] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${((status.step - 1) / (ORDER_STEPS.length - 1)) * 100}%` }}
            />

            <ol className="relative flex justify-between">
              {ORDER_STEPS.map((step, index) => {
                const reached = index < status.step;

                return (
                  <li key={step} className="flex flex-col items-center gap-3 text-center">
                    <span
                      className={`block h-[15px] w-[15px] rounded-full border transition-colors ${
                        reached
                          ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)]"
                          : "border-[color:var(--color-ash)] bg-[color:var(--color-paper)]"
                      }`}
                    />
                    <span
                      className={`label-sm ${
                        reached ? "" : "text-[color:var(--color-smoke)]"
                      }`}
                    >
                      {step}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <p className="mt-6 text-sm text-[color:var(--color-smoke)]">{status.description}</p>

          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-outline btn-sm mt-6"
            >
              Suivre le colis
              {order.trackingNumber && ` — ${order.trackingNumber}`}
            </a>
          )}
        </section>
      )}

      <section>
        <h3 className="label mb-5 text-[color:var(--color-smoke)]">Articles</h3>

        <div className="hairline">
          {order.items.map((item) => (
            <article key={item.id} className="hairline-b flex flex-wrap items-center gap-5 py-5">
              <div className="relative aspect-4/5 w-[80px] shrink-0 overflow-hidden bg-[color:var(--color-paper-pure)]">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt="" fill sizes="80px" className="object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center bg-[color:var(--color-ash)]">
                    <span className="display text-lg opacity-30">NB</span>
                  </span>
                )}
              </div>

              <div className="min-w-[180px] flex-1">
                {item.productSlug ? (
                  <Link href={`/produit/${item.productSlug}`} className="text-sm font-medium link-underline">
                    {item.productName}
                  </Link>
                ) : (
                  <p className="text-sm font-medium">{item.productName}</p>
                )}

                <p className="label-sm mt-2 text-[color:var(--color-smoke)]">
                  {item.variantName} — ×{item.quantity}
                </p>

                {canReview && item.productId && (
                  <div className="mt-3">
                    {reviewedProductIds.has(item.productId) ? (
                      <span className="label-sm text-[color:var(--color-smoke)]">
                        Avis déposé
                      </span>
                    ) : (
                      <Link
                        href={`/compte/avis?produit=${item.productId}&commande=${order.id}`}
                        className="label link-sweep"
                      >
                        Laisser un avis
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <span className="font-mono text-sm">
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-10 sm:grid-cols-2">
        <div>
          <h3 className="label mb-4 text-[color:var(--color-smoke)]">Adresse de livraison</h3>
          {order.shippingLine1 ? (
            <address className="text-sm not-italic leading-relaxed">
              {order.shippingName}
              <br />
              {order.shippingLine1}
              {order.shippingLine2 && (
                <>
                  <br />
                  {order.shippingLine2}
                </>
              )}
              <br />
              {order.shippingPostalCode} {order.shippingCity}
              <br />
              {order.shippingCountry}
            </address>
          ) : (
            <p className="text-sm text-[color:var(--color-smoke)]">Non renseignée.</p>
          )}
        </div>

        <div>
          <h3 className="label mb-4 text-[color:var(--color-smoke)]">Récapitulatif</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[color:var(--color-smoke)]">Sous-total</dt>
              <dd className="font-mono">{formatPrice(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-[color:var(--color-smoke)]">
                  Remise {order.couponCode && `(${order.couponCode})`}
                </dt>
                <dd className="font-mono">−{formatPrice(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-[color:var(--color-smoke)]">Livraison</dt>
              <dd className="font-mono">
                {order.shipping === 0 ? "Offerte" : formatPrice(order.shipping)}
              </dd>
            </div>
            <div className="hairline flex justify-between pt-3">
              <dt className="label">Total</dt>
              <dd className="font-mono text-base">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <p className="text-xs text-[color:var(--color-smoke)]">
        Un problème avec cette commande ? Écrivez à{" "}
        <a href={`mailto:${SHOP.email}`} className="link-underline">
          {SHOP.email}
        </a>{" "}
        en rappelant le numéro {order.number}.
      </p>
    </div>
  );
}
