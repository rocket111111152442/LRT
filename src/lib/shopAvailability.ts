import {
  isShopOpenAt,
  parseShopOpeningHours,
  SHOP_DAYS,
  type ShopOpeningHours,
} from "@/lib/shopHours";

type AvailabilityInput = {
  openingHours: string | null | undefined;
  scheduledDates: Array<Date | string | null | undefined>;
  now?: Date;
  days?: number;
  limit?: number;
  slotDurationMinutes?: number | null;
  maxAppointmentsPerSlot?: number | null;
};

const dayKeyByJsDay = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

function minutesFromTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addMinutes(value: Date, minutes: number) {
  const next = new Date(value);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}

function normalizePositiveInteger(value: number | null | undefined, fallback: number) {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : fallback;
}

function parseDate(value: Date | string | null | undefined) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string" && value.trim()) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function slotKey(value: Date, slotDurationMinutes = 60) {
  const slot = normalizePositiveInteger(slotDurationMinutes, 60);
  const date = new Date(value);
  date.setSeconds(0, 0);
  const minutes = date.getHours() * 60 + date.getMinutes();
  const rounded = Math.floor(minutes / slot) * slot;
  date.setHours(Math.floor(rounded / 60), rounded % 60, 0, 0);

  return date.toISOString();
}

function scheduledCountBySlot(
  scheduledDates: Array<Date | string | null | undefined>,
  slotDurationMinutes: number,
) {
  const counts = new Map<string, number>();

  for (const rawDate of scheduledDates) {
    const date = parseDate(rawDate);

    if (!date) {
      continue;
    }

    const key = slotKey(date, slotDurationMinutes);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

function buildDaySlots(
  hours: ShopOpeningHours,
  dayStart: Date,
  slotDurationMinutes: number,
) {
  const dayKey = dayKeyByJsDay[dayStart.getDay()];
  const dayHours = hours[dayKey];

  if (!dayHours.open) {
    return [];
  }

  const slots: Date[] = [];

  for (const period of dayHours.periods) {
    const opensAt = minutesFromTime(period.opensAt);
    const closesAt = minutesFromTime(period.closesAt);

    if (opensAt === closesAt) {
      continue;
    }

    const endMinutes = closesAt > opensAt ? closesAt : closesAt + 24 * 60;

    for (
      let minutes = opensAt;
      minutes + slotDurationMinutes <= endMinutes;
      minutes += slotDurationMinutes
    ) {
      const slot = new Date(dayStart);
      slot.setMinutes(minutes);
      slots.push(slot);
    }
  }

  return slots.sort((a, b) => a.getTime() - b.getTime());
}

export function getAvailableSlots(input: AvailabilityInput) {
  const now = input.now ?? new Date();
  const days = normalizePositiveInteger(input.days, 7);
  const limit = normalizePositiveInteger(input.limit, 8);
  const slotDurationMinutes = normalizePositiveInteger(
    input.slotDurationMinutes,
    60,
  );
  const maxAppointmentsPerSlot = normalizePositiveInteger(
    input.maxAppointmentsPerSlot,
    1,
  );
  const hours = parseShopOpeningHours(input.openingHours);
  const scheduledCounts = scheduledCountBySlot(
    input.scheduledDates,
    slotDurationMinutes,
  );
  const minStart = addMinutes(now, 15);
  const slots: Date[] = [];

  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    const day = startOfDay(now);
    day.setDate(day.getDate() + dayOffset);

    for (const slot of buildDaySlots(hours, day, slotDurationMinutes)) {
      if (slot < minStart) {
        continue;
      }

      if ((scheduledCounts.get(slotKey(slot, slotDurationMinutes)) ?? 0) >= maxAppointmentsPerSlot) {
        continue;
      }

      slots.push(slot);

      if (slots.length >= limit) {
        return slots;
      }
    }
  }

  return slots;
}

export function hasSlotAt(
  input: Omit<AvailabilityInput, "days" | "limit"> & { requestedAt: Date },
) {
  if (!isShopOpenAt(input.openingHours, input.requestedAt)) {
    return false;
  }

  const slotDurationMinutes = normalizePositiveInteger(
    input.slotDurationMinutes,
    60,
  );
  const maxAppointmentsPerSlot = normalizePositiveInteger(
    input.maxAppointmentsPerSlot,
    1,
  );
  const scheduledCounts = scheduledCountBySlot(
    input.scheduledDates,
    slotDurationMinutes,
  );
  const requestedSlot = slotKey(input.requestedAt, slotDurationMinutes);

  return (scheduledCounts.get(requestedSlot) ?? 0) < maxAppointmentsPerSlot;
}

export function shopDayLabel(date: Date) {
  const dayKey = dayKeyByJsDay[date.getDay()];
  return SHOP_DAYS.find((day) => day.key === dayKey)?.label ?? "";
}
