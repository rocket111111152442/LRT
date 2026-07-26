import { prisma } from "@/lib/prisma";

type StorageCategory =
  | "photos"
  | "signatures"
  | "repairs"
  | "history"
  | "inventory"
  | "accounting"
  | "appointments"
  | "support"
  | "account";

export type StorageBreakdownItem = {
  id: StorageCategory;
  label: string;
  bytes: number;
  itemCount: number;
};

export type AccountUsage = {
  storageUsedBytes: number;
  storageBreakdown: StorageBreakdownItem[];
  repairsThisMonth: number;
  repairsTotal: number;
  photosTotal: number;
  calculatedAt: string;
  isEstimate: true;
};

const CATEGORY_LABELS: Record<StorageCategory, string> = {
  photos: "Photos des appareils",
  signatures: "Signatures clients",
  repairs: "Fiches de réparation",
  history: "Historique des réparations",
  inventory: "Stock et pièces",
  accounting: "Comptabilité",
  appointments: "Rendez-vous",
  support: "Messages de support",
  account: "Compte et configuration",
};

function byteLength(value: string) {
  return Buffer.byteLength(value, "utf8");
}

function serializedBytes(value: unknown): number {
  try {
    const serialized = JSON.stringify(value, (_key, nestedValue) =>
      typeof nestedValue === "bigint" ? nestedValue.toString() : nestedValue,
    );
    return serialized ? byteLength(serialized) : 0;
  } catch {
    return 0;
  }
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

function arrayFrom(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function mediaBytes(value: unknown) {
  return arrayFrom(value).reduce<number>(
    (total, item) => total + (typeof item === "string" ? byteLength(item) : 0),
    0,
  );
}

function repairStorage(repairs: unknown[]) {
  let photosBytes = 0;
  let signaturesBytes = 0;
  let repairsBytes = 0;
  let photosTotal = 0;

  for (const value of repairs) {
    const repair =
      typeof value === "object" && value !== null
        ? (value as Record<string, unknown>)
        : {};
    const photos = arrayFrom(repair.photos);
    photosBytes += mediaBytes(photos);
    photosTotal += photos.filter((photo) => typeof photo === "string").length;

    if (typeof repair.customerDropOffSignature === "string") {
      signaturesBytes += byteLength(repair.customerDropOffSignature);
    }
    if (typeof repair.customerPickupSignature === "string") {
      signaturesBytes += byteLength(repair.customerPickupSignature);
    }

    const repairWithoutMedia = Object.fromEntries(
      Object.entries(repair).filter(
        ([key]) =>
          key !== "photos" &&
          key !== "customerDropOffSignature" &&
          key !== "customerPickupSignature",
      ),
    );
    repairsBytes += serializedBytes(repairWithoutMedia);
  }

  return {
    photosBytes,
    signaturesBytes,
    repairsBytes,
    photosTotal,
  };
}

function breakdownItem(
  id: StorageCategory,
  bytes: number,
  itemCount: number,
): StorageBreakdownItem {
  return {
    id,
    label: CATEGORY_LABELS[id],
    bytes: Math.max(0, bytes),
    itemCount: Math.max(0, itemCount),
  };
}

/**
 * Calcule l'empreinte logique des données appartenant à un atelier.
 *
 * Firebase ne fournit pas de métrique de facturation par atelier. Cette mesure
 * additionne donc les octets UTF-8 réellement enregistrés par Qoravo (photos
 * base64 comprises). Les index, sauvegardes et métadonnées internes du
 * fournisseur peuvent rendre la facture Firebase légèrement différente.
 */
export async function computeAccountUsage(
  proAccountId: string | null,
): Promise<AccountUsage> {
  const scopedWhere: { proAccountId?: string } = proAccountId
    ? { proAccountId }
    : {};

  const [
    accounts,
    users,
    repairs,
    events,
    inventoryItems,
    appointments,
    supportMessages,
    accountingSettings,
    accountingSales,
    accountingExpenses,
    accountingEmployees,
    accountingPayrollEntries,
  ] = await Promise.all([
    proAccountId
      ? prisma.proAccount
          .findUnique({ where: { id: proAccountId } })
          .then((account) => (account ? [account] : []))
      : prisma.proAccount.findMany(),
    prisma.user.findMany({ where: scopedWhere }),
    prisma.repair.findMany({ where: scopedWhere }),
    prisma.repairEvent.findMany({ where: scopedWhere }),
    prisma.inventoryItem.findMany({ where: scopedWhere }),
    prisma.setupAppointment.findMany({ where: scopedWhere }),
    prisma.supportMessage.findMany({ where: scopedWhere }),
    prisma.accountingSettings.findMany({ where: scopedWhere }),
    prisma.accountingSale.findMany({ where: scopedWhere }),
    prisma.accountingExpense.findMany({ where: scopedWhere }),
    prisma.accountingEmployee.findMany({ where: scopedWhere }),
    prisma.accountingPayrollEntry.findMany({ where: scopedWhere }),
  ]);

  const now = new Date();
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const media = repairStorage(repairs);
  const repairsThisMonth = repairs.reduce((count, repair) => {
    const createdAt = toDate(repair.createdAt);
    return createdAt && createdAt >= startOfMonth ? count + 1 : count;
  }, 0);
  const accountingRecords = [
    ...accountingSettings,
    ...accountingSales,
    ...accountingExpenses,
    ...accountingEmployees,
    ...accountingPayrollEntries,
  ];
  const accountRecords = [...accounts, ...users];
  const storageBreakdown = [
    breakdownItem("photos", media.photosBytes, media.photosTotal),
    breakdownItem(
      "signatures",
      media.signaturesBytes,
      repairs.filter(
        (repair) =>
          Boolean(repair.customerDropOffSignature) ||
          Boolean(repair.customerPickupSignature),
      ).length,
    ),
    breakdownItem("repairs", media.repairsBytes, repairs.length),
    breakdownItem("history", serializedBytes(events), events.length),
    breakdownItem(
      "inventory",
      serializedBytes(inventoryItems),
      inventoryItems.length,
    ),
    breakdownItem(
      "accounting",
      serializedBytes(accountingRecords),
      accountingRecords.length,
    ),
    breakdownItem(
      "appointments",
      serializedBytes(appointments),
      appointments.length,
    ),
    breakdownItem(
      "support",
      serializedBytes(supportMessages),
      supportMessages.length,
    ),
    breakdownItem(
      "account",
      serializedBytes(accountRecords),
      accountRecords.length,
    ),
  ];

  return {
    storageUsedBytes: storageBreakdown.reduce(
      (total, category) => total + category.bytes,
      0,
    ),
    storageBreakdown,
    repairsThisMonth,
    repairsTotal: repairs.length,
    photosTotal: media.photosTotal,
    calculatedAt: now.toISOString(),
    isEstimate: true,
  };
}
