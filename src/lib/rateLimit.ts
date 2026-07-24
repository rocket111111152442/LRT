// Limiteur de tentatives en mémoire (best-effort).
//
// Note : sur Vercel (serverless), la mémoire n'est pas partagée entre instances
// ni garantie persistante. Ce limiteur reste une défense en profondeur utile
// contre le brute-force rapide depuis une même instance, sans dépendance
// externe. Pour une protection forte multi-instances, brancher un store type
// Upstash/Redis.

import { isIP } from "node:net";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 20_000;
let operationsSinceCleanup = 0;

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

/**
 * @param key      identifiant (ex: `login:<ip>`)
 * @param limit    nombre de tentatives autorisées par fenêtre
 * @param windowMs durée de la fenêtre en millisecondes
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  operationsSinceCleanup += 1;

  if (operationsSinceCleanup >= 250 || buckets.size >= MAX_BUCKETS) {
    operationsSinceCleanup = 0;

    for (const [bucketKey, value] of buckets) {
      if (value.resetAt <= now) {
        buckets.delete(bucketKey);
      }
    }

    while (buckets.size >= MAX_BUCKETS) {
      const oldestKey = buckets.keys().next().value;

      if (typeof oldestKey !== "string") {
        break;
      }

      buckets.delete(oldestKey);
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Réinitialise le compteur (ex: après une connexion réussie). */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}

/** Extrait une IP cliente best-effort depuis les en-têtes de la requête. */
export function clientIp(request: Request): string {
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const forwarded = request.headers.get("x-forwarded-for");
  const candidates = [
    vercelForwarded?.split(",").at(-1),
    realIp,
    forwarded?.split(",").at(-1),
  ];

  for (const candidate of candidates) {
    const normalized = candidate?.trim().replace(/^\[|\]$/g, "");

    if (normalized && normalized.length <= 45 && isIP(normalized)) {
      return normalized;
    }
  }

  return "unknown";
}
