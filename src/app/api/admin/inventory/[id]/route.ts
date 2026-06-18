import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function readInt(body: Record<string, unknown>, key: string, fallback: number) {
  const value = Number(body[key] ?? fallback);
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function readCents(body: Record<string, unknown>, key: string, fallback = 0) {
  const value = Number(body[key] ?? fallback);
  return Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
}

async function getAuthorizedItem(id: string, proAccountId: string | null) {
  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    select: {
      id: true,
      proAccountId: true,
    },
  });

  if (!item || (proAccountId && item.proAccountId !== proAccountId)) {
    return null;
  }

  return item;
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;
  const item = await getAuthorizedItem(id, admin.user.proAccountId);

  if (!item) {
    return NextResponse.json({ error: "Piece introuvable." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Requete invalide." }, { status: 400 });
  }

  const name = readText(body, "name");
  const quantity = readInt(body, "quantity", 0);
  const lowStockThreshold = readInt(body, "lowStockThreshold", 1);
  const unitCostCents = readCents(body, "unitCostCents");

  if (
    !name ||
    quantity === null ||
    lowStockThreshold === null ||
    unitCostCents === null
  ) {
    return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
  }

  const updatedItem = await prisma.inventoryItem.update({
    where: { id },
    data: {
      name,
      quantity,
      lowStockThreshold,
      unitCostCents,
    },
  });

  return NextResponse.json({ item: updatedItem });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const { id } = await context.params;
  const item = await getAuthorizedItem(id, admin.user.proAccountId);

  if (!item) {
    return NextResponse.json({ error: "Piece introuvable." }, { status: 404 });
  }

  await prisma.inventoryItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
