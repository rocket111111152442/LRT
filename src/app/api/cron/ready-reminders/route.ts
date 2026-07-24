import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { processReadyReminders } from "@/lib/readyReminders";

function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "cron").update(a).digest();
  const hb = createHmac("sha256", "cron").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization") ?? "";

  // Sans secret configuré : refus total en production (l'endpoint envoie des
  // emails, il ne doit jamais être déclenchable publiquement).
  if (!cronSecret || cronSecret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "CRON_SECRET non configure ou trop court." },
        { status: 503 },
      );
    }
  } else if (!safeEqual(authorization, `Bearer ${cronSecret}`)) {
    // Header absent OU différent -> rejeté (corrige le bypass précédent).
    return NextResponse.json({ error: "Non autorise." }, { status: 401 });
  }

  const result = await processReadyReminders();
  return NextResponse.json(result);
}
