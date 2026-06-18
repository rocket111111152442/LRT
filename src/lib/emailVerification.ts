import bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationCodeEmail } from "@/lib/mail";

export type EmailVerificationPurpose = "SIGNUP" | "LOGIN";

const CODE_TTL_MS = 10 * 60 * 1000;

function verificationId(email: string, purpose: EmailVerificationPurpose) {
  return Buffer.from(`${purpose}:${email.toLowerCase()}`).toString("base64url");
}

function generateCode() {
  return String(randomInt(100000, 1000000));
}

function normalizeCode(code: string) {
  return code.replace(/\D/g, "").slice(0, 6);
}

export async function sendEmailVerificationCode(
  email: string,
  purpose: EmailVerificationPurpose,
) {
  const normalizedEmail = email.trim().toLowerCase();
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  await prisma.emailVerificationCode.upsert({
    where: { id: verificationId(normalizedEmail, purpose) },
    update: {
      email: normalizedEmail,
      purpose,
      codeHash,
      expiresAt,
    },
    create: {
      id: verificationId(normalizedEmail, purpose),
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
    await prisma.emailVerificationCode
      .delete({ where: { id: verificationId(normalizedEmail, purpose) } })
      .catch(() => null);
  }

  return result;
}

export async function verifyEmailCode(
  email: string,
  purpose: EmailVerificationPurpose,
  code: string,
) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCode = normalizeCode(code);

  if (normalizedCode.length !== 6) {
    return false;
  }

  const storedCode = await prisma.emailVerificationCode.findUnique({
    where: { id: verificationId(normalizedEmail, purpose) },
    select: {
      id: true,
      codeHash: true,
      expiresAt: true,
    },
  });

  if (!storedCode || storedCode.expiresAt.getTime() < Date.now()) {
    return false;
  }

  const isValid = await bcrypt.compare(normalizedCode, storedCode.codeHash);

  if (!isValid) {
    return false;
  }

  await prisma.emailVerificationCode
    .delete({ where: { id: storedCode.id } })
    .catch(() => null);

  return true;
}
