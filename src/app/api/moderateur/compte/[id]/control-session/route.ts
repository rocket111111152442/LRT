import { NextResponse } from "next/server";
import {
  findActiveControlRequest,
  readControlSignals,
  saveControlSignal,
  validateControlSignal,
} from "@/lib/controlSignals";
import { requireModApi } from "@/lib/modAuth";
import { clientIp, rateLimit } from "@/lib/rateLimit";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const auth = await requireModApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const controlRequest = await findActiveControlRequest(id);

  if (!controlRequest) {
    return NextResponse.json({ active: false });
  }

  return NextResponse.json({
    active: true,
    requestId: controlRequest.id,
    expiresAt: controlRequest.expiresAt,
    signals: await readControlSignals({
      controlRequestId: controlRequest.id,
      sender: "CLIENT",
    }),
  });
}

export async function POST(request: Request, context: Context) {
  const auth = await requireModApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const limit = rateLimit(
    `control-signal-moderator:${id}:${clientIp(request)}`,
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

  const controlRequest = await findActiveControlRequest(id);

  if (!controlRequest) {
    return NextResponse.json(
      { error: "Aucune session d assistance autorisee." },
      { status: 409 },
    );
  }

  const body = await request.json().catch(() => null);
  const signal =
    body && typeof body === "object"
      ? validateControlSignal(body, "MODERATOR")
      : { ok: false as const, error: "Requete invalide." };

  if (!signal.ok) {
    return NextResponse.json({ error: signal.error }, { status: 400 });
  }

  const saved = await saveControlSignal({
    controlRequestId: controlRequest.id,
    sender: "MODERATOR",
    kind: signal.kind,
    payload: signal.payload,
  });

  return NextResponse.json({ ok: true, signalId: saved.id });
}
