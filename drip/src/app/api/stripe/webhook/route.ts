import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { fulfillCheckoutSession, markOrderExpired } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

// Le corps brut est indispensable : Stripe signe les octets exacts du payload,
// toute reformulation JSON invaliderait la signature.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET non configuré." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature absente." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    // Signature invalide : la requête ne vient pas de Stripe, on refuse sans
    // exécuter la moindre logique métier.
    return NextResponse.json(
      {
        error: `Signature invalide : ${
          error instanceof Error ? error.message : "erreur inconnue"
        }`,
      },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // `payment_status` vaut "unpaid" pour les moyens de paiement différés :
        // on n'envoie en production qu'une fois l'argent réellement encaissé.
        if (session.payment_status === "paid") {
          await fulfillCheckoutSession(session);
        }
        break;
      }

      case "checkout.session.async_payment_succeeded": {
        await fulfillCheckoutSession(event.data.object as Stripe.Checkout.Session);
        break;
      }

      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        await markOrderExpired(event.data.object as Stripe.Checkout.Session);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string" ? charge.payment_intent : null;

        if (paymentIntentId) {
          await prisma.order.updateMany({
            where: { stripePaymentIntentId: paymentIntentId },
            data: { status: "REFUNDED" },
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`[stripe] échec du traitement de ${event.type} :`, error);
    // On renvoie 500 pour que Stripe rejoue l'événement : le traitement est
    // idempotent, un rejeu ne crée pas de doublon.
    return NextResponse.json({ error: "Traitement impossible." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
