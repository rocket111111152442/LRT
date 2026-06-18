"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  lowStockThreshold: number;
};

const emptyForm = {
  id: "",
  name: "",
  quantity: "0",
  lowStockThreshold: "1",
};

export function InventoryClient() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  function editItem(item: InventoryItem) {
    setForm({
      id: item.id,
      name: item.name,
      quantity: String(item.quantity),
      lowStockThreshold: String(item.lowStockThreshold),
    });
    setMessage("");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    const body = {
      name: form.name,
      quantity: Number(form.quantity),
      lowStockThreshold: Number(form.lowStockThreshold),
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
      setMessage("Stock enregistre.");
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

      await loadItems();
      setMessage("Piece supprimee.");
    } catch {
      setError("Suppression impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <form
        onSubmit={handleSubmit}
        className="grid content-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-xl font-semibold text-slate-950">
          {form.id ? "Modifier une piece" : "Ajouter une piece"}
        </h2>
        <TextField
          label="Nom"
          value={form.name}
          onChange={(value) => setForm((current) => ({ ...current, name: value }))}
        />
        <TextField
          label="Quantite"
          type="number"
          value={form.quantity}
          onChange={(value) =>
            setForm((current) => ({ ...current, quantity: value }))
          }
        />
        <TextField
          label="Alerte stock bas"
          type="number"
          value={form.lowStockThreshold}
          onChange={(value) =>
            setForm((current) => ({ ...current, lowStockThreshold: value }))
          }
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
          {form.id ? (
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
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
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Piece</th>
                <th className="px-4 py-3">Quantite</th>
                <th className="px-4 py-3">Alerte</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item) => {
                const isLow = item.quantity <= item.lowStockThreshold;

                return (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.quantity}</td>
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
                          className="font-semibold text-slate-950 underline-offset-4 hover:underline"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(item)}
                          className="font-semibold text-red-700 underline-offset-4 hover:underline"
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
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-600">
                    Aucun stock ajoute.
                  </td>
                </tr>
              ) : null}
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-600">
                    Chargement...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function TextField({
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
    <label className="grid gap-2 text-sm font-medium text-slate-800">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
      />
    </label>
  );
}
