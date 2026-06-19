import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import type { PaidProAccountData } from "@/lib/pro/paymentActivation";
import {
  applyPremiumDiscountCents,
  isPremiumDiscountCode,
  normalizePromoCode,
  PREMIUM_DISCOUNT_PERCENT,
} from "@/lib/pro/promoCodes";
import { readSignupToken } from "@/lib/pro/signupToken";

const PRO_PRICE_CENTS = 4900;
const SETUP_HELP_PRICE_CENTS = 1999;

function getAppUrl(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
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

function buildSignupMetadata(data: PaidProAccountData) {
  const metadata: Record<string, string> = {
    directProSignup: "1",
    companyName: data.companyName,
    slug: data.slug,
    ownerEmail: data.ownerEmail,
    passwordHash: data.passwordHash,
    firebaseApiKey: data.firebaseApiKey,
    firebaseAuthDomain: data.firebaseAuthDomain,
    firebaseProjectId: data.firebaseProjectId,
    firebaseAppId: data.firebaseAppId,
  };

  if (data.firebaseStorageBucket) {
    metadata.firebaseStorageBucket = data.firebaseStorageBucket;
  }

  if (data.firebaseMessagingSenderId) {
    metadata.firebaseMessagingSenderId = data.firebaseMessagingSenderId;
  }

  return metadata;
}

function buildLineItems(input: {
  companyName: string;
  setupHelp: boolean;
  promoCode: string;
}): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const hasPremiumDiscount = isPremiumDiscountCode(input.promoCode);
  const premiumPriceCents = hasPremiumDiscount
    ? applyPremiumDiscountCents(PRO_PRICE_CENTS)
    : PRO_PRICE_CENTS;
  const items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price_data: {
        currency: "eur",
        product_data: {
          name: "Compte pro LRT",
          description: hasPremiumDiscount
            ? `Activation du compte ${input.companyName} avec reduction premium.`
            : `Activation du compte ${input.companyName}.`,
        },
        unit_amount: premiumPriceCents,
      },
      quantity: 1,
    },
  ];

  if (input.setupHelp) {
    items.push({
      price_data: {
        currency: "eur",
        product_data: {
          name: "Aide parametrage LRT",
          description:
            "Rendez-vous pour aider a parametrer et installer le compte.",
        },
        unit_amount: SETUP_HELP_PRICE_CENTS,
      },
      quantity: 1,
    });
  }

  return items;
}

function successUrl(request: Request, setupHelp: boolean) {
  const path = setupHelp ? "/pro/aide-installation" : "/pro/merci";
  return `${getAppUrl(request)}${path}?session_id={CHECKOUT_SESSION_ID}`;
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
  const signupToken =
    typeof body.signupToken === "string" ? body.signupToken.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const setupHelp = body.setupHelp === true;
  const promoCode = normalizePromoCode(
    typeof body.promoCode === "string" ? body.promoCode : "",
  );

  if (promoCode && !isPremiumDiscountCode(promoCode)) {
    return NextResponse.json(
      { error: "Code de reduction invalide." },
      { status: 400 },
    );
  }

  if (!pendingSignupId && !signupToken && !slug) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Paiement non configure pour le moment." },
      { status: 503 },
    );
  }

  if (signupToken) {
    const signup = readSignupToken(signupToken);

    if (!signup) {
      return NextResponse.json(
        {
          error:
            "Inscription expiree. Retournez a l inscription et validez le formulaire a nouveau.",
        },
        { status: 400 },
      );
    }

    const effectivePromoCode = isPremiumDiscountCode(promoCode)
      ? promoCode
      : normalizePromoCode(signup.premiumDiscountCode);
    const discountApplied = isPremiumDiscountCode(effectivePromoCode);

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: signup.ownerEmail,
        client_reference_id: signup.slug,
        line_items: buildLineItems({
          companyName: signup.companyName,
          setupHelp,
          promoCode: effectivePromoCode,
        }),
        metadata: {
          ...buildSignupMetadata(signup),
          setupHelp: setupHelp ? "1" : "0",
          premiumDiscountApplied: discountApplied ? "1" : "0",
          premiumDiscountPercent: discountApplied
            ? String(PREMIUM_DISCOUNT_PERCENT)
            : "0",
        },
        success_url: successUrl(request, setupHelp),
        cancel_url: `${getAppUrl(request)}/pro/paiement?${new URLSearchParams({
          inscriptionToken: signupToken,
        }).toString()}`,
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
        line_items: buildLineItems({
          companyName: pendingSignup.companyName,
          setupHelp,
          promoCode,
        }),
        metadata: {
          pendingProSignupId: pendingSignup.id,
          setupHelp: setupHelp ? "1" : "0",
          premiumDiscountApplied: isPremiumDiscountCode(promoCode) ? "1" : "0",
          premiumDiscountPercent: isPremiumDiscountCode(promoCode)
            ? String(PREMIUM_DISCOUNT_PERCENT)
            : "0",
        },
        success_url: successUrl(request, setupHelp),
        cancel_url: `${getAppUrl(request)}/pro/paiement?${new URLSearchParams({
          inscription: pendingSignup.id,
        }).toString()}`,
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
      redirectUrl: `/pro/premium?compte=${proAccount.slug}`,
    });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: proAccount.ownerEmail,
      line_items: buildLineItems({
        companyName: proAccount.companyName,
        setupHelp,
        promoCode,
      }),
      metadata: {
        proAccountId: proAccount.id,
        setupHelp: setupHelp ? "1" : "0",
        premiumDiscountApplied: isPremiumDiscountCode(promoCode) ? "1" : "0",
        premiumDiscountPercent: isPremiumDiscountCode(promoCode)
          ? String(PREMIUM_DISCOUNT_PERCENT)
          : "0",
      },
      success_url: successUrl(request, setupHelp),
      cancel_url: `${getAppUrl(request)}/pro/paiement?${new URLSearchParams({
        compte: proAccount.slug,
      }).toString()}`,
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
