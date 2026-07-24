import { createHmac, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

const COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Host-qoravo_mod_session"
    : "qoravo_mod_session";
const MAX_AGE = 60 * 60; // 1 h pour ce panneau très sensible.

function secret() {
  const value =
    process.env.MODERATOR_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : process.env.AUTH_SECRET);

  if (value && value.length >= 32) {
    return value;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("MODERATOR_SECRET manquant en production.");
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

function userAgentDigest(userAgent: string) {
  return sign(`ua:${userAgent.slice(0, 500)}`);
}

function createToken(userAgent: string) {
  const payload = Buffer.from(
    JSON.stringify({
      mod: true,
      exp: Date.now() + MAX_AGE * 1000,
      ua: userAgentDigest(userAgent),
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verify(token: string | undefined, userAgent: string): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  try {
    const expected = Buffer.from(sign(payload));
    const given    = Buffer.from(sig);
    if (expected.length !== given.length) return false;
    if (!timingSafeEqual(expected, given)) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return (
      data.mod === true &&
      typeof data.exp === "number" &&
      data.exp > Date.now() &&
      typeof data.ua === "string" &&
      safeEqual(data.ua, userAgentDigest(userAgent))
    );
  } catch {
    return false;
  }
}

export function checkModPassword(password: string): boolean {
  const expected = process.env.MODERATOR_PASSWORD;
  if (
    !expected ||
    expected.length < 12 ||
    expected.length > 128 ||
    password.length > 128
  ) {
    return false;
  }
  return safeEqual(password, expected);
}

export async function setModSession(request: Request) {
  const jar = await cookies();
  jar.set(COOKIE, createToken(request.headers.get("user-agent") ?? ""), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: MAX_AGE,
    path: "/",
    priority: "high",
  });
}

export async function clearModSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getModSession(): Promise<boolean> {
  try {
    const jar = await cookies();
    const requestHeaders = await headers();
    return verify(
      jar.get(COOKIE)?.value,
      requestHeaders.get("user-agent") ?? "",
    );
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
