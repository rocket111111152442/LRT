// Limiteur de tentatives en mémoire (best-effort).
//
// Note : sur Vercel (serverless), la mémoire n'est pas partagée entre instances
// ni garantie persistante. Ce limiteur reste une défense en profondeur utile
// contre le brute-force rapide depuis une même instance, sans dépendance
// externe. Pour une protection forte multi-instances, brancher un store type
// Upstash/Redis.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

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
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
