import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "repair_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
const REMEMBER_ME_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

type SessionPayload = {
  userId: string;
  role: "ADMIN";
  expiresAt: number;
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

  if (secret && secret.length >= 16) {
    return secret;
  }

  // En production, on refuse de signer avec un secret par défaut : sans cela,
  // n'importe qui connaissant la valeur codée en dur pourrait forger une
  // session admin valide.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET manquant ou trop court (>= 16 caractères requis) en production.",
    );
  }

  return "dev-secret-change-me-please-set-auth-secret";
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function createSessionValue(
  user: AdminUser,
  maxAgeSeconds = SESSION_MAX_AGE_SECONDS,
) {
  const payload: SessionPayload = {
    userId: user.id,
    role: user.role,
    expiresAt: Date.now() + maxAgeSeconds * 1000,
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

    if (payload.role !== "ADMIN" || payload.expiresAt < Date.now()) {
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
  options: { rememberMe?: boolean } = {},
) {
  const maxAge = options.rememberMe
    ? REMEMBER_ME_MAX_AGE_SECONDS
    : SESSION_MAX_AGE_SECONDS;

  response.cookies.set(COOKIE_NAME, createSessionValue(user, maxAge), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
    path: "/",
  });
}

// ---- Appareil de confiance (« se souvenir de moi ») ----
// Quand l'utilisateur coche « se souvenir de moi », on pose un cookie signe lie
// a son email. A la prochaine connexion sur ce navigateur, le mot de passe
// suffit : on saute le code email 2FA (mais le mot de passe reste exige).
const TRUSTED_COOKIE = "qoravo_trusted_device";
const TRUSTED_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

function trustedTokenFor(email: string) {
  return sign(`trusted:${email.toLowerCase()}`);
}

export function setTrustedDeviceCookie(response: NextResponse, email: string) {
  response.cookies.set(TRUSTED_COOKIE, trustedTokenFor(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TRUSTED_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function isTrustedDevice(email: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TRUSTED_COOKIE)?.value;
    if (!token) return false;
    const expected = trustedTokenFor(email);
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

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
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
        role: true,
        proAccountId: true,
      },
    });

    if (!user || user.role !== "ADMIN") {
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
    return payload?.userId ?? null;
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
  | { ok: true; user: AdminUser }
  | { ok: false; response: NextResponse<{ error: string }> }
> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Non authentifie." }, { status: 401 }),
    };
  }

  return { ok: true, user: admin };
}
