import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyEmailCode } from "@/lib/emailVerification";
import {
  createPaidProAccount,
  createPendingProSignup,
  createTrialProAccount,
  PaidProAccountData,
} from "@/lib/pro/paymentActivation";
import {
  isFreeAccessCode,
  isPremiumDiscountCode,
  PREMIUM_DISCOUNT_CODE,
} from "@/lib/pro/promoCodes";
import { validateProSignupInput } from "@/lib/pro/signupValidation";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import {
  readTrialOfferToken,
  TRIAL_DURATION_MS,
  TRIAL_OFFER_COOKIE,
} from "@/lib/pro/trialOffer";

function createPrivateSignupSlug(baseSlug: string) {
  const suffix = randomBytes(3).toString("hex");
  return `${baseSlug.slice(0, 41)}-${suffix}`;
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

function isActiveTrial(account?: { paymentStatus?: string | null; trialEndsAt?: Date | string | null } | null) {
  if (account?.paymentStatus !== "TRIAL" || !account.trialEndsAt) {
    return false;
  }

  const trialEndsAt = new Date(account.trialEndsAt);
  return !Number.isNaN(trialEndsAt.getTime()) && trialEndsAt > new Date();
}

async function removeOldUnpaidAccounts(
  ownerEmail: string,
  slug: string,
  startTrial: boolean,
) {
  const existingUser = await prisma.user.findUnique({
    where: { email: ownerEmail },
    select: {
      id: true,
      proAccount: {
        select: {
          id: true,
          paymentStatus: true,
          trialEndsAt: true,
        },
      },
    },
  });

  if (
    existingUser?.proAccount?.paymentStatus === "PAID" ||
    isActiveTrial(existingUser?.proAccount)
  ) {
    return {
      error:
        "Cet email a deja un compte pro actif. Connectez-vous avec ce compte ou utilisez un autre email.",
      errors: { ownerEmail: "Un compte existe deja avec cet email." },
    };
  }

  if (startTrial && existingUser?.proAccount?.paymentStatus === "TRIAL") {
    return {
      error:
        "L'essai gratuit a deja ete utilise avec cet email. Vous pouvez reprendre vos donnees en vous abonnant.",
      errors: { ownerEmail: "Essai gratuit deja utilise." },
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
    select: { id: true, paymentStatus: true, trialEndsAt: true },
  });

  if (
    existingOwnerAccount?.paymentStatus === "PAID" ||
    isActiveTrial(existingOwnerAccount)
  ) {
    return {
      error:
        "Cet email a deja un compte pro actif. Connectez-vous avec ce compte ou utilisez un autre email.",
      errors: { ownerEmail: "Un compte existe deja avec cet email." },
    };
  }

  if (startTrial && existingOwnerAccount?.paymentStatus === "TRIAL") {
    return {
      error:
        "L'essai gratuit a deja ete utilise avec cet email. Vous pouvez reprendre vos donnees en vous abonnant.",
      errors: { ownerEmail: "Essai gratuit deja utilise." },
    };
  }

  await deleteUnpaidProAccount(existingOwnerAccount?.id);

  const existingSlugAccount = await prisma.proAccount.findUnique({
    where: { slug },
    select: { id: true, paymentStatus: true, trialEndsAt: true },
  });

  if (
    existingSlugAccount?.paymentStatus === "PAID" ||
    isActiveTrial(existingSlugAccount)
  ) {
    return {
      error:
        "Cet identifiant QR est deja utilise. Choisissez un autre identifiant.",
      errors: { slug: "Cet identifiant est deja utilise." },
    };
  }

  if (startTrial && existingSlugAccount?.paymentStatus === "TRIAL") {
    return {
      error: "Cet atelier a deja beneficie de l'essai gratuit.",
      errors: { slug: "Essai gratuit deja utilise pour cet atelier." },
    };
  }

  await deleteUnpaidProAccount(existingSlugAccount?.id);

  return null;
}

function readOptionalNumber(value?: string) {
  if (!value) {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = rateLimit(`pro-checkout:${ip}`, 12, 15 * 60 * 1000);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Reessayez dans quelques minutes." },
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

  const validation = validateProSignupInput(body);
  const startTrial =
    typeof body === "object" &&
    body !== null &&
    !Array.isArray(body) &&
    (body as Record<string, unknown>).startTrial === true;

  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  try {
    const usesFreeAccessCode = isFreeAccessCode(validation.data.promoCode);
    const usesPremiumDiscountCode = isPremiumDiscountCode(validation.data.promoCode);
    const accountSlug = createPrivateSignupSlug(validation.data.slug);
    const conflict = await removeOldUnpaidAccounts(
      validation.data.ownerEmail,
      accountSlug,
      startTrial,
    );

    if (conflict) {
      return NextResponse.json(conflict, { status: 400 });
    }

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

    const passwordHash = await bcrypt.hash(validation.data.password, 12);
    const accountData: PaidProAccountData = {
      companyName: validation.data.companyName,
      slug: accountSlug,
      ownerEmail: validation.data.ownerEmail,
      passwordHash,
      firebaseApiKey: validation.data.firebaseApiKey,
      firebaseAuthDomain: `${validation.data.firebaseProjectId}.firebaseapp.com`,
      firebaseProjectId: validation.data.firebaseProjectId,
      firebaseStorageBucket: `${validation.data.firebaseProjectId}.appspot.com`,
      firebaseAppId: validation.data.firebaseAppId,
      shopAddress: validation.data.shopAddress ?? null,
      shopPostalCode: validation.data.shopPostalCode ?? null,
      shopCity: validation.data.shopCity ?? null,
      shopCountry: validation.data.shopCountry ?? null,
      shopPhone: validation.data.shopPhone ?? null,
      shopEmail: validation.data.shopEmail ?? validation.data.ownerEmail,
      shopOpeningHours: validation.data.shopOpeningHours ?? null,
      shopLatitude: readOptionalNumber(validation.data.shopLatitude),
      shopLongitude: readOptionalNumber(validation.data.shopLongitude),
      shopCapacityPerDay:
        Number(validation.data.shopCapacityPerDay ?? "8") > 0
          ? Number(validation.data.shopCapacityPerDay ?? "8")
          : 8,
      shopSlotDurationMinutes:
        Number(validation.data.shopSlotDurationMinutes ?? "60") >= 15
          ? Number(validation.data.shopSlotDurationMinutes ?? "60")
          : 60,
      shopMaxAppointmentsPerSlot:
        Number(validation.data.shopMaxAppointmentsPerSlot ?? "1") > 0
          ? Number(validation.data.shopMaxAppointmentsPerSlot ?? "1")
          : 1,
      premiumDiscountCode: usesPremiumDiscountCode
        ? PREMIUM_DISCOUNT_CODE
        : null,
      publicListed: false,
    };

    if (usesFreeAccessCode) {
      const proAccount = await createPaidProAccount(accountData);

      return NextResponse.json({
        redirectUrl: `/pro/premium?compte=${proAccount.slug}`,
      });
    }

    if (startTrial) {
      const cookieStore = await cookies();
      const offer = readTrialOfferToken(
        cookieStore.get(TRIAL_OFFER_COOKIE)?.value,
      );

      if (!offer?.available) {
        return NextResponse.json(
          {
            error:
              "Le délai de 72 heures est terminé. L'essai gratuit de 7 jours n'est plus disponible sur ce navigateur.",
          },
          { status: 410 },
        );
      }

      const trialEndsAt = new Date(Date.now() + TRIAL_DURATION_MS);
      const proAccount = await createTrialProAccount(accountData, trialEndsAt);

      return NextResponse.json({
        redirectUrl: `/admin/login?trial=1&compte=${proAccount.slug}`,
      });
    }

    const pendingSignup = await createPendingProSignup(accountData);
    const paymentParams = new URLSearchParams({
      inscription: pendingSignup.id,
    });

    return NextResponse.json({
      redirectUrl: `/pro/paiement?${paymentParams.toString()}`,
    });
  } catch (error) {
    console.error("Pro signup checkout failed", error);
    return NextResponse.json(
      {
        error:
          "Inscription impossible pour le moment. Verifiez la configuration de la base Qoravo sur Vercel, puis reessayez.",
      },
      { status: 500 },
    );
  }
}
