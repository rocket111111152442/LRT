import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import {
  sendEmailVerificationCode,
  verifyEmailCode,
} from "@/lib/emailVerification";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rateLimit";

const DUMMY_PASSWORD_HASH =
  "$2b$12$r7imavEnwxuYuegUwFtUGuZKk24P/0KRh65pyE/7GjKK/aREYTNcW";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const ipKey = `password-reset:${ip}`;
  const ipLimit = rateLimit(ipKey, 8, 15 * 60 * 1000);

  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Reessayez dans quelques minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const verificationId =
    typeof body.verificationId === "string" ? body.verificationId.trim() : "";

  if (!email || email.length > 254 || password.length > 128) {
    return NextResponse.json({ error: "Email requis." }, { status: 400 });
  }

  const emailKey = `password-reset-email:${email}`;
  const emailLimit = rateLimit(emailKey, 6, 15 * 60 * 1000);

  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Reessayez dans quelques minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(emailLimit.retryAfterSeconds) },
      },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!code && !password) {
      if (!user || user.role !== "ADMIN") {
        // Reponse volontairement identique pour ne pas permettre de recenser
        // les adresses possedant un compte.
        await bcrypt.compare("qoravo-password-reset-dummy", DUMMY_PASSWORD_HASH);
        return NextResponse.json({
          requiresCode: true,
          message:
            "Si un compte existe, un code de recuperation vient d etre envoye.",
          verificationId: "",
        });
      }

      const result = await sendEmailVerificationCode(
        user.email,
        "PASSWORD_RESET",
      );

      if (result.skipped) {
        return NextResponse.json(
          {
            error:
              "Recuperation impossible : le SMTP serveur n est pas configure.",
          },
          { status: 503 },
        );
      }

      if (!result.sent) {
        return NextResponse.json(
          { error: "Envoi du code impossible pour le moment." },
          { status: 500 },
        );
      }

      return NextResponse.json({
        requiresCode: true,
        message: "Code de recuperation envoye. Verifiez votre boite email.",
        verificationId: result.verificationId,
      });
    }

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Code de recuperation invalide ou expire." },
        { status: 400 },
      );
    }

    if (
      password.length < 12 ||
      !/[A-Za-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      return NextResponse.json(
        {
          error:
            "Le nouveau mot de passe doit faire au moins 12 caracteres et contenir une lettre et un chiffre.",
        },
        { status: 400 },
      );
    }

    const isValidCode = await verifyEmailCode(
      user.email,
      "PASSWORD_RESET",
      code,
      verificationId,
    );

    if (!isValidCode) {
      return NextResponse.json(
        { error: "Code de recuperation invalide ou expire." },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(password, 12),
      },
    });

    resetRateLimit(ipKey);
    resetRateLimit(emailKey);

    return NextResponse.json({
      message: "Mot de passe modifie. Vous pouvez vous connecter.",
    });
  } catch (error) {
    console.error("Admin password reset failed", error);
    return NextResponse.json(
      {
        error:
          "Recuperation impossible pour le moment. Verifiez la base Qoravo sur Vercel, puis reessayez.",
      },
      { status: 500 },
    );
  }
}
