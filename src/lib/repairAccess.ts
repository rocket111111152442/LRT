import { createHmac, timingSafeEqual } from "crypto";

export type RepairAccessRecord = {
  id: string;
  ticketNumber?: string | null;
  email: string;
};

function accessSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET manquant pour les liens client securises.");
    }

    return "dev-secret-change-me-please-set-auth-secret";
  }

  return secret;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function createRepairAccessToken(repair: RepairAccessRecord) {
  const value = [
    "repair-client-access-v1",
    repair.id,
    repair.ticketNumber ?? "",
    repair.email.trim().toLowerCase(),
  ].join(":");

  return createHmac("sha256", accessSecret())
    .update(value)
    .digest("base64url");
}

export function verifyRepairAccessToken(
  repair: RepairAccessRecord,
  token: string | null | undefined,
) {
  return Boolean(
    token && safeEqual(token, createRepairAccessToken(repair)),
  );
}

export function verifyRepairEmail(
  repair: Pick<RepairAccessRecord, "email">,
  email: string | null | undefined,
) {
  const expected = repair.email.trim().toLowerCase();

  // Une fiche sans email ne peut pas etre verifiee par email.
  if (!email || !expected) {
    return false;
  }

  return safeEqual(expected, email.trim().toLowerCase());
}

function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

// Compare deux numeros sur leurs 9 derniers chiffres pour tolerer les
// ecritures "+33 6..." / "06..." / "0033 6...".
function comparablePhone(value: string) {
  const digits = phoneDigits(value);
  return digits.length > 9 ? digits.slice(-9) : digits;
}

export function verifyRepairPhone(
  repair: { phone: string },
  phone: string | null | undefined,
) {
  if (!phone) {
    return false;
  }

  const expected = comparablePhone(repair.phone);
  const provided = comparablePhone(phone);

  if (expected.length < 6 || provided.length < 6) {
    return false;
  }

  return safeEqual(expected, provided);
}

// Verification client par email OU telephone du dossier : les fiches creees
// au comptoir n'ont pas forcement d'email.
export function verifyRepairContact(
  repair: Pick<RepairAccessRecord, "email"> & { phone: string },
  contact: string | null | undefined,
) {
  if (!contact?.trim()) {
    return false;
  }

  return verifyRepairEmail(repair, contact) || verifyRepairPhone(repair, contact);
}
