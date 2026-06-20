import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/shopAvailability";
import { isShopOpenAt } from "@/lib/shopHours";

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
      shopSlotDurationMinutes: true,
      shopMaxAppointmentsPerSlot: true,
    },
  });

  const shops = await Promise.all(
    accounts.map(async (account) => {
      const activeRepairs = await prisma.repair.findMany({
        where: {
          proAccountId: account.id,
          archivedAt: null,
          status: { notIn: ["RECUPERE", "ANNULE"] },
        },
        select: { status: true, expectedPickupAt: true },
      });
      const capacity = Math.max(readNumber(account.shopCapacityPerDay, 8), 1);
      const slotDurationMinutes = Math.max(
        readNumber(account.shopSlotDurationMinutes, 60),
        15,
      );
      const maxAppointmentsPerSlot = Math.max(
        readNumber(account.shopMaxAppointmentsPerSlot, 1),
        1,
      );
      const availableSlots = getAvailableSlots({
        openingHours: account.shopOpeningHours,
        scheduledDates: activeRepairs.map((repair) => repair.expectedPickupAt),
        slotDurationMinutes,
        maxAppointmentsPerSlot,
        limit: 8,
        days: 14,
      });
      const isOpenNow = isShopOpenAt(account.shopOpeningHours);

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
        activeRepairs: activeRepairs.length,
        isOpenNow,
        slotDurationMinutes,
        maxAppointmentsPerSlot,
        availableSlots: availableSlots.map((slot) => slot.toISOString()),
        hasAvailability: isOpenNow && availableSlots.length > 0,
      };
    }),
  );

  return NextResponse.json({
    shops: shops.sort((left, right) => {
      if (left.hasAvailability !== right.hasAvailability) {
        return left.hasAvailability ? -1 : 1;
      }

      if (left.isOpenNow !== right.isOpenNow) {
        return left.isOpenNow ? -1 : 1;
      }

      return left.companyName.localeCompare(right.companyName);
    }),
  });
}
