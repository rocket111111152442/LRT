import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { activatePaidCheckoutSession } from "@/lib/pro/paymentActivation";

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
    await activatePaidCheckoutSession(event.data.object);
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const proAccountId = session.metadata?.proAccountId;

    if (proAccountId) {
      await prisma.proAccount.update({
        where: { id: proAccountId },
        data: {
          paymentStatus: "CANCELED",
          stripeSessionId: session.id,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
