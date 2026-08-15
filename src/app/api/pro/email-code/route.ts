import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmailVerificationCode } from "@/lib/emailVerification";
import { validateProSignupInput } from "@/lib/pro/signupValidation";
import {
  resolveSalesReferralCode,
  SalesReferralError,
} from "@/lib/pro/salesReferral";
import { clientIp, rateLimit } from "@/lib/rateLimit";

async function findPaidAccountConflict(ownerEmail: string, slug: string) {
  const existingUser = await prisma.user.findUnique({
    where: { email: ownerEmail },
    select: {
      id: true,
      proAccount: {
        select: {
          paymentStatus: true,
        },
      },
    },
  });

  if (existingUser?.proAccount?.paymentStatus === "PAID" || (existingUser && !existingUser.proAccount)) {
    return {
      error:
        "Cet email a deja un compte pro. Connectez-vous avec ce compte ou utilisez un autre email.",
      errors: { ownerEmail: "Un compte existe deja avec cet email." },
    };
  }

  const existingOwnerAccount = await prisma.proAccount.findUnique({
    where: { ownerEmail },
    select: { paymentStatus: true },
  });

  if (existingOwnerAccount?.paymentStatus === "PAID") {
    return {
      error:
        "Cet email a deja un compte pro. Connectez-vous avec ce compte ou utilisez un autre email.",
      errors: { ownerEmail: "Un compte existe deja avec cet email." },
    };
  }

  const existingSlugAccount = await prisma.proAccount.findUnique({
    where: { slug },
    select: { paymentStatus: true },
  });

  if (existingSlugAccount?.paymentStatus === "PAID") {
    return {
      error:
        "Cet identifiant QR est deja utilise. Choisissez un autre identifiant.",
      errors: { slug: "Cet identifiant est deja utilise." },
    };
  }

  return null;
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const ipLimit = rateLimit(`signup-code:${ip}`, 6, 15 * 60 * 1000);

  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Trop de demandes. Reessayez dans quelques minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
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

  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const emailLimit = rateLimit(
    `signup-code-email:${validation.data.ownerEmail}`,
    3,
    15 * 60 * 1000,
  );

  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Trop de codes envoyes. Attendez quelques minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(emailLimit.retryAfterSeconds) },
      },
    );
  }

  try {
    await resolveSalesReferralCode({
      referralCode: validation.data.referralCode,
      promoCode: validation.data.promoCode,
    });

    const conflict = await findPaidAccountConflict(
      validation.data.ownerEmail,
      validation.data.slug,
    );

    if (conflict) {
      return NextResponse.json(conflict, { status: 400 });
    }

    const result = await sendEmailVerificationCode(
      validation.data.ownerEmail,
      "SIGNUP",
    );

    if (result.skipped) {
      return NextResponse.json(
        {
          error:
            "Envoi du code impossible : le SMTP serveur n est pas configure.",
        },
        { status: 503 },
      );
    }

    if (!result.sent) {
      return NextResponse.json(
        { error: "Envoi du code impossible pour le moment." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Code envoye. Verifiez votre boite email.",
      verificationId: result.verificationId,
    });
  } catch (error) {
    if (error instanceof SalesReferralError) {
      const field = error.kind === "promo" ? "promoCode" : "referralCode";
      return NextResponse.json(
        {
          error: error.message,
          errors: { [field]: error.message },
        },
        { status: error.kind === "unavailable" ? 503 : 400 },
      );
    }
    return NextResponse.json(
      { error: "Envoi du code impossible pour le moment." },
      { status: 500 },
    );
  }
}
