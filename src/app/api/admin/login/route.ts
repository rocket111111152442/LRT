import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import {
  isTrustedDevice,
  setAdminSessionCookie,
  setTrustedDeviceCookie,
} from "@/lib/auth";
import {
  sendEmailVerificationCode,
  verifyEmailCode,
} from "@/lib/emailVerification";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rateLimit";

type ProAccountSummary = {
  slug: string;
  paymentStatus: string;
  trialEndsAt?: Date | string | null;
  supportIncluded?: boolean | null;
} | null;

function isActiveTrial(account: ProAccountSummary) {
  if (account?.paymentStatus !== "TRIAL" || !account.trialEndsAt) {
    return false;
  }

  const trialEndsAt = new Date(account.trialEndsAt);
  return !Number.isNaN(trialEndsAt.getTime()) && trialEndsAt > new Date();
}

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
      trialEndsAt: true,
      supportIncluded: true,
    },
  });
}

export async function POST(request: Request) {
  // Anti brute-force : 10 tentatives / 10 min par IP.
  const ip = clientIp(request);
  const limit = rateLimit(`admin-login:${ip}`, 10, 10 * 60 * 1000);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Reessayez dans quelques minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

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

    if (
      proAccount &&
      proAccount.paymentStatus !== "PAID" &&
      !isActiveTrial(proAccount)
    ) {
      return NextResponse.json(
        {
          error:
            proAccount.paymentStatus === "TRIAL"
              ? "Votre essai gratuit de 72h est termine. Souscrivez a l abonnement pour retrouver votre espace admin et continuer votre travail."
              : "Paiement en attente pour ce compte pro.",
        },
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

    const sessionUser = {
      id: user.id,
      email: user.email,
      role: "ADMIN" as const,
      proAccountId: user.proAccountId,
      proAccountSlug: proAccount?.slug ?? null,
      paymentStatus: proAccount?.paymentStatus ?? null,
      trialEndsAt: proAccount?.trialEndsAt
        ? new Date(proAccount.trialEndsAt).toISOString()
        : null,
      supportIncluded: proAccount?.supportIncluded === true,
    };

    const loginSuccess = (markTrusted: boolean) => {
      resetRateLimit(`admin-login:${ip}`);
      const response = NextResponse.json({ user: sessionUser });
      setAdminSessionCookie(response, sessionUser, {
        rememberMe: rememberMe || markTrusted,
      });
      if (markTrusted) {
        setTrustedDeviceCookie(response, user.email);
      }
      return response;
    };

    if (!code) {
      // Appareil de confiance : mot de passe deja valide, on saute le 2FA.
      if (await isTrustedDevice(user.email)) {
        return loginSuccess(false);
      }

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

    // Si « se souvenir de moi » est coche, on marque l'appareil comme de
    // confiance pour sauter le code email la prochaine fois.
    return loginSuccess(rememberMe);
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
