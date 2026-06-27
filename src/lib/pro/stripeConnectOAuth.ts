import { createHmac, timingSafeEqual } from "crypto";

// Signature du paramètre `state` de l'OAuth Stripe Connect : empêche qu'un tiers
// relie un compte Stripe à un autre compte Qoravo (protection CSRF). On y
// encode l'id du compte pro + un horodatage (validité 1 h).

const STATE_TTL_MS = 60 * 60 * 1000;

function stateSecret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.MODERATOR_SECRET ||
    "dev-stripe-oauth-state-secret"
  );
}

export function signOAuthState(proAccountId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ p: proAccountId, t: Date.now() }),
  ).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyOAuthState(state: string | null | undefined): string | null {
  if (!state) return null;
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return null;

  const expected = createHmac("sha256", stateSecret()).update(payload).digest("base64url");
  const given = Buffer.from(sig);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      p?: string;
      t?: number;
    };
    if (typeof data.t !== "number" || Date.now() - data.t > STATE_TTL_MS) return null;
    return typeof data.p === "string" ? data.p : null;
  } catch {
    return null;
  }
}
