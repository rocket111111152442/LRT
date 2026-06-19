import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEmailCode } from "@/lib/emailVerification";
import {
  createPaidProAccount,
  PaidProAccountData,
} from "@/lib/pro/paymentActivation";
import {
  isFreeAccessCode,
  isPremiumDiscountCode,
  PREMIUM_DISCOUNT_CODE,
} from "@/lib/pro/promoCodes";
import { createSignupToken } from "@/lib/pro/signupToken";
import { validateProSignupInput } from "@/lib/pro/signupValidation";

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
    const usesFreeAccessCode = isFreeAccessCode(validation.data.promoCode);
    const usesPremiumDiscountCode = isPremiumDiscountCode(validation.data.promoCode);
    const conflict = await removeOldUnpaidAccounts(
      validation.data.ownerEmail,
      validation.data.slug,
    );

    if (conflict) {
      return NextResponse.json(conflict, { status: 400 });
    }

    if (!usesFreeAccessCode) {
      const isEmailVerified = await verifyEmailCode(
        validation.data.ownerEmail,
        "SIGNUP",
        validation.data.emailCode ?? "",
        validation.data.emailVerificationId,
      );

      if (!isEmailVerified) {
        return NextResponse.json(
          {
            error: "Code email invalide ou expire.",
            errors: { emailCode: "Code invalide ou expire." },
          },
          { status: 400 },
        );
      }
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
        redirectUrl: `/pro/premium?compte=${proAccount.slug}`,
      });
    }

    const signupToken = createSignupToken(accountData);
    const paymentParams = new URLSearchParams({
      inscriptionToken: signupToken,
    });

    if (usesPremiumDiscountCode) {
      paymentParams.set("promoCode", PREMIUM_DISCOUNT_CODE);
    }

    return NextResponse.json({
      redirectUrl: `/pro/paiement?${paymentParams.toString()}`,
    });
  } catch (error) {
    console.error("Pro signup checkout failed", error);
    return NextResponse.json(
      {
        error:
          "Inscription impossible pour le moment. Verifiez la configuration de la base LRT sur Vercel, puis reessayez.",
      },
      { status: 500 },
    );
  }
}
