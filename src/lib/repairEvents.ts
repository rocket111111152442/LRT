import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../generated/prisma/client";

export async function addRepairEvent(input: {
  repairId: string;
  proAccountId?: string | null;
  type: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.repairEvent.create({
      data: {
        repairId: input.repairId,
        proAccountId: input.proAccountId ?? null,
        type: input.type,
        message: input.message,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    console.error("Repair event creation failed", error);
  }
}
