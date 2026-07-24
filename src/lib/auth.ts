import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-qoravo_admin_session"
    : "qoravo_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
const REMEMBER_ME_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

type SessionPayload = {
  userId: string;
  role: "ADMIN";
  expiresAt: number;
  credentialDigest: string;
};

export type AdminUser = {
  id: string;
  email: string;
  role: "ADMIN";
  proAccountId: string | null;
  proAccountSlug: string | null;
  paymentStatus: string | null;
  trialEndsAt: string | null;
  supportIncluded: boolean;
};

type ProAccountSummary = {
  slug: string;
  paymentStatus: string;
  trialEndsAt?: Date | string | null;
  supportIncluded?: boolean | null;
} | null;

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  // En production, on refuse de signer avec un secret par défaut : sans cela,
  // n'importe qui connaissant la valeur codée en dur pourrait forger une
  // session admin valide.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET manquant ou trop court (>= 32 caractères requis) en production.",
    );
  }

  return "dev-secret-change-me-please-set-auth-secret";
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function credentialDigestFor(passwordHash: string) {
  return sign(`credential:${passwordHash}`);
}

function createSessionValue(
  user: AdminUser,
  passwordHash: string,
  maxAgeSeconds = SESSION_MAX_AGE_SECONDS,
) {
  const payload: SessionPayload = {
    userId: user.id,
    role: user.role,
    expiresAt: Date.now() + maxAgeSeconds * 1000,
    credentialDigest: credentialDigestFor(passwordHash),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function isDynamicServerUsageError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    (error as { digest?: unknown }).digest === "DYNAMIC_SERVER_USAGE"
  );
}

function verifySessionValue(value?: string): SessionPayload | null {
  if (!value) {
    return null;
  }

  const [encodedPayload, signature] = value.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (
      payload.role !== "ADMIN" ||
      typeof payload.userId !== "string" ||
      !payload.userId ||
      typeof payload.expiresAt !== "number" ||
      typeof payload.credentialDigest !== "string" ||
      !payload.credentialDigest ||
      payload.expiresAt < Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function setAdminSessionCookie(
  response: NextResponse,
  user: AdminUser,
  options: { passwordHash: string; rememberMe?: boolean },
) {
  const maxAge = options.rememberMe
    ? REMEMBER_ME_MAX_AGE_SECONDS
    : SESSION_MAX_AGE_SECONDS;

  response.cookies.set(
    COOKIE_NAME,
    createSessionValue(user, options.passwordHash, maxAge),
    {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge,
      path: "/",
      priority: "high",
    },
  );
}

// ---- Appareil de confiance (« se souvenir de moi ») ----
// Quand l'utilisateur coche « se souvenir de moi », on pose un cookie signe lie
// a son email. A la prochaine connexion sur ce navigateur, le mot de passe
// suffit : on saute le code email 2FA (mais le mot de passe reste exige).
const TRUSTED_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Host-qoravo_trusted_device"
    : "qoravo_trusted_device";
const TRUSTED_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

function trustedTokenFor(email: string, passwordHash: string) {
  return sign(
    `trusted:${email.toLowerCase()}:${credentialDigestFor(passwordHash)}`,
  );
}

export function setTrustedDeviceCookie(
  response: NextResponse,
  email: string,
  passwordHash: string,
) {
  response.cookies.set(TRUSTED_COOKIE, trustedTokenFor(email, passwordHash), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: TRUSTED_MAX_AGE_SECONDS,
    path: "/",
    priority: "high",
  });
}

export async function isTrustedDevice(
  email: string,
  passwordHash: string,
): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TRUSTED_COOKIE)?.value;
    if (!token) return false;
    const expected = trustedTokenFor(email, passwordHash);
    const tokenBuffer = Buffer.from(token);
    const expectedBuffer = Buffer.from(expected);
    return (
      tokenBuffer.length === expectedBuffer.length &&
      timingSafeEqual(tokenBuffer, expectedBuffer)
    );
  } catch {
    return false;
  }
}

export function clearTrustedDeviceCookie(response: NextResponse) {
  response.cookies.set(TRUSTED_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

// ---- Prise en main par un modérateur (impersonation) ----
// Quand un modérateur entre dans le logiciel d'un commerçant (après accord de
// celui-ci), on pose en plus du cookie de session admin un cookie signé marquant
// qu'il s'agit d'une prise en main support. Il sert à afficher le bandeau « Mode
// support » et à ne pas redemander le consentement au modérateur lui-même.
const IMPERSONATION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Host-qoravo_impersonator"
    : "qoravo_impersonator";
const IMPERSONATION_MAX_AGE_SECONDS = 60 * 60 * 4; // 4 h

type ImpersonationPayload = {
  proAccountId: string;
  companyName: string;
  expiresAt: number;
};

export function setImpersonationCookie(
  response: NextResponse,
  data: { proAccountId: string; companyName: string },
) {
  const payload: ImpersonationPayload = {
    proAccountId: data.proAccountId,
    companyName: data.companyName,
    expiresAt: Date.now() + IMPERSONATION_MAX_AGE_SECONDS * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  response.cookies.set(IMPERSONATION_COOKIE, `${encoded}.${sign(encoded)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: IMPERSONATION_MAX_AGE_SECONDS,
    path: "/",
    priority: "high",
  });
}

export function clearImpersonationCookie(response: NextResponse) {
  response.cookies.set(IMPERSONATION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export async function getImpersonation(): Promise<{
  proAccountId: string;
  companyName: string;
} | null> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(IMPERSONATION_COOKIE)?.value;
    if (!value) return null;

    const [encoded, signature] = value.split(".");
    if (!encoded || !signature) return null;

    const expected = sign(encoded);
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as ImpersonationPayload;

    if (
      typeof payload.proAccountId !== "string" ||
      !payload.proAccountId ||
      typeof payload.companyName !== "string" ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt < Date.now()
    ) {
      return null;
    }
    return { proAccountId: payload.proAccountId, companyName: payload.companyName };
  } catch (error) {
    if (isDynamicServerUsageError(error)) {
      throw error;
    }
    return null;
  }
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export type AdminSessionState =
  | { status: "active"; admin: AdminUser }
  | { status: "trial-expired"; userId: string; proAccountSlug: string | null }
  | { status: "none" };

export async function getAdminSessionState(): Promise<AdminSessionState> {
  try {
    const cookieStore = await cookies();
    const payload = verifySessionValue(cookieStore.get(COOKIE_NAME)?.value);

    if (!payload) {
      return { status: "none" };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        proAccountId: true,
      },
    });

    if (
      !user ||
      user.role !== "ADMIN" ||
      !user.proAccountId ||
      payload.credentialDigest !== credentialDigestFor(user.passwordHash)
    ) {
      return { status: "none" };
    }

    let proAccount: ProAccountSummary = null;

    if (user.proAccountId) {
      proAccount = await prisma.proAccount.findUnique({
        where: { id: user.proAccountId },
        select: {
          slug: true,
          paymentStatus: true,
          trialEndsAt: true,
          supportIncluded: true,
        },
      });
    }

    if (!proAccount) {
      return { status: "none" };
    }

    const trialEndsAt = proAccount?.trialEndsAt
      ? new Date(proAccount.trialEndsAt)
      : null;
    const trialEndsValid =
      trialEndsAt !== null && !Number.isNaN(trialEndsAt.getTime());
    const isActiveTrial =
      proAccount?.paymentStatus === "TRIAL" &&
      trialEndsValid &&
      (trialEndsAt as Date) > new Date();
    const isExpiredTrial =
      proAccount?.paymentStatus === "TRIAL" &&
      trialEndsValid &&
      (trialEndsAt as Date) <= new Date();

    if (proAccount && proAccount.paymentStatus !== "PAID" && !isActiveTrial) {
      if (isExpiredTrial) {
        return {
          status: "trial-expired",
          userId: user.id,
          proAccountSlug: proAccount.slug ?? null,
        };
      }

      return { status: "none" };
    }

    return {
      status: "active",
      admin: {
        id: user.id,
        email: user.email,
        role: "ADMIN",
        proAccountId: user.proAccountId,
        proAccountSlug: proAccount?.slug ?? null,
        paymentStatus: proAccount?.paymentStatus ?? null,
        trialEndsAt: trialEndsAt ? trialEndsAt.toISOString() : null,
        supportIncluded: proAccount?.supportIncluded === true,
      },
    };
  } catch (error) {
    if (isDynamicServerUsageError(error)) {
      throw error;
    }

    console.error("Admin session lookup failed", error);
    return { status: "none" };
  }
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const state = await getAdminSessionState();
  return state.status === "active" ? state.admin : null;
}

/**
 * Identifiant de l'utilisateur derrière le cookie de session, quel que soit le
 * statut de paiement. Utile pour les actions autorisées même quand l'essai est
 * expiré (ex. suppression du compte par son propriétaire).
 */
export async function getSessionUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const payload = verifySessionValue(cookieStore.get(COOKIE_NAME)?.value);

    if (!payload) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, passwordHash: true, role: true },
    });

    if (
      !user ||
      user.role !== "ADMIN" ||
      payload.credentialDigest !== credentialDigestFor(user.passwordHash)
    ) {
      return null;
    }

    return user.id;
  } catch (error) {
    if (isDynamicServerUsageError(error)) {
      throw error;
    }

    return null;
  }
}

export async function requireAdminPage() {
  const state = await getAdminSessionState();

  if (state.status === "active") {
    return state.admin;
  }

  if (state.status === "trial-expired") {
    redirect(
      state.proAccountSlug
        ? `/admin/essai-termine?compte=${encodeURIComponent(state.proAccountSlug)}`
        : "/admin/essai-termine",
    );
  }

  redirect("/admin/login");
}

export async function requireAdminApi(): Promise<
  | { ok: true; user: AdminUser & { proAccountId: string } }
  | { ok: false; response: NextResponse<{ error: string }> }
> {
  const admin = await getCurrentAdmin();

  if (!admin || !admin.proAccountId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Non authentifie." }, { status: 401 }),
    };
  }

  return {
    ok: true,
    user: admin as AdminUser & { proAccountId: string },
  };
}
