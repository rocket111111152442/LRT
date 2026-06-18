import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { setAdminSessionCookie } from "@/lib/auth";
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
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email et mot de passe requis." },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        proAccountId: true,
        proAccount: {
          select: {
            slug: true,
            paymentStatus: true,
          },
        },
      },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Identifiants invalides." },
        { status: 401 },
      );
    }

    if (user.proAccount && user.proAccount.paymentStatus !== "PAID") {
      return NextResponse.json(
        { error: "Paiement en attente pour ce compte pro." },
        { status: 403 },
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Identifiants invalides." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: "ADMIN",
        proAccountId: user.proAccountId,
        proAccountSlug: user.proAccount?.slug ?? null,
      },
    });

    setAdminSessionCookie(response, {
      id: user.id,
      email: user.email,
      role: "ADMIN",
      proAccountId: user.proAccountId,
      proAccountSlug: user.proAccount?.slug ?? null,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        error:
          "Base de donnees indisponible. Relancez Prisma puis reessayez.",
      },
      { status: 500 },
    );
  }
}
