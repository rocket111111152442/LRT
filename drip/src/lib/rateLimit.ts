import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };

// Compteur en mémoire : suffisant pour freiner le bourrage de formulaires sur
// une instance. Pour un déploiement multi-régions, brancher un store partagé
// (Upstash, Redis) derrière la même interface.
const buckets = new Map<string, Bucket>();

function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export async function clientIp() {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return store.get("x-real-ip") ?? "inconnu";
}

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

export function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { ok: true, retryAfterSeconds: 0 };
}

export async function limitByIp(
  scope: string,
  limit: number,
  windowSeconds: number,
) {
  const ip = await clientIp();
  return rateLimit(`${scope}:${ip}`, limit, windowSeconds);
}
