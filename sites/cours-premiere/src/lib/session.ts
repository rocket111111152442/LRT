// Sessions signées (HMAC-SHA256) via Web Crypto, compatibles Node et Edge
// (middleware). Pas de table "sessions" en base : le cookie porte
// l'identifiant utilisateur et une date d'expiration, signés pour empêcher
// toute falsification côté client.

const SESSION_COOKIE = "session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 jours

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET doit être défini (chaîne aléatoire d'au moins 16 caractères).");
  }
  return secret;
}

async function getKey() {
  const enc = new TextEncoder().encode(getSecret());
  return crypto.subtle.importKey("raw", enc, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(input: string): Uint8Array {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

type SessionPayload = { sub: string; exp: number };

export async function createSessionToken(userId: string): Promise<string> {
  const payload: SessionPayload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };
  const payloadPart = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadPart));
  const signaturePart = bytesToBase64Url(new Uint8Array(signature));
  return `${payloadPart}.${signaturePart}`;
}

export async function verifySessionToken(token: string): Promise<string | null> {
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) return null;

  const key = await getKey();
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToBytes(signaturePart) as BufferSource,
    new TextEncoder().encode(payloadPart) as BufferSource,
  );
  if (!valid) return null;

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payloadPart)),
    ) as SessionPayload;
    if (typeof payload.sub !== "string" || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload.sub;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_MAX_AGE = SESSION_DURATION_SECONDS;
