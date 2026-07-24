import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { activatePaidCheckoutSession } from "@/lib/pro/paymentActivation";
import { activateEnterpriseCheckoutSession } from "@/lib/pro/enterpriseActivation";
import { restoreFullPremiumPriceForRenewals } from "@/lib/stripeDiscounts";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook non configure." },
      { status: 503 },
    );
  }

  const stripe = new Stripe(secretKey);
  const rawBody = await request.text();
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (session.metadata?.enterprise === "1") {
      // Offre entreprise sur mesure : on active tout ce que le client a choisi.
      await activateEnterpriseCheckoutSession(session);
    } else if (session.metadata?.planUpgrade === "1") {
      const { optionId, proAccountId } = session.metadata;
      if (proAccountId && optionId) {
        await prisma.proAccount.update({
          where: { id: proAccountId },
          data: { plan: optionId },
        });
      }
    } else {
      await activatePaidCheckoutSession(session);
      await restoreFullPremiumPriceForRenewals(stripe, session);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const proAccountId = session.metadata?.proAccountId;
    const pendingSignupId =
      session.metadata?.pendingProSignupId ?? session.client_reference_id;

    if (proAccountId) {
      await prisma.proAccount.update({
        where: { id: proAccountId },
        data: {
          paymentStatus: "CANCELED",
          stripeSessionId: session.id,
        },
      });
    }

    if (pendingSignupId) {
      await prisma.pendingProSignup
        .delete({ where: { id: pendingSignupId } })
        .catch(() => null);
    }
  }

  return NextResponse.json({ received: true });
}
