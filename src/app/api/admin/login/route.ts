import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { setAdminSessionCookie } from "@/lib/auth";
import {
  sendEmailVerificationCode,
  verifyEmailCode,
} from "@/lib/emailVerification";
import { prisma } from "@/lib/prisma";

type ProAccountSummary = {
  slug: string;
  paymentStatus: string;
  supportIncluded?: boolean | null;
} | null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function getProAccountSummary(
  proAccountId: string | null,
): Promise<ProAccountSummary> {
  if (!proAccountId) {
    return null;
  }

  return prisma.proAccount.findUnique({
    where: { id: proAccountId },
    select: {
      slug: true,
      paymentStatus: true,
      supportIncluded: true,
    },
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const verificationId =
    typeof body.verificationId === "string" ? body.verificationId.trim() : "";
  const rememberMe = body.rememberMe === true;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email et mot de passe requis." },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        proAccountId: true,
      },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Identifiants invalides." },
        { status: 401 },
      );
    }

    const proAccount = await getProAccountSummary(user.proAccountId);

    if (proAccount && proAccount.paymentStatus !== "PAID") {
      return NextResponse.json(
        { error: "Paiement en attente pour ce compte pro." },
        { status: 403 },
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Identifiants invalides." },
        { status: 401 },
      );
    }

    if (!code) {
      const result = await sendEmailVerificationCode(user.email, "LOGIN");

      if (result.skipped) {
        return NextResponse.json(
          {
            error:
              "Connexion par code impossible : le SMTP serveur n est pas configure.",
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
        requiresCode: true,
        message: "Code envoye. Verifiez votre boite email.",
        verificationId: result.verificationId,
      });
    }

    const isValidCode = await verifyEmailCode(
      user.email,
      "LOGIN",
      code,
      verificationId,
    );

    if (!isValidCode) {
      return NextResponse.json(
        { error: "Code email invalide ou expire." },
        { status: 400 },
      );
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: "ADMIN",
        proAccountId: user.proAccountId,
        proAccountSlug: proAccount?.slug ?? null,
        supportIncluded: proAccount?.supportIncluded === true,
      },
    });

    setAdminSessionCookie(
      response,
      {
        id: user.id,
        email: user.email,
        role: "ADMIN",
        proAccountId: user.proAccountId,
        proAccountSlug: proAccount?.slug ?? null,
        supportIncluded: proAccount?.supportIncluded === true,
      },
      { rememberMe },
    );

    return response;
  } catch (error) {
    console.error("Admin login failed", error);
    return NextResponse.json(
      {
        error:
          "Base Qoravo indisponible. Verifiez les variables d environnement sur Vercel, puis reessayez.",
      },
      { status: 500 },
    );
  }
}
