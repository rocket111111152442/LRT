import { createHmac, timingSafeEqual } from "node:crypto";

export const TRIAL_OFFER_COOKIE = "qoravo_trial_offer";
export const TRIAL_OFFER_WINDOW_MS = 72 * 60 * 60 * 1000;
export const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

type TrialOffer = {
  startedAt: number;
  expiresAt: number;
  available: boolean;
};

function secret() {
  const value = process.env.AUTH_SECRET;

  if (!value || value.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET manquant pour l'offre d'essai.");
    }

    return "qoravo-dev-trial-offer-secret-change-me";
  }

  return value;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function signaturesMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function createTrialOfferToken(now = Date.now()) {
  const payload = `${now}.${now + TRIAL_OFFER_WINDOW_MS}`;
  return `${payload}.${sign(payload)}`;
}

export function readTrialOfferToken(
  token: string | null | undefined,
  now = Date.now(),
): TrialOffer | null {
  if (!token) {
    return null;
  }

  const [startedAtText, expiresAtText, signature, ...extra] = token.split(".");
  if (!startedAtText || !expiresAtText || !signature || extra.length > 0) {
    return null;
  }

  const payload = `${startedAtText}.${expiresAtText}`;
  if (!signaturesMatch(signature, sign(payload))) {
    return null;
  }

  const startedAt = Number(startedAtText);
  const expiresAt = Number(expiresAtText);
  if (
    !Number.isSafeInteger(startedAt) ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt - startedAt !== TRIAL_OFFER_WINDOW_MS ||
    startedAt > now + 60_000
  ) {
    return null;
  }

  return {
    startedAt,
    expiresAt,
    available: expiresAt > now,
  };
}
