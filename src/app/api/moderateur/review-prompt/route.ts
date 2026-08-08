import { NextResponse } from "next/server";
import { requireModApi } from "@/lib/modAuth";
import { prisma } from "@/lib/prisma";

// Le modérateur déclenche manuellement l'affichage de la pop d'avis pour tous
// les ateliers : on met à jour la date de campagne dans PlatformSettings.
export async function POST() {
  const auth = await requireModApi();
  if (!auth.ok) return auth.response as unknown as ReturnType<typeof NextResponse.json>;

  const now = new Date();

  await prisma.platformSettings.upsert({
    where: { id: "default" },
    update: { reviewPromptSentAt: now },
    create: { id: "default", reviewPromptSentAt: now },
  });

  return NextResponse.json({ ok: true, sentAt: now.getTime() });
}
