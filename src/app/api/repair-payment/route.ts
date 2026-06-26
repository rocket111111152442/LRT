import { NextResponse } from "next/server";
import Stripe from "stripe";
import { normalizeTicketNumber } from "@/lib/ticketFormat";
import { prisma } from "@/lib/prisma";

function getAppUrl(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Paiement non configuré." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const ticketNumber =
    body && typeof body === "object" && "ticket" in body
      ? normalizeTicketNumber(String((body as Record<string, unknown>).ticket))
      : "";

  if (!ticketNumber) {
    return NextResponse.json({ error: "Ticket requis." }, { status: 400 });
  }

  const repair = await prisma.repair.findUnique({
    where: { ticketNumber },
    select: {
      id: true,
      ticketNumber: true,
      proAccountId: true,
      deviceType: true,
      brand: true,
      estimatedPriceCents: true,
      paidAmountCents: true,
    },
  });

  if (!repair) {
    return NextResponse.json({ error: "Réparation introuvable." }, { status: 404 });
  }

  const remaining = Math.max(
    (repair.estimatedPriceCents ?? 0) - (repair.paidAmountCents ?? 0),
    0,
  );
  if (remaining <= 0) {
    return NextResponse.json({ error: "Rien à payer." }, { status: 400 });
  }

  if (!repair.proAccountId) {
    return NextResponse.json(
      { error: "Paiement en ligne indisponible pour cet atelier." },
      { status: 400 },
    );
  }

  const shop = await prisma.proAccount.findUnique({
    where: { id: repair.proAccountId },
    select: { stripeAccountId: true, stripeOnboarded: true, companyName: true },
  });

  if (!shop?.stripeAccountId || !shop.stripeOnboarded) {
    return NextResponse.json(
      { error: "Cet atelier n'a pas encore activé le paiement en ligne." },
      { status: 400 },
    );
  }

  const appUrl = getAppUrl(request);

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Réparation ${repair.ticketNumber ?? ""} — ${repair.deviceType} ${repair.brand}`.trim(),
            },
            unit_amount: remaining,
          },
          quantity: 1,
        },
      ],
      // Charge "destination" : les fonds sont transférés au compte de l'atelier.
      payment_intent_data: {
        transfer_data: { destination: shop.stripeAccountId },
      },
      metadata: { repairPayment: "1", repairId: repair.id },
      success_url: `${appUrl}/suivi?ticket=${encodeURIComponent(repair.ticketNumber ?? "")}&paid=1`,
      cancel_url: `${appUrl}/suivi?ticket=${encodeURIComponent(repair.ticketNumber ?? "")}`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Paiement impossible." }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl: session.url });
  } catch {
    return NextResponse.json({ error: "Paiement impossible pour le moment." }, { status: 500 });
  }
}
