"use client";

import {
  AlertTriangle,
  Database,
  ExternalLink,
  FileText,
  HardDrive,
  Images,
  RefreshCw,
  Save,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type StorageState = "healthy" | "warning" | "full";

type StorageData = {
  provider: {
    name: string;
    projectId: string | null;
    metricAvailable: boolean;
    consoleUrl: string;
    pricingUrl: string;
  };
  settings: {
    storageLimitGb: number;
    storageUpgradeUrl: string;
  };
  usage: {
    storageUsedBytes: number;
    applicationUsedBytes: number;
    providerUsedBytes: number | null;
    usedBytes: number;
    limitBytes: number;
    remainingBytes: number;
    percent: number;
    freePercent: number;
    state: StorageState;
    repairsThisMonth: number;
    repairsTotal: number;
    photosTotal: number;
    calculatedAt: string;
    storageBreakdown: {
      id: string;
      label: string;
      bytes: number;
      itemCount: number;
    }[];
  };
};

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

function formatBytes(bytes: number) {
  const safeBytes = Math.max(0, Number(bytes) || 0);
  if (safeBytes < 1024) return `${safeBytes.toFixed(0)} o`;
  if (safeBytes < 1024 ** 2) return `${(safeBytes / 1024).toFixed(1)} Ko`;
  if (safeBytes < 1024 ** 3) {
    return `${(safeBytes / 1024 ** 2).toFixed(1)} Mo`;
  }
  return `${(safeBytes / 1024 ** 3).toFixed(2)} Go`;
}

const STATE_STYLE: Record<
  StorageState,
  { label: string; badge: string; bar: string; glow: string }
> = {
  healthy: {
    label: "Capacité disponible",
    badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    bar: "bg-emerald-400",
    glow: "shadow-[0_0_24px_rgba(52,211,153,0.28)]",
  },
  warning: {
    label: "Capacité bientôt atteinte",
    badge: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    bar: "bg-amber-400",
    glow: "shadow-[0_0_24px_rgba(251,191,36,0.28)]",
  },
  full: {
    label: "Capacité atteinte",
    badge: "border-red-400/30 bg-red-400/10 text-red-300",
    bar: "bg-red-400",
    glow: "shadow-[0_0_24px_rgba(248,113,113,0.28)]",
  },
};

export function ModeratorStoragePanel() {
  const [data, setData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [limitGb, setLimitGb] = useState("");
  const [upgradeUrl, setUpgradeUrl] = useState("");

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/moderateur/storage", {
        cache: "no-store",
      });
      if (response.status === 401) {
        window.location.href = "/moderateur/login";
        return;
      }
      const payload = (await response.json()) as StorageData & {
        error?: string;
      };
      if (!response.ok) {
        setError(payload.error ?? "Chargement impossible.");
        return;
      }
      setData(payload);
      setLimitGb(String(payload.settings.storageLimitGb));
      setUpgradeUrl(payload.settings.storageUpgradeUrl);
    } catch {
      setError("Le serveur de stockage ne répond pas.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const interval = window.setInterval(
      () => void load(true),
      REFRESH_INTERVAL_MS,
    );
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void load(true);
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [load]);

  const accountCount = useMemo(
    () =>
      data?.usage.storageBreakdown.find((item) => item.id === "account")
        ?.itemCount ?? 0,
    [data],
  );

  async function saveSettings() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/moderateur/storage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storageLimitGb: Number(limitGb),
          storageUpgradeUrl: upgradeUrl,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        message?: string;
      };
      if (!response.ok) {
        setError(payload.error ?? "Enregistrement impossible.");
        return;
      }
      setMessage(payload.message ?? "Configuration enregistrée.");
      await load(true);
    } catch {
      setError("Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-sm text-slate-400">
        <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin" />
        Calcul du stockage global en cours...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-950/30 p-6 text-red-200">
        <p className="font-bold">Le stockage n&apos;a pas pu être chargé.</p>
        <p className="mt-1 text-sm">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const state = STATE_STYLE[data.usage.state];
  const providerOverhead = Math.max(
    0,
    (data.usage.providerUsedBytes ?? 0) - data.usage.applicationUsedBytes,
  );

  return (
    <section className="grid gap-5">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-400/10 text-sky-300">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-sky-300">
                Infrastructure
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-white">
                Stockage global Qoravo
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Toutes les boutiques, réparations, photos et données métier.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold ${state.badge}`}
            >
              {state.label}
            </span>
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              title="Actualiser les données"
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6">
          <div>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-3xl font-black text-white">
                  {formatBytes(data.usage.usedBytes)}
                </p>
                <p className="text-sm text-slate-400">
                  utilisés sur {formatBytes(data.usage.limitBytes)}
                </p>
              </div>
              <p className="text-right">
                <span className="block text-2xl font-extrabold text-white">
                  {data.usage.percent.toLocaleString("fr-FR")} %
                </span>
                <span className="text-xs text-slate-400">
                  {formatBytes(data.usage.remainingBytes)} disponibles
                </span>
              </p>
            </div>
            <div
              className="h-4 overflow-hidden rounded-full bg-black/30 ring-1 ring-white/10"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(data.usage.percent)}
              aria-label="Occupation du stockage global"
            >
              <div
                className={`h-full rounded-full transition-[width] duration-700 ${state.bar} ${state.glow}`}
                style={{
                  width: `${Math.max(
                    data.usage.percent > 0 ? 1 : 0,
                    data.usage.percent,
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Données Qoravo",
                value: formatBytes(data.usage.applicationUsedBytes),
                icon: Database,
                tone: "text-cyan-300 bg-cyan-400/10",
              },
              {
                label: "Comptes et utilisateurs",
                value: accountCount.toLocaleString("fr-FR"),
                icon: HardDrive,
                tone: "text-violet-300 bg-violet-400/10",
              },
              {
                label: "Réparations",
                value: data.usage.repairsTotal.toLocaleString("fr-FR"),
                icon: FileText,
                tone: "text-emerald-300 bg-emerald-400/10",
              },
              {
                label: "Photos",
                value: data.usage.photosTotal.toLocaleString("fr-FR"),
                icon: Images,
                tone: "text-amber-300 bg-amber-400/10",
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-white/10 bg-black/15 p-4"
              >
                <metric.icon
                  className={`h-8 w-8 rounded-lg p-1.5 ${metric.tone}`}
                />
                <p className="mt-3 text-xl font-extrabold text-white">
                  {metric.value}
                </p>
                <p className="text-xs font-semibold text-slate-400">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>

          <div
            className={`flex gap-3 rounded-xl border p-4 ${
              data.provider.metricAvailable
                ? "border-emerald-400/20 bg-emerald-400/5"
                : "border-amber-400/20 bg-amber-400/5"
            }`}
          >
            {data.provider.metricAvailable ? (
              <Database className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            )}
            <div className="text-sm">
              <p className="font-bold text-white">
                {data.provider.metricAvailable
                  ? "Mesure officielle Firestore active"
                  : "Estimation Qoravo active"}
              </p>
              <p className="mt-1 leading-6 text-slate-400">
                {data.provider.metricAvailable
                  ? `La jauge utilise la métrique Google Cloud des données et index. L'écart avec les données Qoravo est de ${formatBytes(providerOverhead)}.`
                  : "Le compte de service ne peut pas lire la métrique Google Cloud. La jauge additionne donc les données connues par Qoravo. Accordez monitoring.timeSeries.list pour obtenir la mesure officielle des données et index."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 px-5 py-4">
            <h3 className="font-bold text-white">Répartition des données</h3>
            <p className="mt-1 text-xs text-slate-400">
              Estimation interne, actualisée le{" "}
              {new Date(data.usage.calculatedAt).toLocaleString("fr-FR")}.
            </p>
          </div>
          <div className="divide-y divide-white/5">
            {data.usage.storageBreakdown.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.itemCount.toLocaleString("fr-FR")} élément
                    {item.itemCount > 1 ? "s" : ""}
                  </p>
                </div>
                <p className="text-sm font-bold text-white">
                  {formatBytes(item.bytes)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-300">
            Capacité de référence
          </p>
          <h3 className="mt-1 text-lg font-bold text-white">
            Configurer l&apos;offre serveur
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Indiquez ici la capacité incluse dans votre offre actuelle. La jauge
            se recalculera automatiquement après chaque modification.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-300">
              Capacité totale (Go)
              <input
                type="number"
                min="0.1"
                max="1000000"
                step="0.1"
                value={limitGb}
                onChange={(event) => setLimitGb(event.target.value)}
                className="min-h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-sky-400"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-300">
              Lien pour augmenter la capacité
              <input
                type="url"
                value={upgradeUrl}
                onChange={(event) => setUpgradeUrl(event.target.value)}
                placeholder="https://..."
                className="min-h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-sky-400"
              />
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
              {message}
            </p>
          ) : null}

          <div className="mt-5 grid gap-2">
            <button
              type="button"
              onClick={() => void saveSettings()}
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 text-sm font-bold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Enregistrement..." : "Enregistrer la capacité"}
            </button>
            <a
              href={data.settings.storageUpgradeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <ExternalLink className="h-4 w-4" />
              Ouvrir Firebase et augmenter l&apos;offre
            </a>
            <a
              href={data.provider.pricingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-center text-xs font-semibold text-slate-400 hover:text-sky-300"
            >
              Voir les tarifs officiels Firebase
            </a>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Projet : {data.provider.projectId ?? "non renseigné"} ·
            Actualisation automatique toutes les 5 minutes.
          </p>
        </div>
      </div>
    </section>
  );
}
