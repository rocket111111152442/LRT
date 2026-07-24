import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { normalizeInventoryCategory } from "@/lib/inventory";
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

function readOptionalText(body: Record<string, unknown>, key: string) {
  return readText(body, key) || null;
}

function readInt(body: Record<string, unknown>, key: string, fallback: number) {
  const value = Number(body[key] ?? fallback);
  return Number.isInteger(value) && value >= 0 && value <= 2_000_000_000
    ? value
    : null;
}

function readCents(body: Record<string, unknown>, key: string, fallback = 0) {
  const value = Number(body[key] ?? fallback);
  return Number.isFinite(value) && value >= 0 && value <= 2_000_000_000
    ? Math.round(value)
    : null;
}

function hasValidTextLengths(input: {
  name: string;
  reference: string | null;
  supplier: string | null;
  location: string | null;
  notes: string | null;
}) {
  return (
    input.name.length <= 160 &&
    (input.reference?.length ?? 0) <= 120 &&
    (input.supplier?.length ?? 0) <= 160 &&
    (input.location?.length ?? 0) <= 160 &&
    (input.notes?.length ?? 0) <= 5_000
  );
}

async function getAuthorizedItem(id: string, proAccountId: string) {
  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    select: {
      id: true,
      proAccountId: true,
    },
  });

  if (!item || item.proAccountId !== proAccountId) {
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
    || !hasValidTextLengths({ name, reference, supplier, location, notes })
  ) {
    return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
  }

  const updatedItem = await prisma.inventoryItem.update({
    where: { id },
    data: {
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
