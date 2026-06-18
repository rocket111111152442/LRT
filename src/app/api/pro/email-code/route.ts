import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmailVerificationCode } from "@/lib/emailVerification";
import { validateProSignupInput } from "@/lib/pro/signupValidation";

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
    });
  } catch {
    return NextResponse.json(
      { error: "Envoi du code impossible pour le moment." },
      { status: 500 },
    );
  }
}
