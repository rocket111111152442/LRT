import { NextResponse } from "next/server";
import { checkModPassword, setModSession } from "@/lib/modAuth";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requete invalide." }, { status: 400 }); }

  const password = typeof body === "object" && body !== null && "password" in body
    ? String((body as Record<string, unknown>).password)
    : "";

  if (!checkModPassword(password)) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  await setModSession();
  return NextResponse.json({ ok: true });
}
