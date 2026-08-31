/**
 * Anti-spam minimal côté serveur, sans dépendance ni CAPTCHA tiers par
 * défaut (voir .env.example pour brancher Turnstile/hCaptcha si besoin) :
 * - honeypot : un champ caché nommé `website` doit rester vide.
 * - délai minimal : un formulaire rempli en moins de 2 secondes est
 *   presque toujours un robot.
 */

const MIN_FILL_TIME_MS = 2000;

export function looksLikeSpam(input: { website?: string; renderedAt?: number }): boolean {
  if (input.website && input.website.length > 0) return true;
  if (typeof input.renderedAt === "number") {
    const elapsed = Date.now() - input.renderedAt;
    if (elapsed >= 0 && elapsed < MIN_FILL_TIME_MS) return true;
  }
  return false;
}
