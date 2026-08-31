import { NextResponse } from "next/server";
import { estimationSchema } from "@/lib/validations/estimation";
import { looksLikeSpam } from "@/lib/forms/anti-spam";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

/**
 * Reçoit une demande d'estimation. Ce concept de démonstration ne calcule
 * JAMAIS un prix : il valide et journalise la demande, puis confirme sa
 * bonne réception. Voir src/lib/data/README.md pour brancher un vrai
 * moteur d'estimation.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  if (isRateLimited(`estimation:${ip}`)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = estimationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_error", issues: parsed.error.issues }, { status: 422 });
  }

  if (looksLikeSpam(parsed.data)) {
    // Réponse volontairement neutre pour ne pas renseigner un robot.
    return NextResponse.json({ ok: true });
  }

  const { website: _honeypot, renderedAt: _renderedAt, ...safeData } = parsed.data;

  // Démonstration : journalisation serveur uniquement. En production,
  // brancher ici l'envoi au CRM / à l'agent local (voir .env.example et
  // src/lib/data/README.md), jamais l'affichage d'un chiffre inventé.
  console.info("[estimation] nouvelle demande de démonstration", {
    commune: safeData.address,
    propertyType: safeData.propertyType,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
