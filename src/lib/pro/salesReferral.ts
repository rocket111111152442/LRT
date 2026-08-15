import "server-only";

import {
  isFreeAccessCode,
  isPremiumDiscountCode,
  normalizePromoCode,
} from "@/lib/pro/promoCodes";
import {
  createReferralEventToken,
  ReferralEvent,
} from "@/lib/pro/referralEventToken";

const DEFAULT_CRM_URL = "https://qoravo-sales-os.vercel.app";

export class SalesReferralError extends Error {
  constructor(
    message: string,
    public readonly kind: "invalid" | "unavailable" | "promo",
  ) {
    super(message);
  }
}

function integrationUrl() {
  const baseUrl = (process.env.QORAVO_CRM_URL || DEFAULT_CRM_URL).replace(/\/$/, "");
  return `${baseUrl}/api/integrations/qoravo/referral`;
}

async function callCrm(payload: Record<string, unknown>) {
  const url = integrationUrl();
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new SalesReferralError(
      "Le CRM Qoravo ne répond pas pour le moment.",
      "unavailable",
    );
  }

  const result = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    throw new SalesReferralError(
      typeof result.error === "string" ? result.error : "Réponse CRM invalide.",
      response.status === 404 || response.status === 400 ? "invalid" : "unavailable",
    );
  }

  return result;
}

export async function resolveSalesReferralCode(input: {
  referralCode?: string | null;
  promoCode?: string | null;
}) {
  const referralCode = normalizePromoCode(input.referralCode);
  const promoCode = normalizePromoCode(input.promoCode);
  const knownPromo = isFreeAccessCode(promoCode) || isPremiumDiscountCode(promoCode);

  if (referralCode && promoCode && !knownPromo) {
    throw new SalesReferralError("Code promo invalide.", "promo");
  }

  const candidate = referralCode || (!knownPromo ? promoCode : "");

  if (!candidate) {
    return null;
  }

  const result = await callCrm({ action: "validate", employeeCode: candidate });

  if (result.valid !== true || typeof result.employeeCode !== "string") {
    throw new SalesReferralError("Code commercial invalide.", "invalid");
  }

  return normalizePromoCode(result.employeeCode);
}

export async function reportSalesReferralEvent(input: ReferralEvent) {
  await callCrm({
    action: "record",
    eventToken: createReferralEventToken(input),
  });
}

