import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

  const messages = await prisma.supportMessage.findMany({
    where: {
      ...(admin.user.proAccountId ? { proAccountId: admin.user.proAccountId } : {}),
      status: "OPEN",
    },
    select: { id: true },
  });

  return NextResponse.json({ count: messages.length });
}
