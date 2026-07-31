"use client";

import {
  buildAccountingSummary,
  defaultAccountingSettings,
  periodRange,
  type AccountingSettingsLike,
} from "@/lib/accounting";
import type { StoredLocalBackup } from "@/lib/localBackup";

type DatedRecord = Record<string, unknown>;

function dateValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const seconds = Number(record.seconds ?? record._seconds);
    if (Number.isFinite(seconds)) return new Date(seconds * 1000);
  }
  return null;
}

function recordsInPeriod(records: unknown[], field: string, start: Date, end: Date) {
  return (records as DatedRecord[]).filter((record) => {
    const date = dateValue(record[field]);
    return date ? date >= start && date < end : false;
  });
}

export function buildLocalAccountingView(
  backup: StoredLocalBackup,
  year: number,
  month: number,
) {
  const period = periodRange(year, month);
  const settings = {
    ...defaultAccountingSettings,
    ...((backup.payload.data.accountingSettings ?? {}) as Partial<AccountingSettingsLike>),
  };
  const repairs = recordsInPeriod(
    backup.payload.data.repairs,
    "createdAt",
    period.start,
    period.end,
  );
  const sales = recordsInPeriod(
    backup.payload.data.accountingSales,
    "soldAt",
    period.start,
    period.end,
  );
  const expenses = recordsInPeriod(
    backup.payload.data.accountingExpenses,
    "spentAt",
    period.start,
    period.end,
  );
  const payrollEntries = recordsInPeriod(
    backup.payload.data.accountingPayrollEntries,
    "periodStart",
    period.start,
    period.end,
  );

  return {
    period: { year: period.year, month: period.month },
    settings,
    repairs,
    sales,
    expenses,
    employees: backup.payload.data.accountingEmployees,
    payrollEntries,
    summary: buildAccountingSummary({
      settings,
      repairs: repairs as unknown as Parameters<typeof buildAccountingSummary>[0]["repairs"],
      sales: sales as unknown as Parameters<typeof buildAccountingSummary>[0]["sales"],
      expenses: expenses as unknown as Parameters<typeof buildAccountingSummary>[0]["expenses"],
      payrollEntries: payrollEntries as unknown as Parameters<typeof buildAccountingSummary>[0]["payrollEntries"],
    }),
  };
}
