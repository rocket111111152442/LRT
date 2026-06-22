import { NextResponse } from "next/server";
import { requireModApi } from "@/lib/modAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireModApi();
  if (!auth.ok) return auth.response as unknown as ReturnType<typeof NextResponse.json>;

  const [messages, accounts, repairs] = await Promise.all([
    prisma.supportMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.proAccount.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, companyName: true, slug: true, ownerEmail: true,
        paymentStatus: true, trialEndsAt: true, supportIncluded: true,
        plan: true, storageAddonGb: true, createdAt: true,
      },
    }),
    prisma.repair.findMany({
      select: { id: true, proAccountId: true },
    }),
  ]);

  // Calcul du nombre de réparations par compte côté serveur (compatible Firebase)
  const repairCountByAccount = repairs.reduce<Record<string, number>>((acc, r) => {
    const key = r.proAccountId ?? "__none__";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const accountsWithCount = accounts.map((a) => ({
    ...a,
    _count: { repairs: repairCountByAccount[a.id] ?? 0 },
  }));

  return NextResponse.json({
    messages,
    accounts: accountsWithCount,
    totalRepairs: repairs.length,
  });
}
