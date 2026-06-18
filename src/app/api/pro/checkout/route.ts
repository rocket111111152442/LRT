import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  createPaidProAccount,
  PaidProAccountData,
} from "@/lib/pro/paymentActivation";
import { validateProSignupInput } from "@/lib/pro/signupValidation";

const FREE_ACCESS_CODE = "REP2026";
const PRO_PRICE_CENTS = 499;

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function getStripeErrorMessage(error: unknown) {
  if (
    error instanceof Stripe.errors.StripeAuthenticationError ||
    (error instanceof Error && error.message.includes("Invalid API Key"))
  ) {
    return "Cle secrete Stripe invalide. Verifiez la configuration Stripe.";
  }

  if (error instanceof Stripe.errors.StripeConnectionError) {
    return "Connexion a Stripe impossible. Reessayez dans quelques minutes.";
  }

  return "Stripe a refuse la creation du paiement.";
}

async function deleteUnpaidProAccount(id: string | null | undefined) {
  if (!id) {
    return;
  }

  try {
    await prisma.proAccount.delete({ where: { id } });
  } catch {
    // Old pending accounts must not block a new payment attempt.
  }
}

async function removeOldUnpaidAccounts(ownerEmail: string, slug: string) {
  const existingUser = await prisma.user.findUnique({
    where: { email: ownerEmail },
    select: {
      id: true,
      proAccount: {
        select: {
          id: true,
          paymentStatus: true,
        },
      },
    },
  });

  if (existingUser?.proAccount?.paymentStatus === "PAID") {
    return {
      error:
        "Cet email a deja un compte pro. Connectez-vous avec ce compte ou utilisez un autre email.",
      errors: { ownerEmail: "Un compte existe deja avec cet email." },
    };
  }

  if (existingUser?.proAccount) {
    await deleteUnpaidProAccount(existingUser.proAccount.id);
  } else if (existingUser) {
    return {
      error:
        "Cet email a deja un compte admin. Connectez-vous avec ce compte ou utilisez un autre email.",
      errors: { ownerEmail: "Un compte existe deja avec cet email." },
    };
  }

  const existingOwnerAccount = await prisma.proAccount.findUnique({
    where: { ownerEmail },
    select: { id: true, paymentStatus: true },
  });

  if (existingOwnerAccount?.paymentStatus === "PAID") {
    return {
      error:
        "Cet email a deja un compte pro. Connectez-vous avec ce compte ou utilisez un autre email.",
      errors: { ownerEmail: "Un compte existe deja avec cet email." },
    };
  }

  await deleteUnpaidProAccount(existingOwnerAccount?.id);

  const existingSlugAccount = await prisma.proAccount.findUnique({
    where: { slug },
    select: { id: true, paymentStatus: true },
  });

  if (existingSlugAccount?.paymentStatus === "PAID") {
    return {
      error:
        "Cet identifiant QR est deja utilise. Choisissez un autre identifiant.",
      errors: { slug: "Cet identifiant est deja utilise." },
    };
  }

  await deleteUnpaidProAccount(existingSlugAccount?.id);

  return null;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const validation = validateProSignupInput(body);

  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  try {
    const usesFreeAccessCode = validation.data.promoCode === FREE_ACCESS_CODE;
    const conflict = await removeOldUnpaidAccounts(
      validation.data.ownerEmail,
      validation.data.slug,
    );

    if (conflict) {
      return NextResponse.json(conflict, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(validation.data.password, 12);
    const accountData: PaidProAccountData = {
      companyName: validation.data.companyName,
      slug: validation.data.slug,
      ownerEmail: validation.data.ownerEmail,
      passwordHash,
      firebaseApiKey: validation.data.firebaseApiKey,
      firebaseAuthDomain: `${validation.data.firebaseProjectId}.firebaseapp.com`,
      firebaseProjectId: validation.data.firebaseProjectId,
      firebaseStorageBucket: `${validation.data.firebaseProjectId}.appspot.com`,
      firebaseAppId: validation.data.firebaseAppId,
    };

    if (usesFreeAccessCode) {
      const proAccount = await createPaidProAccount(accountData);

      return NextResponse.json({
        redirectUrl: `${getAppUrl()}/pro/premium?compte=${proAccount.slug}`,
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Paiement non configure pour le moment." },
        { status: 503 },
      );
    }

    const pendingSignup = await prisma.pendingProSignup.create({
      data: accountData,
      select: { id: true },
    });

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: validation.data.ownerEmail,
        client_reference_id: pendingSignup.id,
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Compte pro LRT",
                description: `Activation du compte ${validation.data.companyName}.`,
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
        cancel_url: `${getAppUrl()}/pro/inscription`,
      });

      if (!session.url) {
        await prisma.pendingProSignup.delete({ where: { id: pendingSignup.id } });

        return NextResponse.json(
          { error: "Session Stripe impossible a creer." },
          { status: 500 },
        );
      }

      await prisma.pendingProSignup.update({
        where: { id: pendingSignup.id },
        data: { stripeSessionId: session.id },
      });

      return NextResponse.json({ redirectUrl: session.url });
    } catch (error) {
      await prisma.pendingProSignup.delete({ where: { id: pendingSignup.id } });

      return NextResponse.json(
        { error: getStripeErrorMessage(error) },
        { status: 500 },
      );
    }
  } catch {
    return NextResponse.json(
      {
        error:
          "Base de donnees indisponible. Verifiez Prisma ou la configuration Firebase, puis reessayez.",
      },
      { status: 500 },
    );
  }
}
