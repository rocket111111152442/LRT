import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "repair_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

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
};

type ProAccountSummary = {
  slug: string;
  paymentStatus: string;
} | null;

function getAuthSecret() {
  return process.env.AUTH_SECRET || "dev-secret-change-me";
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function createSessionValue(user: AdminUser) {
  const payload: SessionPayload = {
    userId: user.id,
    role: user.role,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );

  return `${encodedPayload}.${sign(encodedPayload)}`;
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

export function setAdminSessionCookie(response: NextResponse, user: AdminUser) {
  response.cookies.set(COOKIE_NAME, createSessionValue(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
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

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const payload = verifySessionValue(cookieStore.get(COOKIE_NAME)?.value);

  if (!payload) {
    return null;
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
    return null;
  }

  let proAccount: ProAccountSummary = null;

  if (user.proAccountId) {
    proAccount = await prisma.proAccount.findUnique({
      where: { id: user.proAccountId },
      select: {
        slug: true,
        paymentStatus: true,
      },
    });
  }

  if (proAccount && proAccount.paymentStatus !== "PAID") {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: "ADMIN",
    proAccountId: user.proAccountId,
    proAccountSlug: proAccount?.slug ?? null,
  };
}

export async function requireAdminPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
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
