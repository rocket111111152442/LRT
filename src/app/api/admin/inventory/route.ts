import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { normalizeInventoryCategory } from "@/lib/inventory";
import { prisma } from "@/lib/prisma";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalText(body: Record<string, unknown>, key: string) {
  return readText(body, key) || null;
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
      category: true,
      reference: true,
      quantity: true,
      lowStockThreshold: true,
      unitCostCents: true,
      unitPriceCents: true,
      supplier: true,
      location: true,
      notes: true,
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
  const category = normalizeInventoryCategory(body.category);
  const reference = readOptionalText(body, "reference");
  const quantity = readInt(body, "quantity", 0);
  const lowStockThreshold = readInt(body, "lowStockThreshold", 1);
  const unitCostCents = readCents(body, "unitCostCents");
  const unitPriceCents = readCents(body, "unitPriceCents");
  const supplier = readOptionalText(body, "supplier");
  const location = readOptionalText(body, "location");
  const notes = readOptionalText(body, "notes");

  if (
    !name ||
    quantity === null ||
    lowStockThreshold === null ||
    unitCostCents === null ||
    unitPriceCents === null
  ) {
    return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
  }

  const existingItems = await prisma.inventoryItem.findMany({
    where: {
      ...(admin.user.proAccountId ? { proAccountId: admin.user.proAccountId } : {}),
    },
    select: {
      id: true,
      name: true,
      category: true,
      quantity: true,
    },
  });
  // On ne fusionne que des articles identiques (même nom ET même catégorie),
  // pour éviter de confondre une pièce et un accessoire portant le même nom.
  const existingItem = existingItems.find(
    (item) =>
      item.name.trim().toLowerCase() === name.toLowerCase() &&
      item.category === category,
  );

  if (existingItem) {
    const item = await prisma.inventoryItem.update({
      where: { id: existingItem.id },
      data: {
        name: existingItem.name,
        category,
        reference,
        quantity: existingItem.quantity + quantity,
        lowStockThreshold,
        unitCostCents,
        unitPriceCents,
        supplier,
        location,
        notes,
      },
    });

    return NextResponse.json({ item, merged: true });
  }

  const item = await prisma.inventoryItem.create({
    data: {
      proAccountId: admin.user.proAccountId ?? undefined,
      name,
      category,
      reference,
      quantity,
      lowStockThreshold,
      unitCostCents,
      unitPriceCents,
      supplier,
      location,
      notes,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
