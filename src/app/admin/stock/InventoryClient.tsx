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

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  lowStockThreshold: number;
  unitCostCents?: number | null;
};

const emptyForm = {
  id: "",
  name: "",
  quantity: "0",
  lowStockThreshold: "1",
  unitCost: "",
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

export function InventoryClient() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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

  const summary = useMemo(() => {
    return items.reduce(
      (totals, item) => {
        const unitCostCents = item.unitCostCents ?? 0;
        const isLow = item.quantity <= item.lowStockThreshold;

        return {
          units: totals.units + item.quantity,
          stockValueCents: totals.stockValueCents + unitCostCents * item.quantity,
          lowStockCount: totals.lowStockCount + (isLow ? 1 : 0),
        };
      },
      { units: 0, stockValueCents: 0, lowStockCount: 0 },
    );
  }, [items]);

  function editItem(item: InventoryItem) {
    setForm({
      id: item.id,
      name: item.name,
      quantity: String(item.quantity),
      lowStockThreshold: String(item.lowStockThreshold),
      unitCost: centsToInput(item.unitCostCents),
    });
    setMessage(`Modification de "${item.name}" en cours.`);
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

    if (unitCostCents === null) {
      setError("Prix d'achat invalide.");
      setIsSaving(false);
      return;
    }

    const body = {
      name: form.name.trim(),
      quantity: Number(form.quantity),
      lowStockThreshold: Number(form.lowStockThreshold),
      unitCostCents,
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
      setMessage(form.id ? "Piece modifiee." : "Piece ajoutee.");
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
      setMessage("Piece supprimee.");
    } catch {
      setError("Suppression impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="grid gap-5">
      <div className="grid gap-3 md:grid-cols-3">
        <SummaryCard label="Pieces en stock" value={String(summary.units)} />
        <SummaryCard
          label="Valeur achat stock"
          value={formatPrice(summary.stockValueCents)}
        />
        <SummaryCard
          label="Alertes stock bas"
          value={String(summary.lowStockCount)}
          danger={summary.lowStockCount > 0}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="grid content-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {form.id ? "Edition" : "Nouvelle piece"}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                {form.id ? "Modifier la piece" : "Ajouter une piece"}
              </h2>
            </div>
            {form.id ? (
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                En cours
              </span>
            ) : null}
          </div>

          <TextField
            inputRef={nameInputRef}
            label="Nom"
            value={form.name}
            onChange={(value) => setForm((current) => ({ ...current, name: value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <TextField
              label="Quantite"
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
          <TextField
            label="Prix d'achat par piece EUR"
            type="number"
            min="0"
            step="0.01"
            value={form.unitCost}
            onChange={(value) =>
              setForm((current) => ({ ...current, unitCost: value }))
            }
          />

          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Total achat pour cette ligne :{" "}
            <strong className="text-slate-950">
              {formatPrice((inputToCents(form.unitCost) ?? 0) * Number(form.quantity || 0))}
            </strong>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-11 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving
                ? "Enregistrement..."
                : form.id
                  ? "Enregistrer la modification"
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
                className="min-h-11 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Annuler
              </button>
            ) : null}
          </div>
        </form>

        <div className="grid gap-4">
          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {message}
            </p>
          ) : null}

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Pieces enregistrees
                </h2>
                <p className="text-sm text-slate-500">
                  Le prix d&apos;achat sert a calculer la valeur du stock et le benefice.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Piece</th>
                    <th className="px-4 py-3">Quantite</th>
                    <th className="px-4 py-3">Prix achat</th>
                    <th className="px-4 py-3">Valeur stock</th>
                    <th className="px-4 py-3">Alerte</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item) => {
                    const unitCostCents = item.unitCostCents ?? 0;
                    const isLow = item.quantity <= item.lowStockThreshold;

                    return (
                      <tr
                        key={item.id}
                        className={form.id === item.id ? "bg-sky-50/70" : undefined}
                      >
                        <td className="px-4 py-3 font-medium text-slate-950">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{item.quantity}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {formatPrice(unitCostCents)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-950">
                          {formatPrice(unitCostCents * item.quantity)}
                        </td>
                        <td className="px-4 py-3">
                          {isLow ? (
                            <span className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                              Stock bas
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              Seuil {item.lowStockThreshold}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => editItem(item)}
                              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteItem(item)}
                              className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!isLoading && items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-600">
                        Aucun stock ajoute.
                      </td>
                    </tr>
                  ) : null}
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-600">
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
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={danger ? "mt-2 text-2xl font-semibold text-red-700" : "mt-2 text-2xl font-semibold text-slate-950"}>
        {value}
      </p>
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
        className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
      />
    </label>
  );
}
