// Un compte pro est "actif" (accès complet, pages publiques visibles, réception
// de réparations...) s'il est PAYÉ ou en essai gratuit non expiré.
//
// Pendant les 7 jours d'essai, tout doit fonctionner exactement comme un compte
// payé. Le blocage n'intervient qu'à l'expiration de l'essai.
export function isProAccountActive(
  account:
    | { paymentStatus?: string | null; trialEndsAt?: Date | string | null }
    | null
    | undefined,
): boolean {
  if (!account) {
    return false;
  }

  if (account.paymentStatus === "PAID") {
    return true;
  }

  if (account.paymentStatus === "TRIAL" && account.trialEndsAt) {
    const end = new Date(account.trialEndsAt);
    return !Number.isNaN(end.getTime()) && end > new Date();
  }

  return false;
}
