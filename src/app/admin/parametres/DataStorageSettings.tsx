"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Cloud,
  Download,
  HardDrive,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
  WifiOff,
} from "lucide-react";
import {
  deleteActiveLocalBackup,
  downloadLocalBackup,
  isLocalBackupEnabled,
  loadActiveLocalBackup,
  LOCAL_BACKUP_CHANGED_EVENT,
  setLocalBackupEnabled,
  StoredLocalBackup,
  synchronizeLocalBackup,
} from "@/lib/localBackup";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} octets`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function DataStorageSettings() {
  const [enabled, setEnabled] = useState(false);
  const [backup, setBackup] = useState<StoredLocalBackup | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [persistent, setPersistent] = useState<boolean | null>(null);
  const [storageEstimate, setStorageEstimate] = useState<{
    usage: number;
    quota: number;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refreshState = useCallback(async () => {
    setEnabled(isLocalBackupEnabled());
    setBackup(await loadActiveLocalBackup().catch(() => null));
    if (navigator.storage?.persisted) {
      setPersistent(await navigator.storage.persisted().catch(() => false));
    }
    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate().catch(() => null);
      if (
        estimate &&
        typeof estimate.usage === "number" &&
        typeof estimate.quota === "number"
      ) {
        setStorageEstimate({ usage: estimate.usage, quota: estimate.quota });
      }
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void refreshState(), 0);
    const listener = () => void refreshState();
    window.addEventListener(LOCAL_BACKUP_CHANGED_EVENT, listener);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener(LOCAL_BACKUP_CHANGED_EVENT, listener);
    };
  }, [refreshState]);

  async function synchronize() {
    setIsSyncing(true);
    setMessage("");
    setError("");
    try {
      const saved = await synchronizeLocalBackup();
      setBackup(saved);
      setMessage("Copie locale mise a jour sur cet ordinateur.");
    } catch (syncError) {
      setError(
        syncError instanceof Error
          ? syncError.message
          : "Sauvegarde locale impossible.",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function enableLocalBackup() {
    setLocalBackupEnabled(true);
    setEnabled(true);
    if (navigator.storage?.persist) {
      setPersistent(await navigator.storage.persist().catch(() => false));
    }
    await synchronize();
  }

  function useCloudOnly() {
    setLocalBackupEnabled(false);
    setEnabled(false);
    setMessage(
      "Copie automatique desactivee. La copie deja presente reste sur cet ordinateur jusqu a sa suppression.",
    );
    setError("");
  }

  async function removeBackup() {
    if (!window.confirm("Supprimer la copie locale de cet ordinateur ? Les donnees cloud ne seront pas touchees.")) {
      return;
    }
    await deleteActiveLocalBackup();
    setBackup(null);
    setMessage("Copie locale supprimee. Les donnees cloud sont conservees.");
  }

  return (
    <section className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <HardDrive className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-slate-950">
            Stockage et copie de secours
          </h2>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Choisissez si cet ordinateur doit conserver automatiquement une copie
          de vos fiches. Le cloud reste indispensable pour les formulaires QR,
          les emails et l&apos;acces depuis plusieurs appareils.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <button
          type="button"
          onClick={useCloudOnly}
          aria-pressed={!enabled}
          className={`grid min-h-52 gap-4 rounded-xl border p-5 text-left transition ${
            !enabled
              ? "border-sky-400 bg-sky-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <span className="flex items-center justify-between gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <Cloud className="h-6 w-6" aria-hidden="true" />
            </span>
            {!enabled ? <Check className="h-5 w-5 text-sky-700" aria-hidden="true" /> : null}
          </span>
          <span>
            <strong className="block text-base text-slate-950">Cloud uniquement</strong>
            <span className="mt-2 block text-sm leading-6 text-slate-600">
              Accessible depuis tous vos appareils. Une connexion Internet est
              necessaire pour consulter et modifier les donnees.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => void enableLocalBackup()}
          aria-pressed={enabled}
          disabled={isSyncing}
          className={`relative grid min-h-52 gap-4 rounded-xl border p-5 text-left transition disabled:opacity-70 ${
            enabled
              ? "border-emerald-500 bg-emerald-50 shadow-sm"
              : "border-emerald-200 bg-emerald-50/40 hover:border-emerald-400"
          }`}
        >
          <span className="absolute right-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
            Recommande
          </span>
          <span className="flex items-center justify-between gap-3 pr-28">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <HardDrive className="h-6 w-6" aria-hidden="true" />
            </span>
            {enabled ? <Check className="h-5 w-5 text-emerald-700" aria-hidden="true" /> : null}
          </span>
          <span>
            <strong className="block text-base text-slate-950">
              Cloud + copie locale automatique
            </strong>
            <span className="mt-2 block text-sm leading-6 text-slate-600">
              Le maximum est conserve gratuitement sur cet ordinateur :
              reparations, clients, historique, stock, ventes et comptabilite.
              La copie est actualisee automatiquement et apres chaque
              enregistrement important.
            </span>
          </span>
        </button>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
        <div className="flex items-start gap-3">
          <WifiOff className="mt-0.5 h-5 w-5 text-emerald-600" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Secours hors ligne</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">La liste locale reste disponible lors d&apos;une coupure.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-sky-600" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Isole par ordinateur</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">La copie reste dans le profil de ce navigateur.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Download className="mt-0.5 h-5 w-5 text-violet-600" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Export recuperable</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">Telechargez une archive JSON quand vous le souhaitez.</p>
          </div>
        </div>
      </div>

      {enabled ? (
        <div className="grid gap-4 rounded-xl border border-emerald-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-950">Copie automatique active</p>
              <p className="mt-1 text-sm text-slate-600">
                {backup
                  ? `Derniere sauvegarde : ${formatDate(backup.savedAt)} · ${formatBytes(backup.sizeBytes)} · ${backup.payload.data.repairs.length} fiches`
                  : "Aucune copie terminee sur cet ordinateur."}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Stockage persistant : {persistent === true ? "accorde par le navigateur" : persistent === false ? "non garanti par le navigateur" : "verification en cours"}
              </p>
              {storageEstimate ? (
                <p className="mt-1 text-xs text-slate-500">
                  Espace Qoravo utilise par ce navigateur : {formatBytes(storageEstimate.usage)} sur {formatBytes(storageEstimate.quota)} autorises.
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void synchronize()}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
                Sauvegarder maintenant
              </button>
              <button
                type="button"
                onClick={() => backup && downloadLocalBackup(backup)}
                disabled={!backup}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Exporter
              </button>
              <button
                type="button"
                onClick={() => void removeBackup()}
                disabled={!backup}
                title="Supprimer uniquement la copie de cet ordinateur"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Supprimer la copie locale</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {message ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p> : null}
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}

      <p className="text-xs leading-5 text-slate-500">
        Important : la copie locale peut etre effacee si vous supprimez les
        donnees du navigateur ou changez d&apos;ordinateur. Elle ne remplace pas
        une sauvegarde cloud et ne permet pas aux clients d&apos;envoyer un
        formulaire lorsque toute la boutique est deconnectee.
      </p>
    </section>
  );
}
