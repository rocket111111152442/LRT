import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import {
  sendEmailVerificationCode,
  verifyEmailCode,
} from "@/lib/emailVerification";
import { prisma } from "@/lib/prisma";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
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

  if (!email) {
    return NextResponse.json({ error: "Email requis." }, { status: 400 });
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

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Aucun compte admin trouve avec cet email." },
        { status: 404 },
      );
    }

    if (!code && !password) {
      const result = await sendEmailVerificationCode(user.email, "PASSWORD_RESET");

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

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit faire au moins 8 caracteres." },
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
