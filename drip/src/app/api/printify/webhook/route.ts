import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { applyPrintifyEvent, printifyWebhookSecret } from "@/lib/printify";

// Le corps brut est indispensable : la signature porte sur les octets exacts
// reçus, toute reformulation JSON l'invaliderait.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Compare deux signatures sans laisser fuiter, par le temps de réponse, le
 * nombre de caractères corrects — la comparaison naïve de deux chaînes s'arrête
 * au premier écart et se mesure.
 */
function signatureValide(attendue: string, recue: string) {
  const a = Buffer.from(attendue, "utf8");
  const b = Buffer.from(recue, "utf8");

  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = await printifyWebhookSecret();

  if (!secret) {
    // Sans secret, impossible de distinguer Printify de n'importe qui : on
    // refuse plutôt que de faire confiance à l'expéditeur.
    return NextResponse.json(
      { error: "Suivi des colis non activé." },
      { status: 503 },
    );
  }

  const entete =
    request.headers.get("x-pfy-signature") ??
    request.headers.get("X-Pfy-Signature");

  if (!entete) {
    return NextResponse.json({ error: "Signature absente." }, { status: 400 });
  }

  const payload = await request.text();
  const calculee = createHmac("sha256", secret).update(payload).digest("hex");

  // Printify préfixe la signature par l'algorithme ; d'anciennes intégrations
  // envoient le condensé nu. Les deux formes sont acceptées.
  const recue = entete.replace(/^sha256=/i, "").trim();

  if (!signatureValide(calculee, recue)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  let event: unknown;

  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Corps illisible." }, { status: 400 });
  }

  try {
    const resultat = await applyPrintifyEvent(event as Parameters<typeof applyPrintifyEvent>[0]);
    return NextResponse.json(resultat);
  } catch (error) {
    console.error("[printify] webhook non traité :", error);
    // 500 : Printify réessaiera. Le traitement est idempotent, un rejeu ne
    // duplique rien.
    return NextResponse.json({ error: "Traitement impossible." }, { status: 500 });
  }
}
