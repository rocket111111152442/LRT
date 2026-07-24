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
  if (!email) {
    return false;
  }

  return safeEqual(
    repair.email.trim().toLowerCase(),
    email.trim().toLowerCase(),
  );
}
