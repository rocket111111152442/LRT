import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateProSignupInput } from "@/lib/pro/signupValidation";

const FREE_ACCESS_CODE = "REP2026";

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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

    const existingUser = await prisma.user.findUnique({
      where: { email: validation.data.ownerEmail },
      select: { id: true },
    });
    const existingAccount = await prisma.proAccount.findUnique({
      where: { slug: validation.data.slug },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Cet email a deja un compte pro. Connectez-vous avec ce compte ou utilisez un autre email.",
          errors: { ownerEmail: "Un compte existe deja avec cet email." },
        },
        { status: 400 },
      );
    }

    if (existingAccount) {
      return NextResponse.json(
        {
          error:
            "Cet identifiant QR est deja utilise. Choisissez un autre identifiant.",
          errors: { slug: "Cet identifiant est deja utilise." },
        },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(validation.data.password, 12);

    const proAccount = await prisma.proAccount.create({
      data: {
        companyName: validation.data.companyName,
        slug: validation.data.slug,
        ownerEmail: validation.data.ownerEmail,
        firebaseApiKey: validation.data.firebaseApiKey,
        firebaseAuthDomain: `${validation.data.firebaseProjectId}.firebaseapp.com`,
        firebaseProjectId: validation.data.firebaseProjectId,
        firebaseStorageBucket: `${validation.data.firebaseProjectId}.appspot.com`,
        firebaseAppId: validation.data.firebaseAppId,
        paymentStatus: usesFreeAccessCode ? "PAID" : "PENDING",
        users: {
          create: {
            email: validation.data.ownerEmail,
            passwordHash,
            role: "ADMIN",
          },
        },
      },
    });

    if (usesFreeAccessCode) {
      return NextResponse.json({
        redirectUrl: `${getAppUrl()}/pro/premium?compte=${proAccount.slug}`,
      });
    }

    return NextResponse.json({
      redirectUrl: `${getAppUrl()}/pro/paiement?compte=${proAccount.slug}`,
    });
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
