import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/orderStatus";
import { OrderAdminForm } from "@/components/admin/AdminForms";

type Params = Promise<{ id: string }>;

export default async function AdminCommandePage({ params }: { params: Params }) {
  const { id } = await params;

  const order = await safeQuery(
    () =>
      prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      }),
    null,
    "commande admin",
  );

  if (!order) notFound();

  const status = ORDER_STATUS[order.status as OrderStatusKey];

  return (
    <div className="space-y-12">
      <header>
        <Link href="/admin/commandes" className="label link-sweep">
          ← Toutes les commandes
        </Link>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="display-xl">{order.number}</h1>
            <p className="mt-3 text-sm text-[color:var(--color-smoke)]">
              {order.createdAt.toLocaleString("fr-FR")} — {order.email}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="tag tag-solid">{status.label}</span>
            <span className="font-mono text-xl">{formatPrice(order.total)}</span>
          </div>
        </div>
      </header>

      <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div className="space-y-12">
          <section>
            <h2 className="label mb-5 text-[color:var(--color-smoke)]">Articles</h2>

            <div className="hairline">
              {order.items.map((item) => (
                <article key={item.id} className="hairline-b flex items-center gap-4 py-4">
                  <div className="relative aspect-4/5 w-[54px] shrink-0 overflow-hidden bg-[color:var(--color-paper-pure)]">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt="" fill sizes="54px" className="object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center bg-[color:var(--color-ash)]">
                        <span className="display text-sm opacity-30">NB</span>
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.productName}</p>
                    <p className="label-sm mt-1.5 text-[color:var(--color-smoke)]">
                      {item.variantName} — ×{item.quantity}
                      {item.podVariantId && ` — Printify ${item.podVariantId}`}
                    </p>
                  </div>

                  <span className="font-mono text-sm">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </article>
              ))}
            </div>

            <dl className="mt-5 space-y-2 text-sm">
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
                <dd className="font-mono">{formatPrice(order.shipping)}</dd>
              </div>
              <div className="hairline flex justify-between pt-3">
                <dt className="label">Total</dt>
                <dd className="font-mono text-base">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="grid gap-10 sm:grid-cols-2">
            <div>
              <h2 className="label mb-4 text-[color:var(--color-smoke)]">Livraison</h2>
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
                  {order.shippingPhone && (
                    <>
                      <br />
                      {order.shippingPhone}
                    </>
                  )}
                </address>
              ) : (
                <p className="text-sm text-[color:var(--color-smoke)]">
                  Adresse non renseignée (paiement non finalisé).
                </p>
              )}
            </div>

            <div>
              <h2 className="label mb-4 text-[color:var(--color-smoke)]">Client</h2>
              {order.user ? (
                <p className="text-sm leading-relaxed">
                  {`${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim() ||
                    "Sans nom"}
                  <br />
                  {order.user.email}
                  <br />
                  <Link
                    href={`/admin/clients?q=${encodeURIComponent(order.user.email)}`}
                    className="label-sm link-sweep"
                  >
                    Voir la fiche →
                  </Link>
                </p>
              ) : (
                <p className="text-sm text-[color:var(--color-smoke)]">
                  Commande passée sans compte ({order.email}).
                </p>
              )}

              <h2 className="label mb-3 mt-8 text-[color:var(--color-smoke)]">Paiement</h2>
              <p className="text-sm leading-relaxed text-[color:var(--color-smoke)]">
                {order.stripePaymentIntentId ? (
                  <span className="font-mono text-xs">{order.stripePaymentIntentId}</span>
                ) : (
                  "Aucun paiement confirmé."
                )}
              </p>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="border border-[color:var(--color-hairline)] p-6">
            <h2 className="label mb-6">Gestion</h2>

            <OrderAdminForm
              order={{
                id: order.id,
                status: order.status,
                trackingNumber: order.trackingNumber,
                trackingUrl: order.trackingUrl,
                podOrderId: order.podOrderId,
              }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
