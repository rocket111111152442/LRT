import { NextResponse } from "next/server";
import { searchAlertSchema } from "@/lib/validations/search-alert";
import { looksLikeSpam } from "@/lib/forms/anti-spam";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  if (isRateLimited(`search-alert:${ip}`)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = searchAlertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_error" }, { status: 422 });
  }

  if (looksLikeSpam(parsed.data)) {
    return NextResponse.json({ ok: true });
  }

  // Démonstration : aucun e-mail n'est réellement envoyé, voir
  // src/lib/data/README.md pour brancher un vrai service d'alertes.
  console.info("[search-alert] alerte de démonstration enregistrée", { receivedAt: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}
