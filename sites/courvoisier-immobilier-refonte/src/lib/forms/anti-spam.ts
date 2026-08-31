interface SpamCheckable {
  website?: string;
  renderedAt?: number;
}

const MIN_FILL_TIME_MS = 1500;

/** Honeypot + délai minimal de remplissage : filtre les soumissions automatisées. */
export function looksLikeSpam(data: SpamCheckable): boolean {
  if (data.website && data.website.length > 0) return true;
  if (typeof data.renderedAt === "number") {
    const elapsed = Date.now() - data.renderedAt;
    if (elapsed < MIN_FILL_TIME_MS) return true;
  }
  return false;
}
