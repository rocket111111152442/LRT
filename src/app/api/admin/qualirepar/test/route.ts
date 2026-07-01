import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { testConnection } from "@/lib/qualirepar";

function readText(body: unknown, key: string) {
  return body && typeof body === "object" && key in body
    ? String((body as Record<string, unknown>)[key] ?? "").trim()
    : "";
}

// POST : teste les identifiants AgoraPlus (clé saisie dans le formulaire, ou
// clé déjà enregistrée si le champ est laissé vide).
export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;
  if (!admin.user.proAccountId) {
    return NextResponse.json({ error: "Compte pro introuvable." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  let apiKey = readText(body, "apiKey");

  if (!apiKey) {
    const account = await prisma.proAccount.findUnique({
      where: { id: admin.user.proAccountId },
      select: { qualireparApiKey: true },
    });
    apiKey = account?.qualireparApiKey ?? "";
  }

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Aucune clé API à tester. Saisissez votre clé AgoraPlus." },
      { status: 400 },
    );
  }

  const result = await testConnection(apiKey);
  if (result.ok) {
    return NextResponse.json({ ok: true, message: "Connexion AgoraPlus réussie. Identifiants valides." });
  }

  return NextResponse.json(
    { ok: false, error: result.error ?? "Connexion AgoraPlus échouée." },
    { status: 200 },
  );
}
