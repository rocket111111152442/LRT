import { NextResponse } from "next/server";
import { requireModApi } from "@/lib/modAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireModApi();
  if (!auth.ok) return auth.response as unknown as ReturnType<typeof NextResponse.json>;

  const [messages, accounts, totalRepairs] = await Promise.all([
    prisma.supportMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.proAccount.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, companyName: true, slug: true, ownerEmail: true,
        paymentStatus: true, trialEndsAt: true, supportIncluded: true,
        plan: true, storageAddonGb: true, createdAt: true,
        _count: { select: { repairs: true } },
      },
    }),
    prisma.repair.count(),
  ]);

  return NextResponse.json({ messages, accounts, totalRepairs });
}
