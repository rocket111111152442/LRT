import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { fulfillCheckoutSession } from "@/lib/orders";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { getCurrentUser } from "@/lib/auth";
import { SHOP } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Commande confirmée",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ session_id?: string }>;

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId || !stripeEnabled()) {
    return <Fallback />;
  }

  // Filet de sécurité : si le webhook n'est pas encore configuré (ou arrive en
  // retard), on confirme la commande ici. `fulfillCheckoutSession` est
  // idempotent, un double appel ne crée pas de doublon.
  const order = await safeQuery(
    async () => {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        await fulfillCheckoutSession(session);
      }

      return prisma.order.findUnique({
        where: { stripeSessionId: sessionId },
        include: { items: true },
      });
    },
    null,
    "confirmation de commande",
  );

  if (!order) return <Fallback />;

  const user = await getCurrentUser();

  return (
    <div className="shell py-16 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="label mb-6 text-[color:var(--color-smoke)]">
          (Commande {order.number})
        </p>

        <h1 className="display-xl mb-6 max-w-[16ch]">
          <span className="reveal-mask">
            <span>Merci.</span>
          </span>
          <span className="reveal-mask" style={{ ["--reveal-delay" as string]: "90ms" }}>
            <span>C&apos;est validé.</span>
          </span>
        </h1>

        <p className="reveal mb-12 max-w-[54ch] text-base leading-relaxed text-[color:var(--color-ink-soft)]">
          Le reçu de paiement est envoyé à{" "}
          <span className="font-medium">{order.email}</span>. Votre pièce part
          en fabrication : comptez 2 à 5 jours ouvrés de confection, puis 2 à 4
          jours de livraison. Gardez le numéro {order.number} sous la main pour
          toute question.
        </p>

        <section className="hairline">
          {order.items.map((item) => (
            <article key={item.id} className="hairline-b flex items-center gap-5 py-5">
              <div className="relative aspect-4/5 w-[72px] shrink-0 overflow-hidden bg-[color:var(--color-paper-pure)]">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt="" fill sizes="72px" className="object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center bg-[color:var(--color-ash)]">
                    <span className="display text-lg opacity-30">NB</span>
                  </span>
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">{item.productName}</p>
                <p className="label-sm mt-1.5 text-[color:var(--color-smoke)]">
                  {item.variantName} — ×{item.quantity}
                </p>
              </div>

              <span className="font-mono text-sm">
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
            </article>
          ))}
        </section>

        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[color:var(--color-smoke)]">Sous-total</dt>
            <dd className="font-mono">{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-[color:var(--color-smoke)]">Remise</dt>
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
            <dt className="label">Total payé</dt>
            <dd className="font-mono text-lg">{formatPrice(order.total)}</dd>
          </div>
        </dl>

        {order.shippingLine1 && (
          <div className="mt-10">
            <p className="label mb-3 text-[color:var(--color-smoke)]">Livraison</p>
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
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-3">
          {user ? (
            <Link href={`/compte/commandes/${order.id}`} className="btn">
              Suivre ma commande
            </Link>
          ) : (
            <Link href="/inscription" className="btn">
              Créer mon compte
            </Link>
          )}
          <Link href="/boutique" className="btn btn-outline">
            Continuer mes achats
          </Link>
        </div>

        {!user && (
          <p className="mt-6 max-w-[54ch] text-xs text-[color:var(--color-smoke)]">
            Créez un compte avec l&apos;adresse {order.email} pour retrouver
            cette commande, suivre son acheminement et laisser un avis une fois
            la pièce reçue.
          </p>
        )}

        <p className="mt-10 text-xs text-[color:var(--color-smoke)]">
          Une question ? Écrivez-nous à{" "}
          <a href={`mailto:${SHOP.email}`} className="link-underline">
            {SHOP.email}
          </a>{" "}
          en précisant le numéro {order.number}.
        </p>
      </div>
    </div>
  );
}

function Fallback() {
  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center gap-6 py-24 text-center">
      <h1 className="display-lg">Commande introuvable</h1>
      <p className="max-w-[46ch] text-sm text-[color:var(--color-smoke)]">
        Nous n&apos;avons pas retrouvé cette commande. Si le paiement est
        passé, le reçu Stripe se trouve dans votre boîte mail : envoyez-le-nous
        et nous retrouvons la commande.
      </p>
      <div className="flex gap-3">
        <Link href="/boutique" className="btn">
          Retour à la boutique
        </Link>
        <Link href="/contact" className="btn btn-outline">
          Nous écrire
        </Link>
      </div>
    </div>
  );
}
