import { cookies } from "next/headers";
import crypto from "node:crypto";

/**
 * Authentification volontairement minimale : un mot de passe partagé,
 * pas de compte nominatif. C'est un accès d'équipe temporaire, demandé
 * comme tel — voir la conversation. Change `ADMIN_PASSWORD` dans les
 * variables d'environnement Vercel du projet pour remplacer la valeur
 * par défaut avant toute utilisation réelle.
 */

const DEFAULT_PASSWORD = "123";
const SESSION_COOKIE = "vc_admin_session";

function adminPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "votrecourtier-admin-demo-secret";
}

function expectedSessionToken() {
  return crypto.createHash("sha256").update(`${adminPassword()}:${sessionSecret()}`).digest("hex");
}

export function checkPassword(candidate: string) {
  return candidate === adminPassword();
}

export async function createSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, expectedSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function isAuthenticated() {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  return !!value && value === expectedSessionToken();
}
