import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const PRO_PRICE_CENTS = 999;

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStripeErrorMessage(error: unknown) {
  if (
    error instanceof Stripe.errors.StripeAuthenticationError ||
    (error instanceof Error && error.message.includes("Invalid API Key"))
  ) {
    return "Cle secrete Stripe invalide. Copiez une nouvelle cle secrete depuis Stripe, collez-la dans .env, puis redemarrez le serveur.";
  }

  if (error instanceof Stripe.errors.StripeConnectionError) {
    return "Connexion a Stripe impossible. Verifiez votre connexion internet, puis reessayez dans quelques minutes.";
  }

  if (error instanceof Error && error.message) {
    return "Stripe a refuse la creation du paiement. Verifiez la configuration Stripe.";
  }

  return "Paiement impossible pour le moment.";
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 400 });
  }

  const pendingSignupId =
    typeof body.pendingSignupId === "string" ? body.pendingSignupId.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";

  if (!pendingSignupId && !slug) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Paiement non configure pour le moment." },
      { status: 503 },
    );
  }

  if (pendingSignupId) {
    const pendingSignup = await prisma.pendingProSignup.findUnique({
      where: { id: pendingSignupId },
      select: {
        id: true,
        companyName: true,
        slug: true,
        ownerEmail: true,
      },
    });

    if (!pendingSignup) {
      return NextResponse.json(
        {
          error:
            "Inscription introuvable. Recommencez l inscription pour ouvrir le paiement.",
        },
        { status: 404 },
      );
    }

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: pendingSignup.ownerEmail,
        client_reference_id: pendingSignup.id,
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Compte pro LRT",
                description: `Activation du compte ${pendingSignup.companyName}.`,
              },
              unit_amount: PRO_PRICE_CENTS,
            },
            quantity: 1,
          },
        ],
        metadata: {
          pendingProSignupId: pendingSignup.id,
        },
        success_url: `${getAppUrl()}/pro/merci?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getAppUrl()}/pro/paiement?inscription=${pendingSignup.id}`,
      });

      if (!session.url) {
        return NextResponse.json(
          { error: "Session Stripe impossible a creer." },
          { status: 500 },
        );
      }

      await prisma.pendingProSignup.update({
        where: { id: pendingSignup.id },
        data: { stripeSessionId: session.id },
      });

      return NextResponse.json({ checkoutUrl: session.url });
    } catch (error) {
      return NextResponse.json(
        { error: getStripeErrorMessage(error) },
        { status: 500 },
      );
    }
  }

  const proAccount = await prisma.proAccount.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      companyName: true,
      ownerEmail: true,
      paymentStatus: true,
    },
  });

  if (!proAccount) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }

  if (proAccount.paymentStatus === "PAID") {
    return NextResponse.json({
      redirectUrl: `${getAppUrl()}/pro/premium?compte=${proAccount.slug}`,
    });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: proAccount.ownerEmail,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Compte pro LRT",
              description: `Activation du compte ${proAccount.companyName}.`,
            },
            unit_amount: PRO_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: {
        proAccountId: proAccount.id,
      },
      success_url: `${getAppUrl()}/pro/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getAppUrl()}/pro/paiement?compte=${proAccount.slug}`,
    });

    await prisma.proAccount.update({
      where: { id: proAccount.id },
      data: { stripeSessionId: session.id },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Session Stripe impossible a creer." },
        { status: 500 },
      );
    }

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: getStripeErrorMessage(error) },
      { status: 500 },
    );
  }
}
