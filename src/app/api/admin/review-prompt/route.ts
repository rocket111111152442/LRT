import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Renvoie la date du dernier envoi manuel de la pop d'avis (déclenché par le
// modérateur). La pop côté admin s'affiche si cette date est plus récente que la
// dernière action de l'admin, ou automatiquement tous les 7 jours (géré côté
// client via localStorage).
export async function GET() {
  const admin = await requireAdminApi();
  if (!admin.ok) {
    return admin.response;
  }

  try {
    const settings = await prisma.platformSettings.findUnique({
      where: { id: "default" },
    });
    const sentAt = settings?.reviewPromptSentAt
      ? new Date(settings.reviewPromptSentAt).getTime()
      : null;

    return NextResponse.json(
      { sentAt },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { sentAt: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
