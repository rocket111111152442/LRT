"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Mail, Phone, Search, Wrench } from "lucide-react";
import { isLocalBackupEnabled, loadActiveLocalBackup } from "@/lib/localBackup";

type Client = {
  key: string;
  name: string;
  phone: string;
  email: string;
  repairCount: number;
  totalSpentCents: number;
  lastRepairAt: string | null;
  repairs: {
    id: string;
    ticketNumber: string | null;
    device: string;
    status: string;
    paidAmountCents: number;
    createdAt: string | null;
  }[];
};

function money(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR");
}

type LocalRepair = {
  id: string;
  ticketNumber?: string | null;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  deviceType?: string;
  brand?: string;
  model?: string;
  status?: string;
  paidAmountCents?: number;
  createdAt?: string | null;
};

function buildClientsFromRepairs(records: unknown[]): Client[] {
  const clients = new Map<string, Client>();

  for (const record of records as LocalRepair[]) {
    const email = record.email?.trim().toLowerCase() ?? "";
    const phone = record.phone?.replace(/\D/g, "") ?? "";
    const key = email
      ? `e:${email}`
      : phone
        ? `p:${phone}`
        : `n:${record.firstName ?? ""}-${record.lastName ?? ""}`.toLowerCase();
    const createdAt = record.createdAt ?? null;
    const existing = clients.get(key);
    const repair = {
      id: record.id,
      ticketNumber: record.ticketNumber ?? null,
      device: `${record.deviceType ?? ""} ${record.brand ?? ""} ${record.model ?? ""}`.trim(),
      status: record.status ?? "",
      paidAmountCents: record.paidAmountCents ?? 0,
      createdAt,
    };

    if (existing) {
      existing.repairCount += 1;
      existing.totalSpentCents += repair.paidAmountCents;
      existing.repairs.push(repair);
      if (createdAt && (!existing.lastRepairAt || createdAt > existing.lastRepairAt)) {
        existing.lastRepairAt = createdAt;
      }
    } else {
      clients.set(key, {
        key,
        name: `${record.firstName ?? ""} ${record.lastName ?? ""}`.trim(),
        phone: record.phone ?? "",
        email: record.email ?? "",
        repairCount: 1,
        totalSpentCents: repair.paidAmountCents,
        lastRepairAt: createdAt,
        repairs: [repair],
      });
    }
  }

  return [...clients.values()].sort((a, b) =>
    (b.lastRepairAt ?? "").localeCompare(a.lastRepairAt ?? ""),
  );
}

export function ClientsClient() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offlineNotice, setOfflineNotice] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      async function restoreLocalClients() {
        if (!isLocalBackupEnabled()) return false;
        const backup = await loadActiveLocalBackup().catch(() => null);
        if (!backup || !active) return false;
        setClients(buildClientsFromRepairs(backup.payload.data.repairs));
        setOfflineNotice(
          `Mode hors ligne : clients sauvegardes le ${new Date(backup.savedAt).toLocaleString("fr-FR")} affiches en lecture seule.`,
        );
        return true;
      }

      try {
        const res = await fetch("/api/admin/clients");
        if (res.status === 401) { window.location.href = "/admin/login"; return; }
        const data = await res.json();
        if (active && res.ok) setClients(data.clients ?? []);
        else if (active && !(await restoreLocalClients())) setError(data.error ?? "Chargement impossible.");
      } catch {
        if (active && !(await restoreLocalClients())) setError("Chargement impossible.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.name, c.email, c.phone].some((f) => f.toLowerCase().includes(q)),
    );
  }, [clients, search]);

  if (loading) {
    return <div className="q-card p-6 text-sm text-slate-600">Chargement...</div>;
  }
  if (error) {
    return <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>;
  }

  const totalRevenue = clients.reduce((s, c) => s + c.totalSpentCents, 0);
  const loyal = clients.filter((c) => c.repairCount >= 2).length;

  return (
    <section className="grid gap-5">
      {offlineNotice ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {offlineNotice}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Clients" value={String(clients.length)} />
        <Stat label="Clients fidèles (2+)" value={String(loyal)} />
        <Stat label="CA encaissé total" value={money(totalRevenue)} />
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un client (nom, email, téléphone)"
          className="min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
        />
      </div>

      <div className="grid gap-3">
        {filtered.map((client) => {
          const isOpen = open === client.key;
          return (
            <div key={client.key} className="q-card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : client.key)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-950">{client.name || "Client"}</p>
                  <p className="flex flex-wrap gap-x-3 text-xs text-slate-500">
                    {client.phone ? <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span> : null}
                    {client.email ? <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span> : null}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-xs text-slate-500">Réparations</p>
                    <p className="font-bold text-slate-950">{client.repairCount}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="font-bold text-brand-green">{money(client.totalSpentCents)}</p>
                  </div>
                  {isOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </div>
              </button>

              {isOpen ? (
                <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Dernière réparation : {formatDate(client.lastRepairAt)}
                  </p>
                  <div className="grid gap-2">
                    {client.repairs.map((r) => (
                      <Link
                        key={r.id}
                        href={`/admin/repairs/${r.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition hover:border-brand-blue"
                      >
                        <span className="inline-flex items-center gap-2 text-slate-700">
                          <Wrench className="h-3.5 w-3.5 text-slate-400" />
                          {r.ticketNumber ?? r.id.slice(0, 8)} · {r.device}
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">{r.status}</span>
                          <span className="font-semibold text-slate-950">{money(r.paidAmountCents)}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
        {filtered.length === 0 ? (
          <p className="q-card p-6 text-center text-sm text-slate-500">
            {clients.length === 0 ? "Aucun client pour le moment." : "Aucun client ne correspond."}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="q-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-950">{value}</p>
    </div>
  );
}
