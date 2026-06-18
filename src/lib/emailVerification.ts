import bcrypt from "bcrypt";
import {
  createHmac,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationCodeEmail } from "@/lib/mail";

export type EmailVerificationPurpose = "SIGNUP" | "LOGIN" | "PASSWORD_RESET";

const CODE_TTL_MS = 10 * 60 * 1000;
const TOKEN_PREFIX = "v2";

function verificationId(
  email: string,
  purpose: EmailVerificationPurpose,
  requestId = "latest",
) {
  return Buffer.from(`${purpose}:${email.toLowerCase()}:${requestId}`).toString(
    "base64url",
  );
}

function generateCode() {
  return String(randomInt(100000, 1000000));
}

function normalizeCode(code: string) {
  return code.replace(/\D/g, "").slice(0, 6);
}

function getSecret() {
  return process.env.AUTH_SECRET || "dev-secret-change-me";
}

function hmac(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function codeDigest(input: {
  email: string;
  purpose: EmailVerificationPurpose;
  code: string;
  requestId: string;
  expiresAtMs: number;
}) {
  return hmac(
    [
      input.purpose,
      input.email,
      normalizeCode(input.code),
      input.requestId,
      String(input.expiresAtMs),
    ].join(":"),
  );
}

function createVerificationToken(input: {
  email: string;
  purpose: EmailVerificationPurpose;
  code: string;
  requestId: string;
  expiresAt: Date;
}) {
  const expiresAtMs = input.expiresAt.getTime();
  const payload = {
    email: input.email,
    purpose: input.purpose,
    requestId: input.requestId,
    expiresAtMs,
    digest: codeDigest({
      email: input.email,
      purpose: input.purpose,
      code: input.code,
      requestId: input.requestId,
      expiresAtMs,
    }),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );

  return `${TOKEN_PREFIX}.${encodedPayload}.${hmac(encodedPayload)}`;
}

function readVerificationToken(token: string) {
  const [prefix, encodedPayload, signature] = token.split(".");

  if (prefix !== TOKEN_PREFIX || !encodedPayload || !signature) {
    return null;
  }

  if (!safeEqual(signature, hmac(encodedPayload))) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as {
      email?: unknown;
      purpose?: unknown;
      requestId?: unknown;
      expiresAtMs?: unknown;
      digest?: unknown;
    };

    if (
      typeof payload.email !== "string" ||
      typeof payload.purpose !== "string" ||
      typeof payload.requestId !== "string" ||
      typeof payload.expiresAtMs !== "number" ||
      typeof payload.digest !== "string"
    ) {
      return null;
    }

    return payload as {
      email: string;
      purpose: EmailVerificationPurpose;
      requestId: string;
      expiresAtMs: number;
      digest: string;
    };
  } catch {
    return null;
  }
}

async function verifyCodeWithToken(input: {
  email: string;
  purpose: EmailVerificationPurpose;
  code: string;
  token?: string;
}) {
  if (!input.token) {
    return null;
  }

  const payload = readVerificationToken(input.token);

  if (!payload) {
    return null;
  }

  if (
    payload.email !== input.email ||
    payload.purpose !== input.purpose ||
    payload.expiresAtMs < Date.now()
  ) {
    return false;
  }

  const digest = codeDigest({
    email: input.email,
    purpose: input.purpose,
    code: input.code,
    requestId: payload.requestId,
    expiresAtMs: payload.expiresAtMs,
  });

  if (!safeEqual(digest, payload.digest)) {
    return false;
  }

  await Promise.all([
    prisma.emailVerificationCode
      .delete({
        where: {
          id: verificationId(input.email, input.purpose, payload.requestId),
        },
      })
      .catch(() => null),
    prisma.emailVerificationCode
      .delete({ where: { id: verificationId(input.email, input.purpose) } })
      .catch(() => null),
  ]);

  return true;
}

function toDate(value: unknown) {
  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate() as Date;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export async function sendEmailVerificationCode(
  email: string,
  purpose: EmailVerificationPurpose,
) {
  const normalizedEmail = email.trim().toLowerCase();
  const requestId = randomUUID();
  const uniqueVerificationId = verificationId(normalizedEmail, purpose, requestId);
  const latestVerificationId = verificationId(normalizedEmail, purpose);
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);
  const verificationToken = createVerificationToken({
    email: normalizedEmail,
    purpose,
    code,
    requestId,
    expiresAt,
  });

  await prisma.emailVerificationCode.upsert({
    where: { id: uniqueVerificationId },
    update: {
      email: normalizedEmail,
      purpose,
      codeHash,
      expiresAt,
    },
    create: {
      id: uniqueVerificationId,
      email: normalizedEmail,
      purpose,
      codeHash,
      expiresAt,
    },
  });

  await prisma.emailVerificationCode.upsert({
    where: { id: latestVerificationId },
    update: {
      email: normalizedEmail,
      purpose,
      codeHash,
      expiresAt,
    },
    create: {
      id: latestVerificationId,
      email: normalizedEmail,
      purpose,
      codeHash,
      expiresAt,
    },
  });

  const result = await sendVerificationCodeEmail({
    email: normalizedEmail,
    code,
    purpose,
  });

  if (!result.sent) {
    await Promise.all([
      prisma.emailVerificationCode
        .delete({ where: { id: uniqueVerificationId } })
        .catch(() => null),
      prisma.emailVerificationCode
        .delete({ where: { id: latestVerificationId } })
        .catch(() => null),
    ]);
  }

  return {
    ...result,
    verificationId: verificationToken,
    verificationToken,
  };
}

export async function verifyEmailCode(
  email: string,
  purpose: EmailVerificationPurpose,
  code: string,
  emailVerificationId?: string,
) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCode = normalizeCode(code);
  const latestVerificationId = verificationId(normalizedEmail, purpose);

  if (normalizedCode.length !== 6) {
    return false;
  }

  const tokenResult = await verifyCodeWithToken({
    email: normalizedEmail,
    purpose,
    code: normalizedCode,
    token: emailVerificationId,
  });

  if (tokenResult !== null) {
    return tokenResult;
  }

  let storedCode = await prisma.emailVerificationCode.findUnique({
    where: { id: emailVerificationId || verificationId(normalizedEmail, purpose) },
    select: {
      id: true,
      email: true,
      purpose: true,
      codeHash: true,
      expiresAt: true,
    },
  });

  if (!storedCode && emailVerificationId) {
    storedCode = await prisma.emailVerificationCode.findUnique({
      where: { id: latestVerificationId },
      select: {
        id: true,
        email: true,
        purpose: true,
        codeHash: true,
        expiresAt: true,
      },
    });
  }

  const expiresAt = toDate(storedCode?.expiresAt);

  if (
    !storedCode ||
    storedCode.email !== normalizedEmail ||
    storedCode.purpose !== purpose ||
    !expiresAt ||
    expiresAt.getTime() < Date.now()
  ) {
    return false;
  }

  const isValid = await bcrypt.compare(normalizedCode, storedCode.codeHash);

  if (!isValid) {
    return false;
  }

  await prisma.emailVerificationCode
    .delete({ where: { id: storedCode.id } })
    .catch(() => null);
  if (storedCode.id !== latestVerificationId) {
    await prisma.emailVerificationCode
      .delete({ where: { id: latestVerificationId } })
      .catch(() => null);
  }

  return true;
}
