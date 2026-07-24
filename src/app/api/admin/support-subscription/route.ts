import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getPublicAppUrl } from "@/lib/appUrl";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SUPPORT_PRICE_CENTS = 2999;

function getStripeErrorMessage(error: unknown) {
  if (
    error instanceof Stripe.errors.StripeAuthenticationError ||
    (error instanceof Error && error.message.includes("Invalid API Key"))
  ) {
    return "Cle secrete Stripe invalide.";
  }

  return "Activation du support impossible pour le moment.";
}

export async function POST() {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  if (!admin.user.proAccountId) {
    return NextResponse.json({ error: "Compte pro introuvable." }, { status: 404 });
  }

  const proAccount = await prisma.proAccount.findUnique({
    where: { id: admin.user.proAccountId },
    select: {
      id: true,
      companyName: true,
      ownerEmail: true,
      supportIncluded: true,
    },
  });

  if (!proAccount) {
    return NextResponse.json({ error: "Compte pro introuvable." }, { status: 404 });
  }

  if (proAccount.supportIncluded) {
    return NextResponse.json({ redirectUrl: "/service-client" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Paiement Stripe non configure pour le moment." },
      { status: 503 },
    );
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: proAccount.ownerEmail,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Assistance Qoravo annuelle",
              description:
                `Acces annuel au service client Qoravo pour ${proAccount.companyName}.`,
            },
            recurring: {
              interval: "year",
            },
            unit_amount: SUPPORT_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: {
        supportOnly: "1",
        proAccountId: proAccount.id,
      },
      success_url: `${getPublicAppUrl()}/service-client?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getPublicAppUrl()}/admin`,
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
