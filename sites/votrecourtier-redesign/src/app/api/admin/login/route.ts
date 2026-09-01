import { NextResponse } from "next/server";
import { checkPassword, createSession } from "@/lib/admin/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, error: "Mot de passe incorrect." }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
