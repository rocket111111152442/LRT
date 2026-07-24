import { NextResponse } from "next/server";
import { getCurrentAdmin, getImpersonation } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Le commerçant interroge cette route pour savoir si un modérateur demande à
// prendre la main sur son logiciel, et pour accepter ou refuser.

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin?.proAccountId) return NextResponse.json({ pending: false });

  // Un modérateur déjà en prise en main ne doit pas voir la modale.
  const impersonation = await getImpersonation();
  if (impersonation) return NextResponse.json({ pending: false });

  const pendingRequest = await prisma.controlRequest.findFirst({
    where: {
      proAccountId: admin.proAccountId,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (pendingRequest) {
    return NextResponse.json({
      pending: true,
      accepted: false,
      requestId: pendingRequest.id,
      reason: pendingRequest.reason,
      requestedAt: pendingRequest.requestedAt,
    });
  }

  const acceptedRequest = await prisma.controlRequest.findFirst({
    where: {
      proAccountId: admin.proAccountId,
      status: "ACCEPTED",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!acceptedRequest) {
    return NextResponse.json({ pending: false, accepted: false });
  }

  return NextResponse.json({
    pending: false,
    accepted: true,
    requestId: acceptedRequest.id,
    reason: acceptedRequest.reason,
    expiresAt: acceptedRequest.expiresAt,
  });
}

export async function POST(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin?.proAccountId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { requestId?: string; decision?: string }
    | null;
  const requestId = typeof body?.requestId === "string" ? body.requestId : "";
  const decision = body?.decision === "accept" ? "accept" : body?.decision === "refuse" ? "refuse" : "";
  if (!requestId || !decision) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const request = await prisma.controlRequest.findUnique({ where: { id: requestId } });
  if (!request || request.proAccountId !== admin.proAccountId) {
    return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
  }
  if (request.status !== "PENDING") {
    return NextResponse.json({ error: "Demande déjà traitée." }, { status: 409 });
  }

  await prisma.controlRequest.update({
    where: { id: requestId },
    data: {
      status: decision === "accept" ? "ACCEPTED" : "REFUSED",
      respondedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, decision });
}
