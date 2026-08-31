import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations/contact";
import { looksLikeSpam } from "@/lib/forms/anti-spam";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

/**
 * Traite le formulaire de contact. Sans RESEND_API_KEY/CONTACT_TO/CONTACT_FROM
 * configurés, la demande est validée et journalisée côté serveur mais aucun
 * e-mail n’est réellement envoyé — voir .env.example et README.md.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  if (isRateLimited(`contact:${ip}`)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_error", issues: parsed.error.issues }, { status: 422 });
  }

  if (looksLikeSpam(parsed.data)) {
    return NextResponse.json({ ok: true });
  }

  const { website: _honeypot, renderedAt: _renderedAt, ...safeData } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM;

  if (apiKey && to && from) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to,
          reply_to: safeData.email,
          subject: `[Courvoisier Concept] ${safeData.subject}`,
          text: `Nom: ${safeData.name}\nE-mail: ${safeData.email}\nTéléphone: ${safeData.phone || "—"}\nAgence: ${safeData.agency || "—"}\n\n${safeData.message}`,
        }),
      });
      if (!res.ok) {
        console.error("[contact] échec d’envoi via Resend", res.status);
        return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
      }
    } catch (error) {
      console.error("[contact] erreur d’envoi", error);
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
    }
  } else {
    console.info("[contact] demande de démonstration journalisée (e-mail non configuré)", {
      subject: safeData.subject,
      receivedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true });
}
