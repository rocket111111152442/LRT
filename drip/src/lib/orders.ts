import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe, appUrl } from "@/lib/stripe";
import { readCart, clearCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { ORDER_PREFIX, shippingFor, SHIPPING_COUNTRIES, SHOP } from "@/lib/shop";
import { createPrintifyOrder, printifyEnabled } from "@/lib/printify";

/** Numéro lisible et séquentiel : NB-000042. */
async function nextOrderNumber() {
  const count = await prisma.order.count();
  return `${ORDER_PREFIX}-${String(count + 1).padStart(6, "0")}`;
}

/**
 * Erreur dont le message est écrit pour le client.
 *
 * Tout le reste — une erreur Stripe, une panne de base — porte un message
 * technique, en anglais, qui n'a rien à faire sur une page de boutique. La
 * distinction se fait ici pour que l'appelant sache lequel il peut afficher.
 */
export class ErreurBoutique extends Error {}

export type CouponResult =
  | { ok: true; code: string; discount: number; freeShipping: boolean }
  | { ok: false; reason: string };

export async function applyCoupon(
  code: string,
  subtotal: number,
): Promise<CouponResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, reason: "Code vide." };

  const coupon = await prisma.coupon.findUnique({ where: { code: normalized } });

  if (!coupon || !coupon.active) {
    return { ok: false, reason: "Ce code promo n'existe pas." };
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { ok: false, reason: "Ce code n'est pas encore actif." };
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { ok: false, reason: "Ce code a expiré." };
  }
  if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) {
    return { ok: false, reason: "Ce code a atteint sa limite d'utilisation." };
  }
  if (subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      reason: `Ce code s'applique à partir de ${(coupon.minSubtotal / 100).toFixed(0)} €.`,
    };
  }

  // La livraison offerte ne touche pas au prix des pièces : elle annule le
  // port au moment de calculer le total, et la remise reste nulle.
  if (coupon.type === "FREE_SHIPPING") {
    return { ok: true, code: normalized, discount: 0, freeShipping: true };
  }

  const discount =
    coupon.type === "PERCENT"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);

  return { ok: true, code: normalized, discount, freeShipping: false };
}

/**
 * Crée la commande en base (statut PENDING) puis la session Stripe Checkout.
 *
 * Les prix envoyés à Stripe sont relus depuis la base, jamais depuis le
 * navigateur : un client qui modifierait le panier côté client ne peut pas
 * changer le montant réellement débité.
 */
export async function createCheckoutSession(couponCode?: string) {
  const cart = await readCart();
  const user = await getCurrentUser();

  const lines = cart.lines.filter((line) => line.available);

  if (lines.length === 0) {
    throw new ErreurBoutique("Votre panier est vide.");
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  let discount = 0;
  let appliedCode: string | null = null;
  let portOffert = false;

  if (couponCode) {
    const result = await applyCoupon(couponCode, subtotal);
    if (result.ok) {
      discount = result.discount;
      appliedCode = result.code;
      portOffert = result.freeShipping;
    }
  }

  const shipping = portOffert ? 0 : shippingFor(subtotal);
  const total = Math.max(0, subtotal - discount) + shipping;

  const variants = await prisma.variant.findMany({
    where: { id: { in: lines.map((line) => line.variantId) } },
    include: {
      product: { select: { id: true, slug: true, name: true, podProductId: true } },
    },
  });
  const variantById = new Map(variants.map((variant) => [variant.id, variant]));

  const order = await prisma.order.create({
    data: {
      number: await nextOrderNumber(),
      userId: user?.id ?? null,
      email: user?.email ?? "",
      status: "PENDING",
      subtotal,
      shipping,
      discount,
      total,
      couponCode: appliedCode,
      items: {
        create: lines.map((line) => {
          const variant = variantById.get(line.variantId);
          return {
            variantId: line.variantId,
            productId: variant?.product.id ?? null,
            productName: variant?.product.name ?? line.product.name,
            productSlug: variant?.product.slug ?? line.product.slug,
            variantName: line.variantName,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
            imageUrl: line.product.imageUrl,
            podProductId: variant?.product.podProductId ?? null,
            podVariantId: variant?.podVariantId ?? null,
          };
        }),
      },
    },
  });

  const stripe = getStripe();
  const base = appUrl();

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = lines.map(
    (line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "eur",
        unit_amount: line.unitPrice,
        product_data: {
          name: line.product.name,
          description: line.variantName,
          images: line.product.imageUrl?.startsWith("https://")
            ? [line.product.imageUrl]
            : undefined,
        },
      },
    }),
  );

  // La remise est passée à Stripe comme un coupon ponctuel : le montant affiché
  // au client correspond exactement au total calculé côté serveur.
  const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];

  if (discount > 0 && appliedCode) {
    const stripeCoupon = await stripe.coupons.create({
      amount_off: discount,
      currency: "eur",
      duration: "once",
      name: appliedCode,
    });
    discounts.push({ coupon: stripeCoupon.id });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    // Stripe refuse `discounts` et `allow_promotion_codes` dans la même
    // requête, y compris quand le second vaut `false` : la clé compte comme
    // « spécifiée ». Quand un code est déjà appliqué côté boutique, on n'envoie
    // donc que la remise ; sinon on ferme explicitement le champ de Stripe pour
    // qu'aucun code inconnu de la boutique ne passe par là.
    ...(discounts.length > 0
      ? { discounts }
      : { allow_promotion_codes: false as const }),
    customer_email: user?.email || undefined,
    client_reference_id: order.id,
    metadata: { orderId: order.id, orderNumber: order.number },
    payment_intent_data: {
      metadata: { orderId: order.id, orderNumber: order.number },
      // Reçu envoyé par Stripe, sans service d'e-mail à installer. Pour un
      // visiteur non connecté l'adresse n'est connue qu'après le paiement :
      // elle est alors renseignée depuis le webhook.
      receipt_email: user?.email || undefined,
    },
    shipping_address_collection: {
      allowed_countries: [...SHIPPING_COUNTRIES] as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
    },
    phone_number_collection: { enabled: true },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name:
            shipping === 0
              ? portOffert
                ? `Livraison offerte — code ${appliedCode}`
                : "Livraison offerte"
              : "Livraison standard suivie",
          fixed_amount: { amount: shipping, currency: "eur" },
          delivery_estimate: {
            minimum: { unit: "business_day", value: 2 },
            maximum: { unit: "business_day", value: 5 },
          },
        },
      },
    ],
    success_url: `${base}/commande/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/panier?annule=1`,
    // Une session abandonnée expire au bout de 30 minutes : la commande PENDING
    // correspondante sera nettoyée.
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    // Sans cela Stripe suivrait la langue du navigateur : un client sur un
    // navigateur anglais verrait une page de paiement en anglais.
    locale: "fr",
    custom_text: {
      submit: {
        message: `Votre équipement ${SHOP.name} est fabriqué à la commande, puis expédié sous 2 à 5 jours ouvrés.`,
      },
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  if (!session.url) {
    throw new Error("Stripe n'a pas renvoyé d'URL de paiement.");
  }

  return { url: session.url, orderId: order.id };
}

/**
 * Appelé par le webhook Stripe quand le paiement est confirmé.
 * Idempotent : rejouer le même événement ne recrée ni la commande Printify ni
 * l'incrément du compteur de coupon.
 */
export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId ?? session.client_reference_id;
  if (!orderId) return;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  if (order.status !== "PENDING") return; // déjà traité

  // Stripe a déplacé l'adresse de livraison sous `collected_information` ; le
  // champ de premier niveau ne survit que sur d'anciennes versions de l'API. On
  // lit les deux, puis on se rabat sur l'adresse de facturation — un client qui
  // paie sans que la boutique sache où livrer serait le pire des cas.
  const collected = session.collected_information?.shipping_details ?? null;
  const legacy =
    (session as unknown as {
      shipping_details?: { name?: string | null; address?: Stripe.Address | null };
    }).shipping_details ?? null;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);
  const emailClient = session.customer_details?.email ?? null;

  const livraison = collected ?? legacy;
  const address = livraison?.address ?? session.customer_details?.address ?? null;
  const shippingName =
    livraison?.name ??
    session.collected_information?.individual_name ??
    session.customer_details?.name ??
    null;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      email: session.customer_details?.email ?? order.email,
      stripePaymentIntentId: paymentIntentId,
      shippingName,
      shippingLine1: address?.line1 ?? null,
      shippingLine2: address?.line2 ?? null,
      shippingCity: address?.city ?? null,
      shippingPostalCode: address?.postal_code ?? null,
      shippingCountry: address?.country ?? null,
      shippingPhone: session.customer_details?.phone ?? null,
    },
  });

  // Reçu Stripe : sans compte client, l'adresse n'était pas connue au moment
  // de créer la session. On la pose maintenant, ce qui déclenche l'envoi — un
  // reçu automatique, sans service d'e-mail à installer. Un échec ici ne doit
  // rien casser : le client a payé, sa commande est enregistrée.
  if (paymentIntentId && emailClient) {
    try {
      await getStripe().paymentIntents.update(paymentIntentId, {
        receipt_email: emailClient,
      });
    } catch (error) {
      console.error(
        `[commande] reçu Stripe non envoyé pour ${order.number} :`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  if (order.couponCode) {
    await prisma.coupon.updateMany({
      where: { code: order.couponCode },
      data: { uses: { increment: 1 } },
    });
  }

  // Le panier n'est vidé qu'une fois le paiement encaissé : un abandon de
  // paiement laisse le client retrouver sa sélection.
  const cart = order.userId
    ? await prisma.cart.findFirst({ where: { userId: order.userId } })
    : null;
  if (cart) await clearCart(cart.id);

  // Sans adresse complète, la commande ne part pas en fabrication : Printify
  // l'accepterait et imprimerait une étiquette inutilisable. Elle reste au
  // statut payé, visible dans l'administration, et peut être renvoyée à la main
  // une fois l'adresse obtenue auprès du client.
  const adresseComplete = Boolean(
    address?.line1 && address?.city && address?.postal_code && address?.country,
  );

  if (!adresseComplete) {
    console.error(
      `[commande] ${order.number} payée sans adresse de livraison exploitable : ` +
        "fabrication non lancée, à traiter depuis l'administration.",
    );
    return;
  }

  if (printifyEnabled()) {
    try {
      await createPrintifyOrder(order.id);
    } catch (error) {
      // Un échec Printify ne doit pas faire échouer le webhook : Stripe
      // rejouerait l'événement et le client resterait sans confirmation.
      // La commande reste en PAID et peut être renvoyée depuis l'admin.
      console.error(
        `[printify] échec de création pour ${order.number} :`,
        error instanceof Error ? error.message : error,
      );
    }
  }
}

export async function markOrderExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId ?? session.client_reference_id;
  if (!orderId) return;

  await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status: "CANCELED", canceledAt: new Date() },
  });
}
