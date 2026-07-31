"use client";

import { useEffect } from "react";
import {
  isLocalBackupEnabled,
  LOCAL_BACKUP_CHANGED_EVENT,
  LOCAL_BACKUP_SYNC_REQUEST_EVENT,
  synchronizeLocalBackup,
} from "@/lib/localBackup";

const SYNC_INTERVAL_MS = 2 * 60 * 1000;

export function LocalDataSync() {
  useEffect(() => {
    let syncing = false;

    async function sync() {
      if (!isLocalBackupEnabled() || syncing || !navigator.onLine) return;
      syncing = true;
      try {
        await synchronizeLocalBackup();
      } catch {
        // La copie precedente reste disponible si le reseau est coupe.
      } finally {
        syncing = false;
      }
    }

    const handleChange = () => void sync();
    void sync();
    const interval = window.setInterval(sync, SYNC_INTERVAL_MS);
    window.addEventListener("online", handleChange);
    window.addEventListener(LOCAL_BACKUP_CHANGED_EVENT, handleChange);
    window.addEventListener(LOCAL_BACKUP_SYNC_REQUEST_EVENT, handleChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", handleChange);
      window.removeEventListener(LOCAL_BACKUP_CHANGED_EVENT, handleChange);
      window.removeEventListener(LOCAL_BACKUP_SYNC_REQUEST_EVENT, handleChange);
    };
  }, []);

  return null;
}
