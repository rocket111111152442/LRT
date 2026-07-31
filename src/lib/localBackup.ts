"use client";

export const LOCAL_BACKUP_ENABLED_KEY = "qoravo-local-backup-enabled";
export const LOCAL_BACKUP_ACCOUNT_KEY = "qoravo-local-backup-account";
export const LOCAL_BACKUP_CHANGED_EVENT = "qoravo-local-backup-changed";
export const LOCAL_BACKUP_SYNC_REQUEST_EVENT = "qoravo-local-backup-sync-request";

const DATABASE_NAME = "qoravo-local-backups";
const DATABASE_VERSION = 1;
const STORE_NAME = "snapshots";

export type LocalBackupPayload = {
  version: number;
  generatedAt: string;
  account: {
    id: string;
    companyName: string;
    ownerEmail: string;
  };
  data: {
    repairs: unknown[];
    repairEvents: unknown[];
    inventoryItems: unknown[];
    accountingSettings: unknown | null;
    accountingSales: unknown[];
    accountingExpenses: unknown[];
    accountingEmployees: unknown[];
    accountingPayrollEntries: unknown[];
  };
};

export type StoredLocalBackup = {
  accountId: string;
  savedAt: string;
  sizeBytes: number;
  payload: LocalBackupPayload;
};

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "accountId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Stockage local indisponible."));
  });
}

function runRequest<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
) {
  return openDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const request = action(transaction.objectStore(STORE_NAME));

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Operation locale impossible."));
        transaction.oncomplete = () => database.close();
        transaction.onerror = () => reject(transaction.error ?? new Error("Operation locale impossible."));
      }),
  );
}

export function isLocalBackupEnabled() {
  return (
    typeof window !== "undefined" &&
    window.localStorage.getItem(LOCAL_BACKUP_ENABLED_KEY) === "1"
  );
}

export function setLocalBackupEnabled(enabled: boolean) {
  window.localStorage.setItem(LOCAL_BACKUP_ENABLED_KEY, enabled ? "1" : "0");
  window.dispatchEvent(new Event(LOCAL_BACKUP_CHANGED_EVENT));
}

export function requestLocalBackupSynchronization() {
  if (typeof window === "undefined" || !isLocalBackupEnabled()) return;
  window.dispatchEvent(new Event(LOCAL_BACKUP_SYNC_REQUEST_EVENT));
}

export async function saveLocalBackup(payload: LocalBackupPayload) {
  const serialized = JSON.stringify(payload);
  const backup: StoredLocalBackup = {
    accountId: payload.account.id,
    savedAt: new Date().toISOString(),
    sizeBytes: new Blob([serialized]).size,
    payload,
  };

  await runRequest("readwrite", (store) => store.put(backup));
  window.sessionStorage.setItem(LOCAL_BACKUP_ACCOUNT_KEY, payload.account.id);
  window.dispatchEvent(new Event(LOCAL_BACKUP_CHANGED_EVENT));
  return backup;
}

export async function loadLocalBackup(accountId: string) {
  if (!accountId) return null;
  const result = await runRequest<StoredLocalBackup | undefined>(
    "readonly",
    (store) => store.get(accountId),
  );
  return result ?? null;
}

export async function loadActiveLocalBackup() {
  if (typeof window === "undefined") return null;
  const accountId = window.sessionStorage.getItem(LOCAL_BACKUP_ACCOUNT_KEY) ?? "";
  return loadLocalBackup(accountId);
}

export async function deleteActiveLocalBackup() {
  const accountId = window.sessionStorage.getItem(LOCAL_BACKUP_ACCOUNT_KEY) ?? "";
  if (!accountId) return;
  await runRequest("readwrite", (store) => store.delete(accountId));
  window.sessionStorage.removeItem(LOCAL_BACKUP_ACCOUNT_KEY);
  window.dispatchEvent(new Event(LOCAL_BACKUP_CHANGED_EVENT));
}

export async function synchronizeLocalBackup() {
  const response = await fetch("/api/admin/local-backup", { cache: "no-store" });
  if (response.status === 401) {
    throw new Error("Connectez-vous pour effectuer la sauvegarde.");
  }
  const payload = (await response.json().catch(() => null)) as LocalBackupPayload | null;
  if (!response.ok || !payload?.account?.id || !payload.data) {
    throw new Error("La sauvegarde locale n a pas pu etre mise a jour.");
  }
  return saveLocalBackup(payload);
}

export function downloadLocalBackup(backup: StoredLocalBackup) {
  const blob = new Blob([JSON.stringify(backup.payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `qoravo-sauvegarde-${backup.payload.account.companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
