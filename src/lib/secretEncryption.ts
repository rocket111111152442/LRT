import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

const PREFIX = "enc:v1";

function encryptionKey() {
  const secret = process.env.DATA_ENCRYPTION_KEY || process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET manquant ou trop court pour chiffrer les secrets.",
      );
    }

    return createHash("sha256")
      .update("dev-secret-change-me-please-set-auth-secret")
      .digest();
  }

  return createHash("sha256").update(`qoravo-secrets:${secret}`).digest();
}

export function isEncryptedSecret(value: string | null | undefined) {
  return Boolean(value?.startsWith(`${PREFIX}:`));
}

export function encryptSecret(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  if (isEncryptedSecret(value)) {
    return value;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    PREFIX,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

export function decryptSecret(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  // Compatibilite avec les valeurs en clair enregistrees avant ce durcissement.
  if (!isEncryptedSecret(value)) {
    return value;
  }

  const [, version, ivValue, tagValue, encryptedValue] = value.split(":");

  if (
    version !== "v1" ||
    !ivValue ||
    !tagValue ||
    !encryptedValue
  ) {
    return "";
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(ivValue, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));

    return Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return "";
  }
}
