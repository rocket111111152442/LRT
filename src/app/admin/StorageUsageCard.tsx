"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Database,
  FileClock,
  FileText,
  HardDrive,
  Images,
  Package,
  RefreshCw,
  ShieldCheck,
  Signature,
  WalletCards,
} from "lucide-react";
import { formatStorage, type UsageEvaluation } from "@/lib/plans";
import type { AccountUsage, StorageBreakdownItem } from "@/lib/usage";

type StoragePayload = {
  plan: string;
  capacity: {
    includedBytes: number;
    purchasedAddonBytes: number;
    purchasedAddonGb: number;
  };
  usage: AccountUsage;
  evaluation: UsageEvaluation;
  upgradeUrl: string;
  provider: {
    name: string;
    consoleUrl: string | null;
    pricingUrl: string;
  };
};

const CATEGORY_ICONS = {
  photos: Images,
  signatures: Signature,
  repairs: FileText,
  history: FileClock,
  inventory: Package,
  accounting: WalletCards,
  appointments: FileClock,
  support: ShieldCheck,
  account: Database,
} as const;

function storageStateLabel(state: UsageEvaluation["storageState"]) {
  if (state === "full") return "Espace saturé";
  if (state === "warning") return "Espace bientôt rempli";
  return "Espace disponible";
}

function storageStateClasses(state: UsageEvaluation["storageState"]) {
  if (state === "full") {
    return {
      badge: "border-red-200 bg-red-50 text-red-700",
      bar: "bg-red-500",
    };
  }
  if (state === "warning") {
    return {
      badge: "border-amber-200 bg-amber-50 text-amber-800",
      bar: "bg-amber-500",
    };
  }
  return {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    bar: "bg-gradient-to-r from-sky-500 to-emerald-500",
  };
}

function BreakdownRow({
  item,
  totalBytes,
}: {
  item: StorageBreakdownItem;
  totalBytes: number;
}) {
  const Icon = CATEGORY_ICONS[item.id] ?? HardDrive;
  const percent =
    totalBytes > 0 ? Math.round((item.bytes / totalBytes) * 100) : 0;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-sky-50 text-sky-700">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {item.label}
          </p>
          <p className="text-xs text-slate-500">
            {item.itemCount} élément{item.itemCount > 1 ? "s" : ""}
            {item.bytes > 0 ? ` · ${percent}% de l'espace utilisé` : ""}
          </p>
        </div>
      </div>
      <strong className="text-sm text-slate-950">
        {formatStorage(item.bytes)}
      </strong>
    </div>
  );
}

export function StorageUsageCard() {
  const [data, setData] = useState<StoragePayload | null>(null);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadUsage = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);

    try {
      const response = await fetch("/api/admin/usage", { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!response.ok || !payload) {
        throw new Error(payload?.error ?? "Mesure du stockage indisponible.");
      }

      setData(payload);
      setError("");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Mesure du stockage indisponible.",
      );
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadUsage();
    const refreshId = window.setInterval(() => void loadUsage(true), 5 * 60_000);

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        void loadUsage(true);
      }
    }

    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(refreshId);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadUsage]);

  const visibleBreakdown = useMemo(
    () =>
      [...(data?.usage.storageBreakdown ?? [])].sort(
        (left, right) => right.bytes - left.bytes,
      ),
    [data],
  );

  if (!data && !error) {
    return (
      <section className="q-card min-h-52 animate-pulse p-5">
        <div className="h-5 w-44 rounded bg-slate-200" />
        <div className="mt-6 h-8 w-72 max-w-full rounded bg-slate-200" />
        <div className="mt-4 h-4 rounded-full bg-slate-100" />
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-800">{error}</p>
        <button
          type="button"
          onClick={() => void loadUsage()}
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-800 shadow-sm"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Réessayer
        </button>
      </section>
    );
  }

  const { evaluation, capacity, usage } = data;
  const tone = storageStateClasses(evaluation.storageState);
  const displayedPercent =
    evaluation.storageUsedBytes > 0
      ? Math.max(1, evaluation.storagePercent)
      : evaluation.storagePercent;
  const updatedAt = new Date(usage.calculatedAt);

  return (
    <section className="q-card overflow-hidden" aria-labelledby="storage-title">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-sky-600 text-white shadow-sm">
            <HardDrive className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
              Serveur et base de données
            </p>
            <h2
              id="storage-title"
              className="mt-1 text-xl font-bold text-slate-950"
            >
              Espace de stockage de l&apos;atelier
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Photos, signatures, réparations, stock, agenda et comptabilité.
            </p>
          </div>
        </div>
        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${tone.badge}`}
        >
          {storageStateLabel(evaluation.storageState)}
        </span>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <div className="p-5 lg:border-r lg:border-slate-200">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600">
                Espace encore disponible
              </p>
              <p className="mt-1 text-3xl font-extrabold text-slate-950">
                {formatStorage(evaluation.storageRemainingBytes)}
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-600">
              {formatStorage(evaluation.storageUsedBytes)} utilisés sur{" "}
              {formatStorage(evaluation.storageLimitBytes)}
            </p>
          </div>

          <div
            className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200"
            role="progressbar"
            aria-label="Espace de stockage utilisé"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={evaluation.storagePercent}
          >
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${tone.bar}`}
              style={{ width: `${displayedPercent}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between gap-3 text-xs font-semibold text-slate-500">
            <span>{evaluation.storagePercent}% utilisé</span>
            <span>{evaluation.storageFreePercent}% libre</span>
          </div>

          <dl className="mt-5 grid grid-cols-2 border-y border-slate-200 sm:grid-cols-4">
            <div className="border-b border-r border-slate-200 py-3 pr-3 sm:border-b-0">
              <dt className="text-xs font-semibold text-slate-500">Inclus</dt>
              <dd className="mt-1 font-bold text-slate-950">
                {formatStorage(capacity.includedBytes)}
              </dd>
            </div>
            <div className="border-b border-slate-200 py-3 pl-3 sm:border-b-0 sm:border-r sm:pr-3">
              <dt className="text-xs font-semibold text-slate-500">Acheté en plus</dt>
              <dd className="mt-1 font-bold text-slate-950">
                {formatStorage(capacity.purchasedAddonBytes)}
              </dd>
            </div>
            <div className="border-r border-slate-200 py-3 pr-3 sm:pl-3">
              <dt className="text-xs font-semibold text-slate-500">Réparations</dt>
              <dd className="mt-1 font-bold text-slate-950">
                {usage.repairsTotal}
              </dd>
            </div>
            <div className="py-3 pl-3">
              <dt className="text-xs font-semibold text-slate-500">Photos</dt>
              <dd className="mt-1 font-bold text-slate-950">
                {usage.photosTotal}
              </dd>
            </div>
          </dl>

          {evaluation.messages.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {evaluation.messages.map((message) => (
                <p
                  key={message}
                  className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                >
                  {message}
                </p>
              ))}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link
              href={data.upgradeUrl}
              className="q-btn q-btn-primary text-sm"
            >
              Augmenter mon espace
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => void loadUsage()}
              disabled={isRefreshing}
              className="q-btn border border-slate-300 bg-white text-sm text-slate-800 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              Actualiser
            </button>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Mise à jour automatique toutes les 5 minutes et à chaque retour sur
            la page. Dernier calcul{" "}
            {Number.isNaN(updatedAt.getTime())
              ? "à l'instant"
              : updatedAt.toLocaleString("fr-FR")}. La mesure est une estimation
            des données Qoravo de votre atelier ; la facturation technique du
            fournisseur peut inclure les index et sauvegardes.
          </p>
        </div>

        <div className="bg-slate-50/60 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-950">Répartition détaillée</h3>
              <p className="mt-1 text-xs text-slate-500">
                Du plus volumineux au plus léger
              </p>
            </div>
            <Database className="h-5 w-5 text-sky-600" aria-hidden="true" />
          </div>
          <div className="mt-3">
            {visibleBreakdown.map((item) => (
              <BreakdownRow
                key={item.id}
                item={item}
                totalBytes={usage.storageUsedBytes}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
