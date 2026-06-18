import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function GET() {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const items = await prisma.inventoryItem.findMany({
    where: {
      ...(admin.user.proAccountId ? { proAccountId: admin.user.proAccountId } : {}),
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      quantity: true,
      lowStockThreshold: true,
      unitCostCents: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
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

  const item = await prisma.inventoryItem.create({
    data: {
      proAccountId: admin.user.proAccountId ?? undefined,
      name,
      quantity,
      lowStockThreshold,
      unitCostCents,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
