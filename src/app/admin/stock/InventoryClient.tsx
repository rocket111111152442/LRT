"use client";

import {
  FormEvent,
  type Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Boxes, Search, Wallet, AlertTriangle } from "lucide-react";
import {
  INVENTORY_CATEGORIES,
  inventoryCategoryLabel,
} from "@/lib/inventory";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  reference?: string | null;
  quantity: number;
  lowStockThreshold: number;
  unitCostCents?: number | null;
  unitPriceCents?: number | null;
  supplier?: string | null;
  location?: string | null;
  notes?: string | null;
};

const emptyForm = {
  id: "",
  name: "",
  category: "PIECE",
  reference: "",
  quantity: "0",
  lowStockThreshold: "1",
  unitCost: "",
  unitPrice: "",
  supplier: "",
  location: "",
  notes: "",
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function centsToInput(cents?: number | null) {
  return cents ? String((cents / 100).toFixed(2)) : "";
}

function inputToCents(value: string) {
  if (!value.trim()) {
    return 0;
  }

  const parsedValue = Number(value.replace(",", "."));
  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? Math.round(parsedValue * 100)
    : null;
}

const categoryTone: Record<string, string> = {
  PIECE: "bg-sky-50 text-sky-700 ring-sky-100",
  ACCESSOIRE: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  TELEPHONE: "bg-violet-50 text-violet-700 ring-violet-100",
  ORDINATEUR: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  CONSOLE: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
  OUTIL: "bg-amber-50 text-amber-700 ring-amber-100",
  CONSOMMABLE: "bg-teal-50 text-teal-700 ring-teal-100",
  AUTRE: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function InventoryClient() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const formRef = useRef<HTMLFormElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/inventory");

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Chargement impossible.");
        return;
      }

      setItems(payload.items ?? []);
    } catch {
      setError("Chargement impossible.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadItems();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadItems]);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMessage("");
    }, 2800);

    return () => window.clearTimeout(timeoutId);
  }, [message]);

  const summary = useMemo(() => {
    return items.reduce(
      (totals, item) => {
        const unitCostCents = item.unitCostCents ?? 0;
        const unitPriceCents = item.unitPriceCents ?? 0;
        const isLow = item.quantity <= item.lowStockThreshold;

        return {
          units: totals.units + item.quantity,
          stockValueCents: totals.stockValueCents + unitCostCents * item.quantity,
          saleValueCents: totals.saleValueCents + unitPriceCents * item.quantity,
          lowStockCount: totals.lowStockCount + (isLow ? 1 : 0),
        };
      },
      { units: 0, stockValueCents: 0, saleValueCents: 0, lowStockCount: 0 },
    );
  }, [items]);

  const visibleItems = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return items.filter((item) => {
      if (categoryFilter !== "ALL" && item.category !== categoryFilter) {
        return false;
      }

      if (!needle) {
        return true;
      }

      return [item.name, item.reference, item.supplier, item.location]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(needle));
    });
  }, [items, search, categoryFilter]);

  function editItem(item: InventoryItem) {
    setForm({
      id: item.id,
      name: item.name,
      category: item.category ?? "PIECE",
      reference: item.reference ?? "",
      quantity: String(item.quantity),
      lowStockThreshold: String(item.lowStockThreshold),
      unitCost: centsToInput(item.unitCostCents),
      unitPrice: centsToInput(item.unitPriceCents),
      supplier: item.supplier ?? "",
      location: item.location ?? "",
      notes: item.notes ?? "",
    });
    setMessage("");
    setError("");

    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }, 0);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    const unitCostCents = inputToCents(form.unitCost);
    const unitPriceCents = inputToCents(form.unitPrice);

    if (unitCostCents === null || unitPriceCents === null) {
      setError("Prix invalide.");
      setIsSaving(false);
      return;
    }

    const body = {
      name: form.name.trim(),
      category: form.category,
      reference: form.reference.trim(),
      quantity: Number(form.quantity),
      lowStockThreshold: Number(form.lowStockThreshold),
      unitCostCents,
      unitPriceCents,
      supplier: form.supplier.trim(),
      location: form.location.trim(),
      notes: form.notes.trim(),
    };

    try {
      const response = await fetch(
        form.id ? `/api/admin/inventory/${form.id}` : "/api/admin/inventory",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Enregistrement impossible.");
        return;
      }

      setForm(emptyForm);
      setMessage(
        form.id
          ? "Article modifié."
          : payload.merged
            ? "Quantité ajoutée à l'article existant."
            : "Article ajouté.",
      );
      await loadItems();
    } catch {
      setError("Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteItem(item: InventoryItem) {
    if (!window.confirm(`Supprimer ${item.name} du stock ?`)) {
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/inventory/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload.error ?? "Suppression impossible.");
        return;
      }

      if (form.id === item.id) {
        setForm(emptyForm);
      }

      await loadItems();
      setMessage("Article supprimé.");
    } catch {
      setError("Suppression impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  async function adjustQuantity(item: InventoryItem, change: number) {
    const nextQuantity = item.quantity + change;

    if (nextQuantity < 0 || isSaving) {
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      // On renvoie tout l'article : le PATCH remplace l'ensemble des champs,
      // donc envoyer une mise à jour partielle effacerait catégorie/prix/etc.
      const response = await fetch(`/api/admin/inventory/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          category: item.category,
          reference: item.reference ?? "",
          quantity: nextQuantity,
          lowStockThreshold: item.lowStockThreshold,
          unitCostCents: item.unitCostCents ?? 0,
          unitPriceCents: item.unitPriceCents ?? 0,
          supplier: item.supplier ?? "",
          location: item.location ?? "",
          notes: item.notes ?? "",
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Mise à jour impossible.");
        return;
      }

      if (form.id === item.id) {
        setForm((current) => ({ ...current, quantity: String(nextQuantity) }));
      }

      await loadItems();
      setMessage(change > 0 ? "Article ajouté au stock." : "Article retiré du stock.");
    } catch {
      setError("Mise à jour impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Boxes} label="Articles en stock" value={String(summary.units)} tone="text-brand-blue" />
        <SummaryCard
          icon={Wallet}
          label="Valeur d'achat"
          value={formatPrice(summary.stockValueCents)}
          tone="text-slate-900"
        />
        <SummaryCard
          icon={Wallet}
          label="Valeur de vente"
          value={formatPrice(summary.saleValueCents)}
          tone="text-brand-green"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Alertes stock bas"
          value={String(summary.lowStockCount)}
          tone={summary.lowStockCount > 0 ? "text-red-600" : "text-slate-900"}
          danger={summary.lowStockCount > 0}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[400px_1fr]">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="q-card grid content-start gap-4 p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {form.id ? "Édition" : "Nouvel article"}
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                {form.id ? "Modifier l'article" : "Ajouter un article"}
              </h2>
            </div>
            {form.id ? (
              <span className="rounded-full bg-brand-ink px-3 py-1 text-xs font-semibold text-white">
                En cours
              </span>
            ) : null}
          </div>

          <TextField
            inputRef={nameInputRef}
            label="Nom de l'article"
            value={form.name}
            onChange={(value) => setForm((current) => ({ ...current, name: value }))}
          />

          <label className="grid gap-2 text-sm font-medium text-slate-800">
            Catégorie
            <select
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-950 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            >
              {INVENTORY_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Référence / SKU"
              value={form.reference}
              onChange={(value) =>
                setForm((current) => ({ ...current, reference: value }))
              }
            />
            <TextField
              label="Emplacement"
              value={form.location}
              onChange={(value) =>
                setForm((current) => ({ ...current, location: value }))
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Quantité"
              type="number"
              min="0"
              value={form.quantity}
              onChange={(value) =>
                setForm((current) => ({ ...current, quantity: value }))
              }
            />
            <TextField
              label="Alerte stock bas"
              type="number"
              min="0"
              value={form.lowStockThreshold}
              onChange={(value) =>
                setForm((current) => ({ ...current, lowStockThreshold: value }))
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Prix d'achat (EUR)"
              type="number"
              min="0"
              step="0.01"
              value={form.unitCost}
              onChange={(value) =>
                setForm((current) => ({ ...current, unitCost: value }))
              }
            />
            <TextField
              label="Prix de vente (EUR)"
              type="number"
              min="0"
              step="0.01"
              value={form.unitPrice}
              onChange={(value) =>
                setForm((current) => ({ ...current, unitPrice: value }))
              }
            />
          </div>

          <TextField
            label="Fournisseur"
            value={form.supplier}
            onChange={(value) =>
              setForm((current) => ({ ...current, supplier: value }))
            }
          />

          <label className="grid gap-2 text-sm font-medium text-slate-800">
            Notes
            <textarea
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
              rows={2}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-950 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
          </label>

          <div className="grid gap-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <span>
              Valeur d&apos;achat de la ligne :{" "}
              <strong className="text-slate-950">
                {formatPrice((inputToCents(form.unitCost) ?? 0) * Number(form.quantity || 0))}
              </strong>
            </span>
            <span>
              Marge unitaire estimée :{" "}
              <strong className="text-brand-green">
                {formatPrice(
                  (inputToCents(form.unitPrice) ?? 0) - (inputToCents(form.unitCost) ?? 0),
                )}
              </strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="q-btn q-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Enregistrement..."
                : form.id
                  ? "Enregistrer"
                  : "Ajouter au stock"}
            </button>
            {form.id ? (
              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm);
                  setMessage("");
                  setError("");
                }}
                className="q-btn border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
              >
                Annuler
              </button>
            ) : null}
          </div>
        </form>

        <div className="grid content-start gap-4">
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {message}
            </p>
          ) : null}

          <div className="q-card overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-950">
                  Catalogue ({visibleItems.length})
                </h2>
                <p className="text-sm text-slate-500">
                  Pièces, accessoires, appareils, outils… tout votre stock au même endroit.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Rechercher (nom, réf, fournisseur)"
                    className="min-h-10 w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 sm:w-64"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                >
                  <option value="ALL">Toutes les catégories</option>
                  {INVENTORY_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Article</th>
                    <th className="px-4 py-3">Catégorie</th>
                    <th className="px-4 py-3">Quantité</th>
                    <th className="px-4 py-3">Achat</th>
                    <th className="px-4 py-3">Vente</th>
                    <th className="px-4 py-3">Valeur</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {visibleItems.map((item) => {
                    const unitCostCents = item.unitCostCents ?? 0;
                    const unitPriceCents = item.unitPriceCents ?? 0;
                    const isLow = item.quantity <= item.lowStockThreshold;

                    return (
                      <tr
                        key={item.id}
                        className={form.id === item.id ? "bg-sky-50/70" : undefined}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-950">{item.name}</div>
                          <div className="text-xs text-slate-500">
                            {item.reference ? `Réf. ${item.reference}` : null}
                            {item.reference && item.location ? " · " : null}
                            {item.location ? item.location : null}
                          </div>
                          {isLow ? (
                            <span className="mt-1 inline-block rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                              Stock bas (seuil {item.lowStockThreshold})
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                              categoryTone[item.category] ?? categoryTone.AUTRE
                            }`}
                          >
                            {inventoryCategoryLabel(item.category)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex w-fit items-center overflow-hidden rounded-lg border border-slate-300 bg-white">
                            <button
                              type="button"
                              onClick={() => adjustQuantity(item, -1)}
                              disabled={isSaving || item.quantity <= 0}
                              aria-label={`Retirer un ${item.name}`}
                              className="grid h-9 w-9 place-items-center text-base font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                            >
                              -
                            </button>
                            <span className="min-w-10 border-x border-slate-200 px-3 text-center font-semibold text-slate-950">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => adjustQuantity(item, 1)}
                              disabled={isSaving}
                              aria-label={`Ajouter un ${item.name}`}
                              className="grid h-9 w-9 place-items-center text-base font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatPrice(unitCostCents)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {unitPriceCents ? formatPrice(unitPriceCents) : "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-950">
                          {formatPrice(unitCostCents * item.quantity)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => editItem(item)}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteItem(item)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!isLoading && visibleItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-600">
                        {items.length === 0
                          ? "Aucun article dans le stock."
                          : "Aucun article ne correspond à votre recherche."}
                      </td>
                    </tr>
                  ) : null}
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-600">
                        Chargement...
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
  danger = false,
}: {
  icon: typeof Boxes;
  label: string;
  value: string;
  tone: string;
  danger?: boolean;
}) {
  return (
    <div className={`q-card p-4 ${danger ? "ring-1 ring-red-200" : ""}`}>
      <Icon className={`h-5 w-5 ${tone}`} aria-hidden="true" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

function TextField({
  inputRef,
  label,
  value,
  onChange,
  type = "text",
  min,
  step,
}: {
  inputRef?: Ref<HTMLInputElement>;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  step?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800">
      {label}
      <input
        ref={inputRef}
        type={type}
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
      />
    </label>
  );
}
