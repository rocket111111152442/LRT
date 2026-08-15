import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const TOKEN_VERSION = "v1";
const TOKEN_TTL_MS = 10 * 60 * 1000;

export type ReferralEvent = {
  employeeCode: string;
  externalSaleId: string;
  event: "trial_started" | "paid";
  customerName: string;
  customerEmail: string;
  amountCents?: number;
  planLabel?: string;
};

function getKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET manquant pour signer l'attribution commerciale.");
  }

  return createHash("sha256").update(`qoravo-referral:${secret}`).digest();
}

function encode(value: Buffer) {
  return value.toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url");
}

function isReferralEvent(value: unknown): value is ReferralEvent & { expiresAt: number } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;

  return (
    typeof record.employeeCode === "string" &&
    record.employeeCode.length >= 3 &&
    record.employeeCode.length <= 40 &&
    typeof record.externalSaleId === "string" &&
    record.externalSaleId.length >= 1 &&
    record.externalSaleId.length <= 200 &&
    (record.event === "trial_started" || record.event === "paid") &&
    typeof record.customerName === "string" &&
    record.customerName.length <= 250 &&
    typeof record.customerEmail === "string" &&
    record.customerEmail.length <= 320 &&
    typeof record.expiresAt === "number" &&
    record.expiresAt >= Date.now()
  );
}

export function createReferralEventToken(event: ReferralEvent) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(
      JSON.stringify({ ...event, expiresAt: Date.now() + TOKEN_TTL_MS }),
      "utf8",
    ),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [TOKEN_VERSION, encode(iv), encode(tag), encode(encrypted)].join(".");
}

export function readReferralEventToken(token: string) {
  const [version, iv, tag, encrypted] = token.split(".");
  if (version !== TOKEN_VERSION || !iv || !tag || !encrypted) return null;

  try {
    const decipher = createDecipheriv("aes-256-gcm", getKey(), decode(iv));
    decipher.setAuthTag(decode(tag));
    const plaintext = Buffer.concat([
      decipher.update(decode(encrypted)),
      decipher.final(),
    ]).toString("utf8");
    const event = JSON.parse(plaintext) as unknown;
    return isReferralEvent(event) ? event : null;
  } catch {
    return null;
  }
}

