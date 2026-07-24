import { NextResponse } from "next/server";
import { checkModPassword, setModSession } from "@/lib/modAuth";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  // Mot de passe unique partagé = cible privilégiée : limite stricte.
  const ip = clientIp(request);
  const limit = rateLimit(`mod-login:${ip}`, 5, 15 * 60 * 1000);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Reessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requete invalide." }, { status: 400 }); }

  const password = typeof body === "object" && body !== null && "password" in body
    ? String((body as Record<string, unknown>).password)
    : "";

  if (!checkModPassword(password)) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  resetRateLimit(`mod-login:${ip}`);
  await setModSession(request);
  return NextResponse.json({ ok: true });
}
