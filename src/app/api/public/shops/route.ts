import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const activeStatuses = [
  "PAS_ENCORE_EN_REPARATION",
  "EN_REPARATION",
  "EN_ATTENTE_PIECE",
  "PRET",
];

function readNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export async function GET() {
  const accounts = await prisma.proAccount.findMany({
    where: { paymentStatus: "PAID" },
    orderBy: { companyName: "asc" },
    select: {
      id: true,
      companyName: true,
      slug: true,
      ownerEmail: true,
      publicDescription: true,
      shopAddress: true,
      shopPostalCode: true,
      shopCity: true,
      shopCountry: true,
      shopPhone: true,
      shopEmail: true,
      shopOpeningHours: true,
      shopLatitude: true,
      shopLongitude: true,
      shopCapacityPerDay: true,
    },
  });

  const shops = await Promise.all(
    accounts.map(async (account) => {
      const activeRepairs = await prisma.repair.findMany({
        where: { proAccountId: account.id },
        select: { status: true },
      });
      const activeCount = activeRepairs.filter((repair) =>
        activeStatuses.includes(String(repair.status)),
      ).length;
      const capacity = Math.max(readNumber(account.shopCapacityPerDay, 8), 1);

      return {
        companyName: account.companyName,
        slug: account.slug,
        description: account.publicDescription,
        address: account.shopAddress,
        postalCode: account.shopPostalCode,
        city: account.shopCity,
        country: account.shopCountry,
        phone: account.shopPhone,
        email: account.shopEmail ?? account.ownerEmail,
        openingHours: account.shopOpeningHours,
        latitude: account.shopLatitude,
        longitude: account.shopLongitude,
        capacityPerDay: capacity,
        activeRepairs: activeCount,
        hasAvailability: activeCount < capacity,
      };
    }),
  );

  return NextResponse.json({ shops });
}
