import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";

export async function generateTicketNumber() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const ticketNumber = `QOR-${String(randomInt(1, 1000000)).padStart(6, "0")}`;
    const existingRepair = await prisma.repair.findUnique({
      where: { ticketNumber },
      select: { id: true },
    });

    if (!existingRepair) {
      return ticketNumber;
    }
  }

  return `QOR-${Date.now().toString().slice(-6)}`;
}
