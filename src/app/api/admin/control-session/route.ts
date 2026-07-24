import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import {
  findActiveControlRequest,
  readControlSignals,
  saveControlSignal,
  validateControlSignal,
} from "@/lib/controlSignals";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export async function GET() {
  const admin = await getCurrentAdmin();

  if (!admin?.proAccountId) {
    return NextResponse.json({ active: false }, { status: 401 });
  }

  const request = await findActiveControlRequest(admin.proAccountId);

  if (!request) {
    return NextResponse.json({ active: false });
  }

  return NextResponse.json({
    active: true,
    requestId: request.id,
    expiresAt: request.expiresAt,
    signals: await readControlSignals({
      controlRequestId: request.id,
      sender: "MODERATOR",
    }),
  });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();

  if (!admin?.proAccountId) {
    return NextResponse.json({ error: "Non authentifie." }, { status: 401 });
  }

  const limit = rateLimit(
    `control-signal-client:${admin.id}:${clientIp(request)}`,
    180,
    60_000,
  );

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Trop de signaux envoyes." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const controlRequest = await findActiveControlRequest(admin.proAccountId);

  if (!controlRequest) {
    return NextResponse.json(
      { error: "Aucune session d assistance autorisee." },
      { status: 409 },
    );
  }

  const body = await request.json().catch(() => null);
  const signal =
    body && typeof body === "object"
      ? validateControlSignal(body, "CLIENT")
      : { ok: false as const, error: "Requete invalide." };

  if (!signal.ok) {
    return NextResponse.json({ error: signal.error }, { status: 400 });
  }

  const saved = await saveControlSignal({
    controlRequestId: controlRequest.id,
    sender: "CLIENT",
    kind: signal.kind,
    payload: signal.payload,
  });

  return NextResponse.json({ ok: true, signalId: saved.id });
}
