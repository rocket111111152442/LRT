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

export type ShopTimePeriod = {
  opensAt: string;
  closesAt: string;
};

export type ShopDayHours = {
  open: boolean;
  periods: ShopTimePeriod[];
};

export type ShopOpeningHours = Record<ShopDayKey, ShopDayHours>;

export const defaultShopOpeningHours: ShopOpeningHours = {
  monday: { open: true, periods: [{ opensAt: "09:00", closesAt: "18:00" }] },
  tuesday: { open: true, periods: [{ opensAt: "09:00", closesAt: "18:00" }] },
  wednesday: { open: true, periods: [{ opensAt: "09:00", closesAt: "18:00" }] },
  thursday: { open: true, periods: [{ opensAt: "09:00", closesAt: "18:00" }] },
  friday: { open: true, periods: [{ opensAt: "09:00", closesAt: "18:00" }] },
  saturday: { open: true, periods: [{ opensAt: "10:00", closesAt: "17:00" }] },
  sunday: { open: false, periods: [{ opensAt: "10:00", closesAt: "17:00" }] },
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
  return (
    typeof value === "string" &&
    /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)
  );
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
    const parsed = JSON.parse(value) as Partial<
      Record<
        ShopDayKey,
        Partial<ShopDayHours> & {
          opensAt?: unknown;
          closesAt?: unknown;
          periods?: unknown;
        }
      >
    >;

    for (const day of SHOP_DAYS) {
      const dayHours = parsed[day.key];

      if (!dayHours || typeof dayHours !== "object") {
        continue;
      }

      const parsedPeriods = Array.isArray(dayHours.periods)
        ? dayHours.periods
            .slice(0, 6)
            .flatMap((period) => {
              if (
                !period ||
                typeof period !== "object" ||
                !("opensAt" in period) ||
                !("closesAt" in period) ||
                !isValidTime(period.opensAt) ||
                !isValidTime(period.closesAt)
              ) {
                return [];
              }

              return [{
                opensAt: String(period.opensAt),
                closesAt: String(period.closesAt),
              }];
            })
        : [];

      // Compatibilité avec les horaires enregistrés avant l'ajout des pauses.
      const legacyPeriod =
        isValidTime(dayHours.opensAt) && isValidTime(dayHours.closesAt)
          ? [{
              opensAt: String(dayHours.opensAt),
              closesAt: String(dayHours.closesAt),
            }]
          : [];

      fallback[day.key] = {
        open: Boolean(dayHours.open),
        periods:
          parsedPeriods.length > 0
            ? parsedPeriods
            : legacyPeriod.length > 0
              ? legacyPeriod
              : fallback[day.key].periods,
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

function isMinuteInsidePeriod(now: number, period: ShopTimePeriod) {
  const openAt = minutesFromTime(period.opensAt);
  const closeAt = minutesFromTime(period.closesAt);

  if (openAt === closeAt) {
    return false;
  }

  if (closeAt > openAt) {
    return now >= openAt && now < closeAt;
  }

  return now >= openAt || now < closeAt;
}

export function isShopOpenAt(value: string | null | undefined, date = new Date()) {
  const hours = parseShopOpeningHours(value);
  const day = jsDayToShopDay[date.getDay()];
  const today = hours[day];

  if (!today.open) {
    return false;
  }

  const now = currentMinutes(date);
  return today.periods.some((period) => isMinuteInsidePeriod(now, period));
}

export function formatOpeningHours(value: string | null | undefined) {
  const hours = parseShopOpeningHours(value);

  return SHOP_DAYS.map((day) => {
    const dayHours = hours[day.key];
    const valueLabel = dayHours.open
      ? dayHours.periods
          .map((period) => `${period.opensAt}-${period.closesAt}`)
          .join(" / ")
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

  return `${dayLabel} : ${today.periods
    .map((period) => `${period.opensAt}-${period.closesAt}`)
    .join(" / ")}`;
}
