import { NextResponse } from "next/server";
import { checkModPassword, requireModApi } from "@/lib/modAuth";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const PROTECTED_EMAIL = "lullinismael0@gmail.com";

export async function POST(request: Request) {
  const auth = await requireModApi();
  if (!auth.ok) return auth.response as unknown as ReturnType<typeof NextResponse.json>;

  if (process.env.ALLOW_MODERATOR_DATABASE_RESET !== "true") {
    return NextResponse.json(
      { error: "La remise a zero globale est desactivee en production." },
      { status: 403 },
    );
  }

  const limit = rateLimit(
    `moderator-reset-db:${clientIp(request)}`,
    3,
    60 * 60 * 1000,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives de suppression." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const confirm = typeof body === "object" && body !== null && "confirm" in body
    ? (body as Record<string, unknown>).confirm
    : null;
  const moderatorPassword =
    typeof body === "object" &&
    body !== null &&
    "moderatorPassword" in body &&
    typeof (body as Record<string, unknown>).moderatorPassword === "string"
      ? String((body as Record<string, unknown>).moderatorPassword)
      : "";

  if (
    confirm !== "SUPPRIMER TOUS LES COMPTES" ||
    !checkModPassword(moderatorPassword)
  ) {
    return NextResponse.json({ error: "Confirmation manquante." }, { status: 400 });
  }

  // Récupère tous les comptes
  const allAccounts = await prisma.proAccount.findMany({
    select: { id: true, ownerEmail: true, slug: true },
  });

  // Identifie le compte protégé
  const protectedAccount = allAccounts.find(
    (a) => a.ownerEmail.toLowerCase() === PROTECTED_EMAIL.toLowerCase(),
  );

  const toDelete = allAccounts.filter(
    (a) => a.ownerEmail.toLowerCase() !== PROTECTED_EMAIL.toLowerCase(),
  );

  const deleted: string[] = [];
  const errors: string[] = [];

  for (const account of toDelete) {
    try {
      await prisma.proAccount.delete({ where: { id: account.id } });
      deleted.push(account.ownerEmail);
    } catch (err) {
      errors.push(`${account.ownerEmail}: ${err instanceof Error ? err.message : "erreur"}`);
    }
  }

  // Supprime aussi les messages support orphelins (sans compte associé)
  try {
    const orphanMessages = await prisma.supportMessage.findMany({
      where: { proAccountId: null },
    });
    for (const m of orphanMessages) {
      await prisma.supportMessage.delete({ where: { id: m.id } }).catch(() => {});
    }
  } catch { /* non bloquant */ }

  return NextResponse.json({
    ok: true,
    protected: protectedAccount?.ownerEmail ?? null,
    deletedCount: deleted.length,
    errors,
    message: `${deleted.length} compte(s) supprimé(s). Compte protégé : ${protectedAccount?.ownerEmail ?? "introuvable"}.`,
  });
}
