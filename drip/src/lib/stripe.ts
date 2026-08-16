import Stripe from "stripe";

let client: Stripe | null = null;

export function stripeEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY manquante : le paiement ne peut pas être initialisé.",
    );
  }

  if (!client) {
    // On laisse le SDK utiliser la version d'API sur laquelle il est testé
    // plutôt que d'en figer une à la main.
    client = new Stripe(key, { typescript: true });
  }

  return client;
}

export function appUrl() {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : null);

  return (configured ?? "http://localhost:3000").replace(/\/$/, "");
}
