import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validation";
import { limitByIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = await limitByIp("newsletter", 5, 600);

  if (!limit.ok) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Adresse invalide." },
      { status: 400 },
    );
  }

  try {
    // Une adresse déjà inscrite renvoie le même message de succès : on ne
    // divulgue pas qui figure dans la liste.
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      create: { email: parsed.data.email, source: parsed.data.source ?? null },
      update: {},
    });
  } catch (error) {
    console.error("[newsletter] inscription impossible :", error);
    return NextResponse.json(
      { error: "Inscription impossible pour le moment. Réessayez plus tard." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
