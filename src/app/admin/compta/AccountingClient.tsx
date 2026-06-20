"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Download,
  FileText,
  Plus,
  ReceiptText,
  Trash2,
  Users,
} from "lucide-react";
import { bpsToPercent } from "@/lib/accounting";

type Settings = {
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

type Sale = {
  id: string;
  soldAt: string;
  customerName: string | null;
  label: string;
  category: string;
  quantity: number;
  unitPriceCents: number;
  unitCostCents: number;
  vatRateBps: number;
  paymentMethod: string | null;
  notes: string | null;
};

type Expense = {
  id: string;
  spentAt: string;
  label: string;
  category: string;
  amountCents: number;
  deductibleVatCents: number;
  supplier: string | null;
  notes: string | null;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  role: string | null;
  contractType: string | null;
  grossMonthlySalaryCents: number;
  employerContributionRateBps: number | null;
  active: boolean;
};

type PayrollEntry = {
  id: string;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  grossSalaryCents: number;
  employerContributionsCents: number;
  netPaidCents: number;
  notes: string | null;
};

type Payload = {
  period: {
    year: number;
    month: number;
  };
  settings: Settings;
  sales: Sale[];
  expenses: Expense[];
  employees: Employee[];
  payrollEntries: PayrollEntry[];
  summary: Record<string, number>;
};

const saleCategories = [
  "ACCESSOIRE",
  "TELEPHONE_RECONDITIONNE",
  "ORDINATEUR",
  "CONSOLE",
  "PIECE",
  "SERVICE_AUTRE",
  "AUTRE",
];

const expenseCategories = [
  "LOYER",
  "FOURNISSEUR",
  "PIECE",
  "OUTIL",
  "LOGICIEL",
  "ASSURANCE",
  "TRANSPORT",
  "MARKETING",
  "IMPOT_TAXE",
  "AUTRE",
];

const monthLabels = [
  "Janvier",
  "Fevrier",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Aout",
  "Septembre",
  "Octobre",
  "Novembre",
  "Decembre",
];

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function monthStartInput(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

function monthEndInput(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

function money(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function employeeName(employee: Employee | undefined, fallbackId: string) {
  if (!employee) {
    return fallbackId.slice(0, 8);
  }

  return `${employee.firstName} ${employee.lastName}`;
}

export function AccountingClient() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [settingsForm, setSettingsForm] = useState({
    country: "FR",
    currency: "EUR",
    vatEnabled: true,
    defaultVatRatePercent: "20.00",
    incomeTaxRatePercent: "15.00",
    socialContributionRatePercent: "22.00",
    employerContributionRatePercent: "42.00",
    fiscalYearStartMonth: "1",
    notes: "",
  });
  const [saleForm, setSaleForm] = useState({
    soldAt: todayInput(),
    label: "",
    category: "ACCESSOIRE",
    quantity: "1",
    unitPrice: "",
    unitCost: "",
    vatRatePercent: "20",
    customerName: "",
    paymentMethod: "Carte",
    notes: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    spentAt: todayInput(),
    label: "",
    category: "FOURNISSEUR",
    amount: "",
    deductibleVat: "",
    supplier: "",
    notes: "",
  });
  const [employeeForm, setEmployeeForm] = useState({
    firstName: "",
    lastName: "",
    role: "",
    contractType: "CDI",
    grossMonthlySalary: "",
    employerContributionRatePercent: "",
  });
  const [payrollForm, setPayrollForm] = useState({
    employeeId: "",
    periodStart: monthStartInput(year, month),
    periodEnd: monthEndInput(year, month),
    grossSalary: "",
    employerContributions: "",
    netPaid: "",
    notes: "",
  });

  const employeesById = useMemo(() => {
    return new Map((payload?.employees ?? []).map((employee) => [employee.id, employee]));
  }, [payload?.employees]);

  async function loadAccounting(selectedYear = year, selectedMonth = month) {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/accounting?year=${selectedYear}&month=${selectedMonth}`,
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Chargement impossible.");
        return;
      }

      setPayload(data);
      setSettingsForm({
        country: data.settings.country ?? "FR",
        currency: data.settings.currency ?? "EUR",
        vatEnabled: data.settings.vatEnabled !== false,
        defaultVatRatePercent: bpsToPercent(data.settings.defaultVatRateBps),
        incomeTaxRatePercent: bpsToPercent(data.settings.incomeTaxRateBps),
        socialContributionRatePercent: bpsToPercent(
          data.settings.socialContributionRateBps,
        ),
        employerContributionRatePercent: bpsToPercent(
          data.settings.employerContributionRateBps,
        ),
        fiscalYearStartMonth: String(data.settings.fiscalYearStartMonth ?? 1),
        notes: data.settings.notes ?? "",
      });
    } catch {
      setError("Chargement impossible.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAccounting(year, month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  async function submitAction(action: string, data: Record<string, unknown>) {
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/accounting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? "Enregistrement impossible.");
        return false;
      }

      setMessage("Compta mise a jour.");
      await loadAccounting(year, month);
      return true;
    } catch {
      setError("Enregistrement impossible.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteItem(kind: string, id: string) {
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/admin/accounting?kind=${kind}&id=${id}`, {
        method: "DELETE",
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? "Suppression impossible.");
        return;
      }

      setMessage("Ligne retiree.");
      await loadAccounting(year, month);
    } catch {
      setError("Suppression impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitAction("settings", settingsForm);
  }

  async function createSale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = await submitAction("sale", saleForm);

    if (ok) {
      setSaleForm((current) => ({
        ...current,
        label: "",
        quantity: "1",
        unitPrice: "",
        unitCost: "",
        customerName: "",
        notes: "",
      }));
    }
  }

  async function createExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = await submitAction("expense", expenseForm);

    if (ok) {
      setExpenseForm((current) => ({
        ...current,
        label: "",
        amount: "",
        deductibleVat: "",
        supplier: "",
        notes: "",
      }));
    }
  }

  async function createEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = await submitAction("employee", employeeForm);

    if (ok) {
      setEmployeeForm((current) => ({
        ...current,
        firstName: "",
        lastName: "",
        role: "",
        grossMonthlySalary: "",
      }));
    }
  }

  async function createPayroll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = await submitAction("payroll", payrollForm);

    if (ok) {
      setPayrollForm((current) => ({
        ...current,
        grossSalary: "",
        employerContributions: "",
        netPaid: "",
        notes: "",
      }));
    }
  }

  function changePeriod(nextYear: number, nextMonth: number) {
    setYear(nextYear);
    setMonth(nextMonth);
    setPayrollForm((current) => ({
      ...current,
      periodStart: monthStartInput(nextYear, nextMonth),
      periodEnd: monthEndInput(nextYear, nextMonth),
    }));
  }

  const currency = payload?.settings.currency ?? "EUR";
  const summary = payload?.summary ?? {};

  return (
    <section className="grid min-w-0 gap-6 overflow-x-hidden">
      <div className="grid gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <div className="flex items-start gap-3">
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="leading-6">
            Les montants d&apos;impots, TVA, cotisations et charges affiches ici
            sont des estimations de gestion basees sur les taux que vous
            renseignez. Ils ne remplacent pas un comptable, l&apos;URSSAF ou les
            declarations officielles de votre pays.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-2 sm:grid-cols-[180px_180px]">
          <label className="grid gap-1 text-sm font-semibold text-slate-800">
            Mois
            <select
              value={month}
              onChange={(event) => changePeriod(year, Number(event.target.value))}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {monthLabels.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-800">
            Annee
            <input
              type="number"
              value={year}
              onChange={(event) => changePeriod(Number(event.target.value), month)}
              className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <a
          href={`/api/admin/accounting/export?year=${year}&month=${month}`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          Export CSV comptable
        </a>
      </div>

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Banknote}
          label="CA encaisse"
          value={money(summary.totalRevenueCents ?? 0, currency)}
          tone="border-sky-100 bg-sky-50 text-sky-800"
        />
        <MetricCard
          icon={ReceiptText}
          label="Couts directs"
          value={money(summary.totalDirectCostsCents ?? 0, currency)}
          tone="border-amber-100 bg-amber-50 text-amber-800"
        />
        <MetricCard
          icon={FileText}
          label="Benefice avant taxes"
          value={money(summary.profitBeforeTaxesCents ?? 0, currency)}
          tone="border-emerald-100 bg-emerald-50 text-emerald-800"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Taxes estimees"
          value={money(summary.estimatedTaxesAndContributionsCents ?? 0, currency)}
          tone="border-violet-100 bg-violet-50 text-violet-800"
        />
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Chargement de la compta...
        </div>
      ) : null}

      {!isLoading && payload ? (
        <>
          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">
              Estimations automatiques du mois
            </h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <InfoLine label="Reparations encaissees" value={money(summary.repairRevenueCents ?? 0, currency)} />
              <InfoLine label="Ventes hors reparation" value={money(summary.retailRevenueCents ?? 0, currency)} />
              <InfoLine label="Depenses" value={money(summary.expenseCents ?? 0, currency)} />
              <InfoLine label="Paie brute" value={money(summary.payrollGrossCents ?? 0, currency)} />
              <InfoLine label="Charges employeur" value={money(summary.payrollEmployerContributionsCents ?? 0, currency)} />
              <InfoLine label="TVA collectee estimee" value={money(summary.vatCollectedCents ?? 0, currency)} />
              <InfoLine label="TVA deductible saisie" value={money(summary.deductibleVatCents ?? 0, currency)} />
              <InfoLine label="TVA a payer estimee" value={money(summary.estimatedVatDueCents ?? 0, currency)} />
              <InfoLine label="Impot benefice estime" value={money(summary.estimatedIncomeTaxCents ?? 0, currency)} />
              <InfoLine label="Cotisations independant estimees" value={money(summary.estimatedSocialContributionsCents ?? 0, currency)} />
              <InfoLine label="Tresorerie apres taxes estimee" value={money(summary.estimatedCashAfterTaxesCents ?? 0, currency)} />
            </div>
          </section>

          <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <form
              onSubmit={saveSettings}
              className="grid min-w-0 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-slate-950">
                Reglages fiscaux
              </h2>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                <TextInput label="Pays" value={settingsForm.country} onChange={(value) => setSettingsForm({ ...settingsForm, country: value })} />
                <TextInput label="Devise" value={settingsForm.currency} onChange={(value) => setSettingsForm({ ...settingsForm, currency: value.toUpperCase().slice(0, 3) })} />
                <NumberInput label="TVA reparations %" value={settingsForm.defaultVatRatePercent} onChange={(value) => setSettingsForm({ ...settingsForm, defaultVatRatePercent: value })} />
                <NumberInput label="Impot benefice %" value={settingsForm.incomeTaxRatePercent} onChange={(value) => setSettingsForm({ ...settingsForm, incomeTaxRatePercent: value })} />
                <NumberInput label="Cotisations independant %" value={settingsForm.socialContributionRatePercent} onChange={(value) => setSettingsForm({ ...settingsForm, socialContributionRatePercent: value })} />
                <NumberInput label="Charges employeur %" value={settingsForm.employerContributionRatePercent} onChange={(value) => setSettingsForm({ ...settingsForm, employerContributionRatePercent: value })} />
                <NumberInput label="Debut exercice fiscal" value={settingsForm.fiscalYearStartMonth} onChange={(value) => setSettingsForm({ ...settingsForm, fiscalYearStartMonth: value })} />
                <label className="flex items-center gap-3 pt-6 text-sm font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={settingsForm.vatEnabled}
                    onChange={(event) =>
                      setSettingsForm({ ...settingsForm, vatEnabled: event.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  TVA activee
                </label>
              </div>
              <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-800">
                Notes comptables
                <textarea
                  value={settingsForm.notes}
                  onChange={(event) =>
                    setSettingsForm({ ...settingsForm, notes: event.target.value })
                  }
                  rows={3}
                  className="w-full min-w-0 max-w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <button
                type="submit"
                disabled={isSaving}
                className="min-h-11 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:bg-slate-300"
              >
                Enregistrer les reglages
              </button>
            </form>

            <Panel title="Ventes hors reparation" subtitle="Accessoires, telephones, ordinateurs, consoles ou services vendus en boutique.">
              <form onSubmit={createSale} className="grid min-w-0 gap-3">
                <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <TextInput label="Produit vendu" value={saleForm.label} onChange={(value) => setSaleForm({ ...saleForm, label: value })} />
                  <SelectInput label="Categorie" value={saleForm.category} options={saleCategories} onChange={(value) => setSaleForm({ ...saleForm, category: value })} />
                  <NumberInput label="Quantite" value={saleForm.quantity} onChange={(value) => setSaleForm({ ...saleForm, quantity: value })} />
                  <NumberInput label="Prix vente TTC" value={saleForm.unitPrice} onChange={(value) => setSaleForm({ ...saleForm, unitPrice: value })} />
                  <NumberInput label="Cout achat unitaire" value={saleForm.unitCost} onChange={(value) => setSaleForm({ ...saleForm, unitCost: value })} />
                  <NumberInput label="TVA %" value={saleForm.vatRatePercent} onChange={(value) => setSaleForm({ ...saleForm, vatRatePercent: value })} />
                  <TextInput label="Client optionnel" value={saleForm.customerName} onChange={(value) => setSaleForm({ ...saleForm, customerName: value })} />
                  <TextInput label="Paiement" value={saleForm.paymentMethod} onChange={(value) => setSaleForm({ ...saleForm, paymentMethod: value })} />
                </div>
                <TextInput label="Notes" value={saleForm.notes} onChange={(value) => setSaleForm({ ...saleForm, notes: value })} />
                <button type="submit" disabled={isSaving} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:bg-slate-300">
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  Ajouter la vente
                </button>
              </form>
              <DataList
                empty="Aucune vente hors reparation sur ce mois."
                rows={payload.sales.map((sale) => ({
                  id: sale.id,
                  title: sale.label,
                  meta: `${sale.category} - ${sale.quantity} x ${money(sale.unitPriceCents, currency)}`,
                  amount: money(sale.quantity * sale.unitPriceCents, currency),
                  onDelete: () => deleteItem("sale", sale.id),
                }))}
              />
            </Panel>
          </section>

          <section className="grid min-w-0 gap-4 lg:grid-cols-2">
            <Panel title="Depenses et achats" subtitle="Loyer, fournisseur, outils, logiciels, assurances, marketing, taxes et autres frais.">
              <form onSubmit={createExpense} className="grid min-w-0 gap-3">
                <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                  <TextInput label="Libelle" value={expenseForm.label} onChange={(value) => setExpenseForm({ ...expenseForm, label: value })} />
                  <SelectInput label="Categorie" value={expenseForm.category} options={expenseCategories} onChange={(value) => setExpenseForm({ ...expenseForm, category: value })} />
                  <NumberInput label="Montant TTC" value={expenseForm.amount} onChange={(value) => setExpenseForm({ ...expenseForm, amount: value })} />
                  <NumberInput label="TVA deductible" value={expenseForm.deductibleVat} onChange={(value) => setExpenseForm({ ...expenseForm, deductibleVat: value })} />
                  <TextInput label="Fournisseur" value={expenseForm.supplier} onChange={(value) => setExpenseForm({ ...expenseForm, supplier: value })} />
                  <TextInput label="Date" type="date" value={expenseForm.spentAt} onChange={(value) => setExpenseForm({ ...expenseForm, spentAt: value })} />
                </div>
                <TextInput label="Notes" value={expenseForm.notes} onChange={(value) => setExpenseForm({ ...expenseForm, notes: value })} />
                <button type="submit" disabled={isSaving} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:bg-slate-300">
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  Ajouter la depense
                </button>
              </form>
              <DataList
                empty="Aucune depense sur ce mois."
                rows={payload.expenses.map((expense) => ({
                  id: expense.id,
                  title: expense.label,
                  meta: `${expense.category}${expense.supplier ? ` - ${expense.supplier}` : ""}`,
                  amount: `-${money(expense.amountCents, currency)}`,
                  onDelete: () => deleteItem("expense", expense.id),
                }))}
              />
            </Panel>

            <Panel title="Employes et salaires" subtitle="Ajoutez les employes, puis enregistrez chaque paie mensuelle avec charges employeur.">
              <form onSubmit={createEmployee} className="grid min-w-0 gap-3">
                <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                  <TextInput label="Prenom" value={employeeForm.firstName} onChange={(value) => setEmployeeForm({ ...employeeForm, firstName: value })} />
                  <TextInput label="Nom" value={employeeForm.lastName} onChange={(value) => setEmployeeForm({ ...employeeForm, lastName: value })} />
                  <TextInput label="Poste" value={employeeForm.role} onChange={(value) => setEmployeeForm({ ...employeeForm, role: value })} />
                  <TextInput label="Contrat" value={employeeForm.contractType} onChange={(value) => setEmployeeForm({ ...employeeForm, contractType: value })} />
                  <NumberInput label="Salaire brut mensuel" value={employeeForm.grossMonthlySalary} onChange={(value) => setEmployeeForm({ ...employeeForm, grossMonthlySalary: value })} />
                  <NumberInput label="Charges employeur %" value={employeeForm.employerContributionRatePercent} onChange={(value) => setEmployeeForm({ ...employeeForm, employerContributionRatePercent: value })} />
                </div>
                <button type="submit" disabled={isSaving} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:bg-slate-300">
                  <Users aria-hidden="true" className="h-4 w-4" />
                  Ajouter l&apos;employe
                </button>
              </form>

              <form onSubmit={createPayroll} className="grid min-w-0 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-950">Paie du mois</h3>
                <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                  <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-800">
                    Employe
                    <select
                      value={payrollForm.employeeId}
                      onChange={(event) =>
                        setPayrollForm({ ...payrollForm, employeeId: event.target.value })
                      }
                      className="min-h-11 w-full min-w-0 max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Choisir...</option>
                      {payload.employees
                        .filter((employee) => employee.active)
                        .map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName}
                          </option>
                        ))}
                    </select>
                  </label>
                  <NumberInput label="Salaire brut" value={payrollForm.grossSalary} onChange={(value) => setPayrollForm({ ...payrollForm, grossSalary: value })} />
                  <NumberInput label="Charges employeur" value={payrollForm.employerContributions} onChange={(value) => setPayrollForm({ ...payrollForm, employerContributions: value })} />
                  <NumberInput label="Net paye" value={payrollForm.netPaid} onChange={(value) => setPayrollForm({ ...payrollForm, netPaid: value })} />
                </div>
                <button type="submit" disabled={isSaving} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:bg-slate-300">
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  Ajouter la paie
                </button>
              </form>

              <DataList
                empty="Aucune paie sur ce mois."
                rows={payload.payrollEntries.map((entry) => ({
                  id: entry.id,
                  title: employeeName(employeesById.get(entry.employeeId), entry.employeeId),
                  meta: `Brut ${money(entry.grossSalaryCents, currency)} - charges ${money(entry.employerContributionsCents, currency)}`,
                  amount: `-${money(entry.grossSalaryCents + entry.employerContributionsCents, currency)}`,
                  onDelete: () => deleteItem("payroll", entry.id),
                }))}
              />
            </Panel>
          </section>
        </>
      ) : null}
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Banknote;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${tone}`}>
      <Icon aria-hidden="true" className="h-6 w-6" />
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </article>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="grid min-w-0 gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-800">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full min-w-0 max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextInput label={label} value={value} onChange={onChange} type="number" />
  );
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-800">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full min-w-0 max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

function DataList({
  rows,
  empty,
}: {
  rows: Array<{
    id: string;
    title: string;
    meta: string;
    amount: string;
    onDelete: () => void;
  }>;
  empty: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
        {empty}
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {rows.map((row) => (
        <article
          key={row.id}
          className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"
        >
          <div>
            <h3 className="text-sm font-semibold text-slate-950">{row.title}</h3>
            <p className="mt-1 text-xs text-slate-600">{row.meta}</p>
          </div>
          <strong className="text-sm text-slate-950">{row.amount}</strong>
          <button
            type="button"
            onClick={row.onDelete}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-white text-red-700 transition hover:bg-red-50"
            aria-label="Supprimer"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </button>
        </article>
      ))}
    </div>
  );
}
