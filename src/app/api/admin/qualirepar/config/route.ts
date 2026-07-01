import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(body: Record<string, unknown>, key: string) {
  return typeof body[key] === "string" ? String(body[key]).trim() : "";
}

// GET : état de la config QualiRépar (on ne renvoie jamais la clé en clair).
export async function GET() {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;
  if (!admin.user.proAccountId) {
    return NextResponse.json({ hasApiKey: false, siteId: "" });
  }

  const account = await prisma.proAccount.findUnique({
    where: { id: admin.user.proAccountId },
    select: { qualireparApiKey: true, qualireparSiteId: true },
  });

  return NextResponse.json({
    hasApiKey: Boolean(account?.qualireparApiKey),
    siteId: account?.qualireparSiteId ?? "",
  });
}

// PATCH : enregistre la clé API et le SiteId AgoraPlus de l'atelier.
export async function PATCH(request: Request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;
  if (!admin.user.proAccountId) {
    return NextResponse.json({ error: "Compte pro introuvable." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!isRecord(body)) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const apiKey = readText(body, "apiKey");
  const siteId = readText(body, "siteId");
  const clearApiKey = body.clearApiKey === true;

  const data: Record<string, unknown> = { qualireparSiteId: siteId || null };
  if (clearApiKey) {
    data.qualireparApiKey = null;
  } else if (apiKey) {
    // On ne remplace la clé que si une nouvelle valeur est saisie (le champ est
    // vide par défaut car la clé n'est jamais renvoyée au navigateur).
    data.qualireparApiKey = apiKey;
  }

  await prisma.proAccount.update({
    where: { id: admin.user.proAccountId },
    data,
  });

  const account = await prisma.proAccount.findUnique({
    where: { id: admin.user.proAccountId },
    select: { qualireparApiKey: true, qualireparSiteId: true },
  });

  return NextResponse.json({
    ok: true,
    hasApiKey: Boolean(account?.qualireparApiKey),
    siteId: account?.qualireparSiteId ?? "",
  });
}
