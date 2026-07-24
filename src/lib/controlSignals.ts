import { prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret } from "@/lib/secretEncryption";
import type {
  ControlSignalKind,
  ControlSignalSender,
} from "@/lib/controlSignalValidation";
export { validateControlSignal } from "@/lib/controlSignalValidation";

const SIGNAL_TTL_MS = 35 * 60 * 1000;

export async function findActiveControlRequest(proAccountId: string) {
  return prisma.controlRequest.findFirst({
    where: {
      proAccountId,
      status: "ACCEPTED",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function saveControlSignal(input: {
  controlRequestId: string;
  sender: ControlSignalSender;
  kind: ControlSignalKind;
  payload: string;
}) {
  if (input.kind === "OFFER" || input.kind === "END") {
    await prisma.controlSignal.deleteMany({
      where: { controlRequestId: input.controlRequestId },
    });
  }

  const encryptedPayload = encryptSecret(input.payload);

  if (!encryptedPayload) {
    throw new Error("Control signal encryption failed.");
  }

  return prisma.controlSignal.create({
    data: {
      controlRequestId: input.controlRequestId,
      sender: input.sender,
      kind: input.kind,
      payload: encryptedPayload,
      expiresAt: new Date(Date.now() + SIGNAL_TTL_MS),
    },
    select: { id: true, createdAt: true },
  });
}

export async function readControlSignals(input: {
  controlRequestId: string;
  sender: ControlSignalSender;
}) {
  const records = await prisma.controlSignal.findMany({
    where: {
      controlRequestId: input.controlRequestId,
      sender: input.sender,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: {
      id: true,
      kind: true,
      payload: true,
      createdAt: true,
    },
  });

  return records.flatMap((record) => {
    const payload = decryptSecret(record.payload);

    if (!payload) {
      return [];
    }

    return [
      {
        id: record.id,
        kind: record.kind,
        payload,
        createdAt: record.createdAt,
      },
    ];
  });
}
