import { sendReadyReminderEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { addRepairEvent } from "@/lib/repairEvents";

const READY_REMINDER_DELAY_MS = 7 * 24 * 60 * 60 * 1000;

export async function processReadyReminders(proAccountId?: string | null) {
  const repairs = await prisma.repair.findMany({
    where: {
      status: "PRET",
      ...(proAccountId ? { proAccountId } : {}),
    },
    select: {
      id: true,
      proAccountId: true,
      ticketNumber: true,
      firstName: true,
      email: true,
      deviceType: true,
      brand: true,
      model: true,
      readyReminderSentAt: true,
      updatedAt: true,
    },
  });

  const now = Date.now();
  let attempted = 0;
  let sent = 0;

  for (const repair of repairs) {
    if (repair.readyReminderSentAt) {
      continue;
    }

    if (now - repair.updatedAt.getTime() < READY_REMINDER_DELAY_MS) {
      continue;
    }

    attempted += 1;
    const result = await sendReadyReminderEmail(repair);

    if (result.sent) {
      sent += 1;
      await prisma.repair.update({
        where: { id: repair.id },
        data: { readyReminderSentAt: new Date() },
      });
      await addRepairEvent({
        repairId: repair.id,
        proAccountId: repair.proAccountId,
        type: "READY_REMINDER_SENT",
        message: "Relance appareil pret envoyee.",
      });
    }
  }

  return { attempted, sent };
}
