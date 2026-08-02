// Un compte pro est "actif" (accès admin et réception de réparations) s'il est
// PAYÉ ou en essai gratuit non expiré.
//
// Le référencement public est volontairement traité séparément par
// canPublishShop : il reste réservé aux comptes payants.
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

export function canPublishShop(
  account:
    | { paymentStatus?: string | null }
    | null
    | undefined,
): boolean {
  return account?.paymentStatus === "PAID";
}
