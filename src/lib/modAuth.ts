import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

const COOKIE  = "qoravo_mod_session";
const MAX_AGE = 60 * 60 * 8; // 8 h

function secret() {
  const value = process.env.MODERATOR_SECRET ?? process.env.AUTH_SECRET;

  if (value && value.length >= 16) {
    return value;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("MODERATOR_SECRET / AUTH_SECRET manquant en production.");
  }

  return "dev-mod-secret-change-me-please";
}

/** Comparaison à temps constant pour éviter les attaques temporelles. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Longueurs différentes : timingSafeEqual lèverait, on compare des hash de
  // même taille pour ne pas révéler la longueur attendue.
  const hashA = createHmac("sha256", "cmp").update(bufA).digest();
  const hashB = createHmac("sha256", "cmp").update(bufB).digest();
  return timingSafeEqual(hashA, hashB);
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function createToken() {
  const payload = Buffer.from(JSON.stringify({ mod: true, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verify(token?: string): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  try {
    const expected = Buffer.from(sign(payload));
    const given    = Buffer.from(sig);
    if (expected.length !== given.length) return false;
    if (!timingSafeEqual(expected, given)) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function checkModPassword(password: string): boolean {
  const expected = process.env.MODERATOR_PASSWORD;
  if (!expected || expected.length < 8) return false;
  return safeEqual(password, expected);
}

export async function setModSession() {
  const jar = await cookies();
  jar.set(COOKIE, createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearModSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getModSession(): Promise<boolean> {
  try {
    const jar = await cookies();
    return verify(jar.get(COOKIE)?.value);
  } catch {
    return false;
  }
}

export async function requireModPage() {
  const ok = await getModSession();
  if (!ok) redirect("/moderateur/login");
}

export async function requireModApi(): Promise<
  { ok: true } | { ok: false; response: Response }
> {
  const ok = await getModSession();
  if (!ok) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Non autorise." }, { status: 401 }) as unknown as Response,
    };
  }
  return { ok: true };
}
