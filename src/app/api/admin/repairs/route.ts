import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { REPAIR_STATUSES, validateRepairInput } from "@/lib/repairValidation";
import type { RepairStatus as PrismaRepairStatus } from "../../../../../generated/prisma/client";

function isRepairStatus(value: string): value is PrismaRepairStatus {
  return REPAIR_STATUSES.includes(value as (typeof REPAIR_STATUSES)[number]);
}

export async function GET(request: Request) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status")?.trim();

  if (status && !isRepairStatus(status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const statusFilter: PrismaRepairStatus | undefined =
    status && isRepairStatus(status) ? status : undefined;

  const repairs = await prisma.repair.findMany({
    where: {
      ...(admin.user.proAccountId ? { proAccountId: admin.user.proAccountId } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { brand: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      deviceType: true,
      brand: true,
      model: true,
      status: true,
      readyEmailSent: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ repairs });
}

export async function POST(request: Request) {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: { firstName: "Le corps de la requete doit etre en JSON." } },
      { status: 400 },
    );
  }

  const validation = validateRepairInput(body);

  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  try {
    const repair = await prisma.repair.create({
      data: {
        ...validation.data,
        proAccountId: admin.user.proAccountId ?? undefined,
        status: "PAS_ENCORE_EN_REPARATION",
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ repair }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "La reparation n'a pas pu etre creee." },
      { status: 500 },
    );
  }
}
