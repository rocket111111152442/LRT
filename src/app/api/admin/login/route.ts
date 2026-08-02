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
import {
  createTrialUsedToken,
  TRIAL_USED_COOKIE,
} from "@/lib/pro/trialOffer";

const DUMMY_PASSWORD_HASH =
  "$2b$12$r7imavEnwxuYuegUwFtUGuZKk24P/0KRh65pyE/7GjKK/aREYTNcW";

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

  if (!email || email.length > 254 || !password || password.length > 128) {
    return NextResponse.json(
      { error: "Email et mot de passe requis." },
      { status: 400 },
    );
  }

  const emailLimitKey = `admin-login-email:${email}`;
  const emailLimit = rateLimit(emailLimitKey, 8, 15 * 60 * 1000);

  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Reessayez dans quelques minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(emailLimit.retryAfterSeconds) },
      },
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
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
      return NextResponse.json(
        { error: "Identifiants invalides." },
        { status: 401 },
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Identifiants invalides." },
        { status: 401 },
      );
    }

    const proAccount = await getProAccountSummary(user.proAccountId);
    const isExpiredTrial =
      proAccount?.paymentStatus === "TRIAL" && !isActiveTrial(proAccount);

    // PENDING / CANCELED (jamais en essai actif) : on bloque comme avant.
    // L'essai EXPIRE, lui, n'est plus bloque ici : on verifie d'abord l'identite
    // (mot de passe + code email), puis on redirige vers /admin/essai-termine.
    if (
      proAccount &&
      proAccount.paymentStatus !== "PAID" &&
      !isActiveTrial(proAccount) &&
      !isExpiredTrial
    ) {
      return NextResponse.json(
        { error: "Paiement en attente pour ce compte pro." },
        { status: 403 },
      );
    }

    if (!user.proAccountId || !proAccount) {
      return NextResponse.json(
        {
          error:
            "Ce compte administrateur n'est associé à aucun atelier Qoravo.",
        },
        { status: 403 },
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

    const trialEndedRedirect = isExpiredTrial
      ? `/admin/essai-termine${
          proAccount?.slug ? `?compte=${encodeURIComponent(proAccount.slug)}` : ""
        }`
      : null;

    const loginSuccess = (markTrusted: boolean) => {
      resetRateLimit(`admin-login:${ip}`);
      resetRateLimit(emailLimitKey);
      // Pour un essai expire : identite confirmee, on pose la session (qui sera
      // traitee comme "trial-expired") et on redirige vers la page souscrire/
      // supprimer au lieu du tableau de bord.
      const response = NextResponse.json(
        trialEndedRedirect ? { redirectUrl: trialEndedRedirect } : { user: sessionUser },
      );
      setAdminSessionCookie(response, sessionUser, {
        passwordHash: user.passwordHash,
        rememberMe: rememberMe || markTrusted,
      });
      if (markTrusted) {
        setTrustedDeviceCookie(response, user.email, user.passwordHash);
      }
      if (proAccount.paymentStatus === "TRIAL") {
        response.cookies.set(TRIAL_USED_COOKIE, createTrialUsedToken(), {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 365 * 24 * 60 * 60,
        });
      }
      return response;
    };

    if (!code) {
      // Appareil de confiance : mot de passe deja valide, on saute le 2FA.
      if (await isTrustedDevice(user.email, user.passwordHash)) {
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
