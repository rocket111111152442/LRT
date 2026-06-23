import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Repair = {
  id: string;
  ticketNumber: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: string;
  paymentStatus: string;
  paidAmountCents: number;
  estimatedPriceCents: number | null;
  deviceType: string;
  brand: string;
  model: string;
  createdAt: unknown;
};

type ClientSummary = {
  key: string;
  name: string;
  phone: string;
  email: string;
  repairCount: number;
  totalSpentCents: number;
  lastRepairAt: string | null;
  repairs: {
    id: string;
    ticketNumber: string | null;
    device: string;
    status: string;
    paidAmountCents: number;
    createdAt: string | null;
  }[];
};

function toIso(value: unknown): string | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

function customerKey(repair: Repair): string {
  const email = repair.email?.trim().toLowerCase();
  if (email) return `e:${email}`;
  const phone = repair.phone?.replace(/\D/g, "");
  if (phone) return `p:${phone}`;
  return `n:${repair.firstName}-${repair.lastName}`.toLowerCase();
}

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const repairs = (await prisma.repair.findMany({
    where: {
      ...(admin.user.proAccountId ? { proAccountId: admin.user.proAccountId } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, ticketNumber: true, firstName: true, lastName: true,
      phone: true, email: true, status: true, paymentStatus: true,
      paidAmountCents: true, estimatedPriceCents: true,
      deviceType: true, brand: true, model: true, createdAt: true,
    },
  })) as Repair[];

  const map = new Map<string, ClientSummary>();

  for (const repair of repairs) {
    const key = customerKey(repair);
    const createdAt = toIso(repair.createdAt);
    const existing = map.get(key);

    const entry: ClientSummary["repairs"][number] = {
      id: repair.id,
      ticketNumber: repair.ticketNumber,
      device: `${repair.deviceType} ${repair.brand} ${repair.model}`.trim(),
      status: repair.status,
      paidAmountCents: repair.paidAmountCents ?? 0,
      createdAt,
    };

    if (existing) {
      existing.repairCount += 1;
      existing.totalSpentCents += repair.paidAmountCents ?? 0;
      existing.repairs.push(entry);
      if (createdAt && (!existing.lastRepairAt || createdAt > existing.lastRepairAt)) {
        existing.lastRepairAt = createdAt;
      }
    } else {
      map.set(key, {
        key,
        name: `${repair.firstName} ${repair.lastName}`.trim(),
        phone: repair.phone,
        email: repair.email,
        repairCount: 1,
        totalSpentCents: repair.paidAmountCents ?? 0,
        lastRepairAt: createdAt,
        repairs: [entry],
      });
    }
  }

  const clients = Array.from(map.values()).sort(
    (a, b) => (b.lastRepairAt ?? "").localeCompare(a.lastRepairAt ?? ""),
  );

  return NextResponse.json({ clients, total: clients.length });
}
