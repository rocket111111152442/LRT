import { getApp } from "firebase-admin/app";
import { getFirebaseDb, shouldUseFirebase } from "@/lib/prisma";

type MonitoringPoint = {
  value?: {
    int64Value?: string;
    doubleValue?: number;
  };
};

type MonitoringSeries = {
  points?: MonitoringPoint[];
};

type MonitoringResponse = {
  timeSeries?: MonitoringSeries[];
};

/**
 * Lit la métrique officielle Firestore "données + index".
 *
 * La permission monitoring.timeSeries.list doit être accordée au compte de
 * service. En son absence, l'appelant utilise l'estimation interne Qoravo.
 */
export async function getFirestoreStorageBytes(): Promise<number | null> {
  if (!shouldUseFirebase()) {
    return null;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    return null;
  }

  try {
    getFirebaseDb();
    const credential = getApp().options.credential;
    if (!credential) {
      return null;
    }

    const accessToken = await credential.getAccessToken();
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      filter:
        'metric.type="firestore.googleapis.com/storage/data_and_index_storage_bytes"',
      "interval.startTime": startTime.toISOString(),
      "interval.endTime": endTime.toISOString(),
      view: "FULL",
    });
    const response = await fetch(
      `https://monitoring.googleapis.com/v3/projects/${encodeURIComponent(projectId)}/timeSeries?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken.access_token}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as MonitoringResponse;
    const values = (payload.timeSeries ?? []).map((series) => {
      const value = series.points?.[0]?.value;
      if (typeof value?.doubleValue === "number") {
        return value.doubleValue;
      }
      if (typeof value?.int64Value === "string") {
        return Number(value.int64Value);
      }
      return 0;
    });
    const total = values.reduce((sum, value) => sum + value, 0);

    return Number.isFinite(total) && total > 0 ? Math.round(total) : null;
  } catch {
    return null;
  }
}
