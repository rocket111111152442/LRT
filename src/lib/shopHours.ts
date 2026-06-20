export const SHOP_DAYS = [
  { key: "monday", label: "Lundi", shortLabel: "Lun" },
  { key: "tuesday", label: "Mardi", shortLabel: "Mar" },
  { key: "wednesday", label: "Mercredi", shortLabel: "Mer" },
  { key: "thursday", label: "Jeudi", shortLabel: "Jeu" },
  { key: "friday", label: "Vendredi", shortLabel: "Ven" },
  { key: "saturday", label: "Samedi", shortLabel: "Sam" },
  { key: "sunday", label: "Dimanche", shortLabel: "Dim" },
] as const;

export type ShopDayKey = (typeof SHOP_DAYS)[number]["key"];

export type ShopDayHours = {
  open: boolean;
  opensAt: string;
  closesAt: string;
};

export type ShopOpeningHours = Record<ShopDayKey, ShopDayHours>;

export const defaultShopOpeningHours: ShopOpeningHours = {
  monday: { open: true, opensAt: "09:00", closesAt: "18:00" },
  tuesday: { open: true, opensAt: "09:00", closesAt: "18:00" },
  wednesday: { open: true, opensAt: "09:00", closesAt: "18:00" },
  thursday: { open: true, opensAt: "09:00", closesAt: "18:00" },
  friday: { open: true, opensAt: "09:00", closesAt: "18:00" },
  saturday: { open: true, opensAt: "10:00", closesAt: "17:00" },
  sunday: { open: false, opensAt: "10:00", closesAt: "17:00" },
};

const jsDayToShopDay: ShopDayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function isValidTime(value: unknown) {
  return typeof value === "string" && /^\d{2}:\d{2}$/.test(value);
}

function cloneDefaultHours(): ShopOpeningHours {
  return JSON.parse(JSON.stringify(defaultShopOpeningHours)) as ShopOpeningHours;
}

export function stringifyShopOpeningHours(hours: ShopOpeningHours) {
  return JSON.stringify(hours);
}

export function parseShopOpeningHours(value: string | null | undefined) {
  const fallback = cloneDefaultHours();

  if (!value) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value) as Partial<Record<ShopDayKey, Partial<ShopDayHours>>>;

    for (const day of SHOP_DAYS) {
      const dayHours = parsed[day.key];

      if (!dayHours || typeof dayHours !== "object") {
        continue;
      }

      fallback[day.key] = {
        open: Boolean(dayHours.open),
        opensAt: isValidTime(dayHours.opensAt)
          ? String(dayHours.opensAt)
          : fallback[day.key].opensAt,
        closesAt: isValidTime(dayHours.closesAt)
          ? String(dayHours.closesAt)
          : fallback[day.key].closesAt,
      };
    }

    return fallback;
  } catch {
    return fallback;
  }
}

function minutesFromTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function currentMinutes(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

export function isShopOpenAt(value: string | null | undefined, date = new Date()) {
  const hours = parseShopOpeningHours(value);
  const day = jsDayToShopDay[date.getDay()];
  const today = hours[day];

  if (!today.open) {
    return false;
  }

  const openAt = minutesFromTime(today.opensAt);
  const closeAt = minutesFromTime(today.closesAt);
  const now = currentMinutes(date);

  if (openAt === closeAt) {
    return false;
  }

  if (closeAt > openAt) {
    return now >= openAt && now < closeAt;
  }

  return now >= openAt || now < closeAt;
}

export function formatOpeningHours(value: string | null | undefined) {
  const hours = parseShopOpeningHours(value);

  return SHOP_DAYS.map((day) => {
    const dayHours = hours[day.key];
    const valueLabel = dayHours.open
      ? `${dayHours.opensAt}-${dayHours.closesAt}`
      : "ferme";

    return `${day.shortLabel}. ${valueLabel}`;
  }).join(" | ");
}

export function todayOpeningLabel(value: string | null | undefined, date = new Date()) {
  const hours = parseShopOpeningHours(value);
  const day = jsDayToShopDay[date.getDay()];
  const dayLabel = SHOP_DAYS.find((item) => item.key === day)?.label ?? "Aujourd'hui";
  const today = hours[day];

  if (!today.open) {
    return `${dayLabel} : ferme`;
  }

  return `${dayLabel} : ${today.opensAt}-${today.closesAt}`;
}
