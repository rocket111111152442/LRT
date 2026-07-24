import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";
import type { PaidProAccountData } from "@/lib/pro/paymentActivation";

const TOKEN_VERSION = "v1";
const TOKEN_TTL_MS = 60 * 60 * 1000;

function getKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET manquant en production.");
    }
    return createHash("sha256").update("dev-secret-change-me-please").digest();
  }

  return createHash("sha256").update(secret).digest();
}

function encode(value: Buffer) {
  return value.toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: keyof PaidProAccountData) {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function readOptionalString(
  record: Record<string, unknown>,
  key: keyof PaidProAccountData,
) {
  const value = record[key];
  return typeof value === "string" && value ? value : null;
}

function readOptionalNumber(
  record: Record<string, unknown>,
  key: keyof PaidProAccountData,
) {
  const value = record[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value && Number.isFinite(Number(value))) {
    return Number(value);
  }

  return null;
}

function readAccountData(payload: unknown): PaidProAccountData | null {
  if (!isRecord(payload)) {
    return null;
  }

  const expiresAt = payload.expiresAt;

  if (typeof expiresAt !== "number" || expiresAt < Date.now()) {
    return null;
  }

  const data: PaidProAccountData = {
    companyName: readString(payload, "companyName"),
    slug: readString(payload, "slug"),
    ownerEmail: readString(payload, "ownerEmail"),
    passwordHash: readString(payload, "passwordHash"),
    firebaseApiKey: readString(payload, "firebaseApiKey"),
    firebaseAuthDomain: readString(payload, "firebaseAuthDomain"),
    firebaseProjectId: readString(payload, "firebaseProjectId"),
    firebaseStorageBucket: readOptionalString(payload, "firebaseStorageBucket"),
    firebaseMessagingSenderId: readOptionalString(
      payload,
      "firebaseMessagingSenderId",
    ),
    firebaseAppId: readString(payload, "firebaseAppId"),
    shopAddress: readOptionalString(payload, "shopAddress"),
    shopPostalCode: readOptionalString(payload, "shopPostalCode"),
    shopCity: readOptionalString(payload, "shopCity"),
    shopCountry: readOptionalString(payload, "shopCountry"),
    shopPhone: readOptionalString(payload, "shopPhone"),
    shopEmail: readOptionalString(payload, "shopEmail"),
    shopOpeningHours: readOptionalString(payload, "shopOpeningHours"),
    shopLatitude: readOptionalNumber(payload, "shopLatitude"),
    shopLongitude: readOptionalNumber(payload, "shopLongitude"),
    shopCapacityPerDay: readOptionalNumber(payload, "shopCapacityPerDay") ?? 8,
    shopSlotDurationMinutes:
      readOptionalNumber(payload, "shopSlotDurationMinutes") ?? 60,
    shopMaxAppointmentsPerSlot:
      readOptionalNumber(payload, "shopMaxAppointmentsPerSlot") ?? 1,
    premiumDiscountCode: readOptionalString(payload, "premiumDiscountCode"),
  };

  if (
    !data.companyName ||
    !data.slug ||
    !data.ownerEmail ||
    !data.passwordHash ||
    !data.firebaseApiKey ||
    !data.firebaseAuthDomain ||
    !data.firebaseProjectId ||
    !data.firebaseAppId
  ) {
    return null;
  }

  return data;
}

export function createSignupToken(data: PaidProAccountData) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const plaintext = JSON.stringify({
    ...data,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  });
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [TOKEN_VERSION, encode(iv), encode(tag), encode(encrypted)].join(".");
}

export function readSignupToken(token: string) {
  const [version, iv, tag, encrypted] = token.split(".");

  if (version !== TOKEN_VERSION || !iv || !tag || !encrypted) {
    return null;
  }

  try {
    const decipher = createDecipheriv("aes-256-gcm", getKey(), decode(iv));
    decipher.setAuthTag(decode(tag));
    const plaintext = Buffer.concat([
      decipher.update(decode(encrypted)),
      decipher.final(),
    ]).toString("utf8");

    return readAccountData(JSON.parse(plaintext));
  } catch {
    return null;
  }
}
