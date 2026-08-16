import { createHmac, randomBytes, timingSafeEqual, createHash } from "crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { prisma, safeQuery } from "@/lib/prisma";

const IS_PROD = process.env.NODE_ENV === "production";

// Le préfixe __Host- impose au navigateur : cookie sécurisé, sur le domaine
// exact, avec Path=/. Il rend impossible l'injection depuis un sous-domaine.
export const SESSION_COOKIE = IS_PROD ? "__Host-nb_session" : "nb_session";
export const CART_COOKIE = IS_PROD ? "__Host-nb_cart" : "nb_cart";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours
const BCRYPT_ROUNDS = 12;

export type SessionUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "CUSTOMER" | "ADMIN";
};

type SessionPayload = {
  uid: string;
  iat: number;
  exp: number;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  // Sans cette garde, un secret par défaut connu publiquement permettrait de
  // forger la session de n'importe quel client.
  if (IS_PROD) {
    throw new Error(
      "AUTH_SECRET manquant ou trop court (32 caractères minimum requis en production).",
    );
  }

  return "natural-brutal-dev-secret-change-me-in-production";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeSession(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  if (!safeEqual(signature, sign(body))) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (!payload?.uid || typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const now = Math.floor(Date.now() / 1000);
  const token = encodeSession({ uid: userId, iat: now, exp: now + SESSION_MAX_AGE });
  const store = await cookies();

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Lit la session du cookie et recharge l'utilisateur. Mise en cache par requête :
 * plusieurs composants serveur peuvent l'appeler sans multiplier les requêtes SQL.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = decodeSession(token);
  if (!payload) return null;

  const user = await safeQuery(
    () =>
      prisma.user.findUnique({
        where: { id: payload.uid },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          sessionsValidFrom: true,
        },
      }),
    null,
    "chargement de la session",
  );

  if (!user) return null;

  // Un changement de mot de passe (ou une déconnexion globale) avance
  // sessionsValidFrom : les jetons émis avant deviennent invalides.
  if (Math.floor(user.sessionsValidFrom.getTime() / 1000) > payload.iat) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
});

export async function requireUser(redirectTo = "/compte") {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/connexion?suite=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?suite=/admin");
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

export function generateToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
