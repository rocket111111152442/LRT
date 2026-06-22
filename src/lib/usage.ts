import { prisma } from "@/lib/prisma";

// Les photos sont stockées en base64 (data URL) dans le tableau `photos` de
// chaque réparation. On estime le stockage utilisé à partir de la taille de ces
// chaînes, et on compte les réparations créées sur le mois en cours.

function base64Bytes(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(",");
  const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
  const length = base64.length;

  if (length === 0) {
    return 0;
  }

  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((length * 3) / 4) - padding);
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export type AccountUsage = {
  storageUsedBytes: number;
  repairsThisMonth: number;
  repairsTotal: number;
};

export async function computeAccountUsage(
  proAccountId: string | null,
): Promise<AccountUsage> {
  const where: { proAccountId?: string } = proAccountId ? { proAccountId } : {};
  const repairs = await prisma.repair.findMany({
    where,
    select: { photos: true, createdAt: true },
  });

  const now = new Date();
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  let storageUsedBytes = 0;
  let repairsThisMonth = 0;

  for (const repair of repairs) {
    const photos = Array.isArray(repair.photos) ? repair.photos : [];

    for (const photo of photos) {
      if (typeof photo === "string") {
        storageUsedBytes += base64Bytes(photo);
      }
    }

    const createdAt = toDate(repair.createdAt);

    if (createdAt && createdAt >= startOfMonth) {
      repairsThisMonth += 1;
    }
  }

  return {
    storageUsedBytes,
    repairsThisMonth,
    repairsTotal: repairs.length,
  };
}
