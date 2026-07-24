import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getPublicAppUrl } from "@/lib/appUrl";
import { prisma } from "@/lib/prisma";
import { createPendingProSignup } from "@/lib/pro/paymentActivation";
import {
  applyPremiumDiscountCents,
  isPremiumDiscountCode,
  normalizePromoCode,
  PREMIUM_DISCOUNT_PERCENT,
} from "@/lib/pro/promoCodes";
import { readSignupToken } from "@/lib/pro/signupToken";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const PRO_PRICE_CENTS = 8999;
const SETUP_HELP_PRICE_CENTS = 2999;
const PREMIUM_FULL_PRICE_CENTS = PRO_PRICE_CENTS;
const PREMIUM_FIRST_YEAR_DISCOUNT_PRICE_CENTS =
  applyPremiumDiscountCents(PRO_PRICE_CENTS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function dateValue(value: unknown) {
  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate();
  }

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
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
          name: "Compte pro Qoravo annuel",
          description: hasPremiumDiscount
            ? `Abonnement annuel du compte ${input.companyName} avec reduction premium appliquee uniquement la premiere annee.`
            : `Abonnement annuel du compte ${input.companyName}.`,
        },
        recurring: {
          interval: "year",
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
          name: "Assistance Qoravo annuelle",
          description:
            "Acces annuel au service client Qoravo et aide au parametrage.",
        },
        recurring: {
          interval: "year",
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
  return `${getPublicAppUrl()}${path}?session_id={CHECKOUT_SESSION_ID}`;
}

export async function POST(request: Request) {
  const limit = rateLimit(
    `payment-session:${clientIp(request)}`,
    10,
    15 * 60 * 1000,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives de paiement. Reessayez plus tard." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

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
      // Les donnees d'inscription (dont le hash du mot de passe) restent dans
      // notre base. Stripe ne recoit qu'un identifiant opaque.
      const pendingSignup = await createPendingProSignup(signup);
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: signup.ownerEmail,
        client_reference_id: pendingSignup.id,
        line_items: buildLineItems({
          companyName: signup.companyName,
          setupHelp,
          promoCode: effectivePromoCode,
        }),
        metadata: {
          pendingProSignupId: pendingSignup.id,
          setupHelp: setupHelp ? "1" : "0",
          premiumDiscountApplied: discountApplied ? "1" : "0",
          premiumDiscountFirstYearOnly: discountApplied ? "1" : "0",
          premiumFullPriceCents: String(PREMIUM_FULL_PRICE_CENTS),
          premiumDiscountedPriceCents: discountApplied
            ? String(PREMIUM_FIRST_YEAR_DISCOUNT_PRICE_CENTS)
            : "0",
          premiumDiscountPercent: discountApplied
            ? String(PREMIUM_DISCOUNT_PERCENT)
            : "0",
        },
        success_url: successUrl(request, setupHelp),
        cancel_url: `${getPublicAppUrl()}/pro/paiement?${new URLSearchParams({
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

  if (pendingSignupId) {
    const pendingSignup = await prisma.pendingProSignup.findUnique({
      where: { id: pendingSignupId },
      select: {
        id: true,
        companyName: true,
        slug: true,
        ownerEmail: true,
        createdAt: true,
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

    const pendingCreatedAt = dateValue(pendingSignup.createdAt);

    if (
      !pendingCreatedAt ||
      pendingCreatedAt.getTime() < Date.now() - 24 * 60 * 60 * 1000
    ) {
      await prisma.pendingProSignup
        .delete({ where: { id: pendingSignup.id } })
        .catch(() => null);

      return NextResponse.json(
        { error: "Cette inscription a expire. Recommencez l inscription." },
        { status: 410 },
      );
    }

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
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
          premiumDiscountFirstYearOnly: isPremiumDiscountCode(promoCode)
            ? "1"
            : "0",
          premiumFullPriceCents: String(PREMIUM_FULL_PRICE_CENTS),
          premiumDiscountedPriceCents: isPremiumDiscountCode(promoCode)
            ? String(PREMIUM_FIRST_YEAR_DISCOUNT_PRICE_CENTS)
            : "0",
          premiumDiscountPercent: isPremiumDiscountCode(promoCode)
            ? String(PREMIUM_DISCOUNT_PERCENT)
            : "0",
        },
        success_url: successUrl(request, setupHelp),
        cancel_url: `${getPublicAppUrl()}/pro/paiement?${new URLSearchParams({
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
      mode: "subscription",
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
        premiumDiscountFirstYearOnly: isPremiumDiscountCode(promoCode)
          ? "1"
          : "0",
        premiumFullPriceCents: String(PREMIUM_FULL_PRICE_CENTS),
        premiumDiscountedPriceCents: isPremiumDiscountCode(promoCode)
          ? String(PREMIUM_FIRST_YEAR_DISCOUNT_PRICE_CENTS)
          : "0",
        premiumDiscountPercent: isPremiumDiscountCode(promoCode)
          ? String(PREMIUM_DISCOUNT_PERCENT)
          : "0",
      },
      success_url: successUrl(request, setupHelp),
      cancel_url: `${getPublicAppUrl()}/pro/paiement?${new URLSearchParams({
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
