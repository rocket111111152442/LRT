"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type EventFormState = { error?: string };

const EVENT_TYPES = ["COURS", "DEVOIR", "CONTROLE", "AUTRE"] as const;
type EventType = (typeof EVENT_TYPES)[number];

function isValidType(value: string): value is EventType {
  return (EVENT_TYPES as readonly string[]).includes(value);
}

export async function createEventAction(
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const user = await requireCurrentUser();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dateRaw = String(formData.get("date") ?? "");
  const type = String(formData.get("type") ?? "AUTRE");
  const subjectId = String(formData.get("subjectId") ?? "");

  if (!title) return { error: "Le titre est requis." };
  if (!isValidType(type)) return { error: "Type invalide." };

  const date = new Date(dateRaw);
  if (Number.isNaN(date.getTime())) return { error: "Date invalide." };

  if (subjectId) {
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject || subject.userId !== user.id) {
      return { error: "Matière invalide." };
    }
  }

  await prisma.event.create({
    data: {
      userId: user.id,
      title,
      description: description || null,
      date,
      type,
      subjectId: subjectId || null,
    },
  });

  revalidatePath("/profil/agenda");
  revalidatePath("/profil");
  return {};
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  const user = await requireCurrentUser();
  const eventId = String(formData.get("eventId") ?? "");

  const existing = await prisma.event.findUnique({ where: { id: eventId } });
  if (existing && existing.userId === user.id) {
    await prisma.event.delete({ where: { id: eventId } });
  }

  revalidatePath("/profil/agenda");
  revalidatePath("/profil");
}
