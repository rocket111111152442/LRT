export type AccountingSettingsLike = {
  country: string;
  currency: string;
  vatEnabled: boolean;
  defaultVatRateBps: number;
  incomeTaxRateBps: number;
  socialContributionRateBps: number;
  employerContributionRateBps: number;
  fiscalYearStartMonth: number;
  notes: string | null;
};

export type AccountingSaleLike = {
  quantity: number;
  unitPriceCents: number;
  unitCostCents: number;
  vatRateBps: number;
};

export type AccountingExpenseLike = {
  amountCents: number;
  deductibleVatCents: number;
};

export type AccountingPayrollLike = {
  grossSalaryCents: number;
  employerContributionsCents: number;
  netPaidCents: number;
};

export type AccountingRepairLike = {
  paidAmountCents: number;
  depositCents: number;
  estimatedPriceCents: number | null;
  partsCostCents: number | null;
};

export const defaultAccountingSettings: AccountingSettingsLike = {
  country: "FR",
  currency: "EUR",
  vatEnabled: true,
  defaultVatRateBps: 2000,
  incomeTaxRateBps: 1500,
  socialContributionRateBps: 2200,
  employerContributionRateBps: 4200,
  fiscalYearStartMonth: 1,
  notes: null,
};

export function clampBps(value: number, fallback: number) {
  return Number.isFinite(value) && value >= 0 && value <= 10000
    ? Math.round(value)
    : fallback;
}

export function centsFromDecimal(value: unknown, fallback = 0) {
  const number = Number(value ?? fallback);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.round(number * 100);
}

export function centsToDecimal(cents: number) {
  return (cents / 100).toFixed(2);
}

export function bpsToPercent(bps: number) {
  return (bps / 100).toFixed(2);
}

export function percentToBps(value: unknown, fallback: number) {
  const number = Number(value ?? fallback / 100);

  if (!Number.isFinite(number) || number < 0 || number > 100) {
    return fallback;
  }

  return Math.round(number * 100);
}

export function periodRange(year: number, month: number) {
  const safeYear = Number.isInteger(year) ? year : new Date().getFullYear();
  const safeMonth = Number.isInteger(month) && month >= 1 && month <= 12
    ? month
    : new Date().getMonth() + 1;
  const start = new Date(Date.UTC(safeYear, safeMonth - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(safeYear, safeMonth, 1, 0, 0, 0));

  return { start, end, year: safeYear, month: safeMonth };
}

function vatFromGrossAmount(grossCents: number, vatRateBps: number) {
  if (vatRateBps <= 0 || grossCents <= 0) {
    return 0;
  }

  return Math.round((grossCents * vatRateBps) / (10000 + vatRateBps));
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function buildAccountingSummary({
  settings,
  repairs,
  sales,
  expenses,
  payrollEntries,
}: {
  settings: AccountingSettingsLike;
  repairs: AccountingRepairLike[];
  sales: AccountingSaleLike[];
  expenses: AccountingExpenseLike[];
  payrollEntries: AccountingPayrollLike[];
}) {
  const repairRevenueCents = sum(
    repairs.map((repair) => Math.max(repair.paidAmountCents, repair.depositCents, 0)),
  );
  const estimatedRepairRevenueCents = sum(
    repairs.map((repair) => Math.max(repair.estimatedPriceCents ?? 0, 0)),
  );
  const repairPartsCostCents = sum(
    repairs.map((repair) => Math.max(repair.partsCostCents ?? 0, 0)),
  );

  const retailRevenueCents = sum(
    sales.map((sale) => sale.quantity * sale.unitPriceCents),
  );
  const retailCostCents = sum(sales.map((sale) => sale.quantity * sale.unitCostCents));
  const expenseCents = sum(expenses.map((expense) => expense.amountCents));
  const deductibleVatCents = settings.vatEnabled
    ? sum(expenses.map((expense) => expense.deductibleVatCents))
    : 0;
  const payrollGrossCents = sum(
    payrollEntries.map((entry) => entry.grossSalaryCents),
  );
  const payrollEmployerContributionsCents = sum(
    payrollEntries.map((entry) => entry.employerContributionsCents),
  );
  const payrollNetPaidCents = sum(payrollEntries.map((entry) => entry.netPaidCents));
  const payrollTotalCostCents =
    payrollGrossCents + payrollEmployerContributionsCents;

  const totalRevenueCents = repairRevenueCents + retailRevenueCents;
  const totalDirectCostsCents = repairPartsCostCents + retailCostCents;
  const totalOperatingCostsCents = expenseCents + payrollTotalCostCents;
  const profitBeforeTaxesCents =
    totalRevenueCents - totalDirectCostsCents - totalOperatingCostsCents;

  const salesVatCollectedCents = settings.vatEnabled
    ? sum(
        sales.map((sale) =>
          vatFromGrossAmount(sale.quantity * sale.unitPriceCents, sale.vatRateBps),
        ),
      )
    : 0;
  const repairVatCollectedCents = settings.vatEnabled
    ? vatFromGrossAmount(repairRevenueCents, settings.defaultVatRateBps)
    : 0;
  const vatCollectedCents = salesVatCollectedCents + repairVatCollectedCents;
  const estimatedVatDueCents = Math.max(vatCollectedCents - deductibleVatCents, 0);
  const taxableProfitCents = Math.max(profitBeforeTaxesCents, 0);
  const estimatedIncomeTaxCents = Math.round(
    (taxableProfitCents * settings.incomeTaxRateBps) / 10000,
  );
  const estimatedSocialContributionsCents = Math.round(
    (taxableProfitCents * settings.socialContributionRateBps) / 10000,
  );
  const estimatedTaxesAndContributionsCents =
    estimatedVatDueCents +
    estimatedIncomeTaxCents +
    estimatedSocialContributionsCents;
  const estimatedCashAfterTaxesCents =
    profitBeforeTaxesCents -
    estimatedIncomeTaxCents -
    estimatedSocialContributionsCents -
    estimatedVatDueCents;

  return {
    repairRevenueCents,
    estimatedRepairRevenueCents,
    retailRevenueCents,
    totalRevenueCents,
    repairPartsCostCents,
    retailCostCents,
    totalDirectCostsCents,
    expenseCents,
    payrollGrossCents,
    payrollEmployerContributionsCents,
    payrollNetPaidCents,
    payrollTotalCostCents,
    totalOperatingCostsCents,
    profitBeforeTaxesCents,
    vatCollectedCents,
    deductibleVatCents,
    estimatedVatDueCents,
    estimatedIncomeTaxCents,
    estimatedSocialContributionsCents,
    estimatedTaxesAndContributionsCents,
    estimatedCashAfterTaxesCents,
  };
}
