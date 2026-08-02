"use client";

import { FormEvent, useEffect, useState } from "react";
import { Download, Package, ShoppingCart, Trash2, TrendingUp } from "lucide-react";
import {
  isLocalBackupEnabled,
  loadActiveLocalBackup,
  requestLocalBackupSynchronization,
} from "@/lib/localBackup";
import { buildLocalAccountingView } from "@/lib/localBackupData";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  reference: string | null;
  quantity: number;
  unitCostCents: number;
  unitPriceCents: number;
  location: string | null;
};

type Sale = {
  id: string;
  soldAt: string;
  label: string;
  category: string;
  quantity: number;
  unitPriceCents: number;
  unitCostCents: number;
  customerName: string | null;
  paymentMethod: string | null;
  inventoryItemId: string | null;
};

type Summary = { retailRevenueCents: number; retailCostCents: number };

const PAYMENT_METHODS = ["Espèces", "Carte", "Virement", "Chèque", "Autre"];
const CATEGORIES = ["ACCESSOIRE", "PIECE", "OCCASION", "AUTRE"];

function eur(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

export function SalesClient() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<Summary>({ retailRevenueCents: 0, retailCostCents: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [offlineNotice, setOfflineNotice] = useState("");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Formulaire
  const [itemId, setItemId] = useState("");
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("ACCESSOIRE");
  const [unitPrice, setUnitPrice] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Espèces");
  const [soldAt, setSoldAt] = useState(todayInput());
  const [notes, setNotes] = useState("");

  async function loadAll() {
    setLoading(true); setError("");
    setOfflineNotice("");

    async function restoreLocalData() {
      if (!isLocalBackupEnabled()) return false;
      const backup = await loadActiveLocalBackup().catch(() => null);
      if (!backup) return false;
      const localAccounting = buildLocalAccountingView(backup, year, month);
      setItems(backup.payload.data.inventoryItems as InventoryItem[]);
      setSales(localAccounting.sales as Sale[]);
      setSummary({
        retailRevenueCents: localAccounting.summary.retailRevenueCents,
        retailCostCents: localAccounting.summary.retailCostCents,
      });
      setOfflineNotice(
        `Mode hors ligne : ventes et stock sauvegardes le ${new Date(backup.savedAt).toLocaleString("fr-FR")} affiches en lecture seule.`,
      );
      return true;
    }
    try {
      const [invRes, accRes] = await Promise.all([
        fetch("/api/admin/inventory"),
        fetch(`/api/admin/accounting?year=${year}&month=${month}`),
      ]);
      if (invRes.status === 401 || accRes.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const inv = await invRes.json().catch(() => ({}));
      const acc = await accRes.json().catch(() => ({}));
      if (!invRes.ok || !accRes.ok) {
        if (!(await restoreLocalData())) setError("Chargement impossible.");
        return;
      }
      setItems(Array.isArray(inv.items) ? inv.items : []);
      setSales(Array.isArray(acc.sales) ? acc.sales : []);
      if (acc.summary) {
        setSummary({
          retailRevenueCents: acc.summary.retailRevenueCents ?? 0,
          retailCostCents: acc.summary.retailCostCents ?? 0,
        });
      }
    } catch {
      if (!(await restoreLocalData())) setError("Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedItem = items.find((i) => i.id === itemId) ?? null;

  function pickItem(id: string) {
    setItemId(id);
    setMessage(""); setError("");
    const item = items.find((i) => i.id === id);
    if (item) {
      setLabel(item.name);
      setCategory(CATEGORIES.includes(item.category) ? item.category : "AUTRE");
      setUnitPrice((item.unitPriceCents / 100).toFixed(2));
      setUnitCost((item.unitCostCents / 100).toFixed(2));
      const q = Number(quantity);
      if (!Number.isFinite(q) || q < 1) setQuantity("1");
    }
  }

  function resetForm() {
    setItemId(""); setLabel(""); setCategory("ACCESSOIRE");
    setUnitPrice(""); setUnitCost(""); setQuantity("1");
    setCustomerName(""); setPaymentMethod("Espèces"); setSoldAt(todayInput()); setNotes("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setMessage("");

    const qty = Number(quantity);
    const price = Number(unitPrice);
    if (!label.trim()) { setError("Nom de l'article requis."); return; }
    if (!Number.isFinite(price) || price <= 0) { setError("Prix de vente requis."); return; }
    if (!Number.isInteger(qty) || qty < 1) { setError("Quantité invalide."); return; }
    if (selectedItem && qty > selectedItem.quantity) {
      setError(`Stock insuffisant : ${selectedItem.quantity} en stock.`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/accounting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sale",
          inventoryItemId: itemId || undefined,
          label: label.trim(),
          category,
          quantity: qty,
          unitPrice: price,
          unitCost: Number(unitCost) || 0,
          customerName: customerName.trim() || undefined,
          paymentMethod,
          soldAt,
          notes: notes.trim() || undefined,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) { setError(payload.error ?? "Vente impossible."); return; }
      setMessage(
        payload.stockRemoved
          ? "Vente enregistrée. L'article est épuisé et retiré du stock."
          : "Vente enregistrée. Stock et chiffre d'affaires mis à jour.",
      );
      resetForm();
      await loadAll();
      requestLocalBackupSynchronization();
    } catch {
      setError("Vente impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSale(id: string) {
    if (!window.confirm("Supprimer cette vente ? (le stock n'est pas restauré)")) return;
    try {
      const res = await fetch(`/api/admin/accounting?kind=sale&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadAll();
        requestLocalBackupSynchronization();
      }
    } catch { /* ignore */ }
  }

  const marginCents = summary.retailRevenueCents - summary.retailCostCents;

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Chargement…</div>;
  }

  return (
    <div className="grid gap-6">
      {offlineNotice ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {offlineNotice}
        </p>
      ) : null}
      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "CA ventes (ce mois)", value: eur(summary.retailRevenueCents), icon: TrendingUp, tone: "text-emerald-600" },
          { label: "Marge (ce mois)", value: eur(marginCents), icon: ShoppingCart, tone: "text-sky-600" },
          { label: "Ventes enregistrées", value: String(sales.length), icon: Package, tone: "text-violet-600" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <k.icon className={`h-5 w-5 ${k.tone}`} aria-hidden="true" />
            <p className="mt-3 text-2xl font-extrabold text-slate-950">{k.value}</p>
            <p className="text-xs font-semibold text-slate-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Formulaire de vente */}
        <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-950">Nouvelle vente</h2>

          <div className="grid gap-2">
            <label htmlFor="v-item" className="text-sm font-medium text-slate-800">
              Article du stock
            </label>
            <select
              id="v-item"
              value={itemId}
              onChange={(e) => pickItem(e.target.value)}
              className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">— Vente libre (sans stock) —</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.quantity} en stock · {eur(item.unitPriceCents)}
                </option>
              ))}
            </select>
            {selectedItem ? (
              <p className="text-xs text-slate-500">
                {selectedItem.quantity} en stock{selectedItem.location ? ` · ${selectedItem.location}` : ""}. Tout reste modifiable ci-dessous.
              </p>
            ) : (
              <p className="text-xs text-slate-500">Ou saisissez librement un article non suivi en stock.</p>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="v-label" className="text-sm font-medium text-slate-800">Article vendu</label>
            <input id="v-label" value={label} onChange={(e) => setLabel(e.target.value)}
              className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(7rem,0.65fr)]">
            <div className="grid min-w-0 gap-2">
              <label htmlFor="v-price" className="text-sm font-medium text-slate-800">Prix de vente (€)</label>
              <input id="v-price" type="number" step="0.01" min="0" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)}
                className="min-h-11 min-w-0 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
            </div>
            <div className="grid min-w-0 gap-2">
              <label htmlFor="v-cost" className="text-sm font-medium text-slate-800">Coût d&apos;achat (€)</label>
              <input id="v-cost" type="number" step="0.01" min="0" value={unitCost} onChange={(e) => setUnitCost(e.target.value)}
                className="min-h-11 min-w-0 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
            </div>
            <div className="grid min-w-0 gap-2 sm:col-span-2 xl:col-span-1">
              <label htmlFor="v-qty" className="text-sm font-medium text-slate-800">Quantité</label>
              <input id="v-qty" type="number" step="1" min="1" max={selectedItem ? selectedItem.quantity : undefined}
                value={quantity} onChange={(e) => setQuantity(e.target.value)}
                className="min-h-11 min-w-0 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="v-cat" className="text-sm font-medium text-slate-800">Catégorie</label>
              <select id="v-cat" value={category} onChange={(e) => setCategory(e.target.value)}
                className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="v-pay" className="text-sm font-medium text-slate-800">Paiement</label>
              <select id="v-pay" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
                {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="v-client" className="text-sm font-medium text-slate-800">Client (optionnel)</label>
              <input id="v-client" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="v-date" className="text-sm font-medium text-slate-800">Date</label>
              <input id="v-date" type="date" value={soldAt} onChange={(e) => setSoldAt(e.target.value)}
                className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" />
            </div>
          </div>

          {/* Aperçu marge en direct */}
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Total : <strong>{eur(Math.round((Number(unitPrice) || 0) * 100) * (Number(quantity) || 0))}</strong>
            {" · "}Marge : <strong className="text-emerald-700">{eur(Math.round(((Number(unitPrice) || 0) - (Number(unitCost) || 0)) * 100) * (Number(quantity) || 0))}</strong>
          </p>

          {message ? <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{message}</p> : null}
          {error ? <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p> : null}

          <button type="submit" disabled={saving}
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            {saving ? "Enregistrement…" : "Enregistrer la vente"}
          </button>
        </form>

        {/* Ventes récentes */}
        <div className="grid content-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950">Ventes du mois</h2>
            <a href={`/api/admin/accounting/export?year=${year}&month=${month}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" aria-hidden="true" /> Export CSV
            </a>
          </div>
          {sales.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Aucune vente ce mois-ci.
            </p>
          ) : (
            <ul className="grid gap-2">
              {sales.map((sale) => (
                <li key={sale.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {sale.label} {sale.quantity > 1 ? `×${sale.quantity}` : ""}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(sale.soldAt).toLocaleDateString("fr-FR")}
                      {sale.paymentMethod ? ` · ${sale.paymentMethod}` : ""}
                      {sale.inventoryItemId ? " · depuis stock" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">{eur(sale.quantity * sale.unitPriceCents)}</span>
                    <button type="button" onClick={() => deleteSale(sale.id)}
                      className="text-slate-400 transition hover:text-red-600" aria-label="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
