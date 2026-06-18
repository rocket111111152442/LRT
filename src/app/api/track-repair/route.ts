import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticketNumber = searchParams.get("ticket")?.trim().toUpperCase();

  if (!ticketNumber) {
    return NextResponse.json({ error: "Ticket requis." }, { status: 400 });
  }

  const repair = await prisma.repair.findUnique({
    where: { ticketNumber },
    select: {
      ticketNumber: true,
      firstName: true,
      deviceType: true,
      brand: true,
      model: true,
      status: true,
      quoteStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!repair) {
    return NextResponse.json({ error: "Ticket introuvable." }, { status: 404 });
  }

  return NextResponse.json({ repair });
}
