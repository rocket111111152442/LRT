import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addRepairEvent } from "@/lib/repairEvents";

export async function POST() {
  const admin = await requireAdminApi();

  if (!admin.ok) {
    return admin.response;
  }

  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - 30);

  const repairs = await prisma.repair.findMany({
    where: {
      proAccountId: admin.user.proAccountId,
      status: "RECUPERE",
      archivedAt: null,
      updatedAt: { lte: limitDate },
    },
    select: {
      id: true,
      proAccountId: true,
    },
  });

  if (repairs.length === 0) {
    return NextResponse.json({ archived: 0 });
  }

  await prisma.repair.updateMany({
    where: { id: { in: repairs.map((repair) => repair.id) } },
    data: { archivedAt: new Date() },
  });

  await Promise.all(
    repairs.map((repair) =>
      addRepairEvent({
        repairId: repair.id,
        proAccountId: repair.proAccountId,
        type: "SMART_ARCHIVED",
        message: "Archivage intelligent apres recuperation.",
      }),
    ),
  );

  return NextResponse.json({ archived: repairs.length });
}
