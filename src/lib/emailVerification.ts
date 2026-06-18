import bcrypt from "bcrypt";
import { randomInt, randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationCodeEmail } from "@/lib/mail";

export type EmailVerificationPurpose = "SIGNUP" | "LOGIN" | "PASSWORD_RESET";

const CODE_TTL_MS = 10 * 60 * 1000;

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
    verificationId: uniqueVerificationId,
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
