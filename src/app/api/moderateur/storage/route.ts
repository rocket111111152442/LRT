import { NextResponse } from "next/server";
import { getFirestoreStorageBytes } from "@/lib/firebaseUsage";
import { requireModApi } from "@/lib/modAuth";
import { prisma } from "@/lib/prisma";
import { computeAccountUsage } from "@/lib/usage";

export const dynamic = "force-dynamic";

const GB = 1024 ** 3;
const DEFAULT_LIMIT_GB = 1;
const FIREBASE_PRICING_URL = "https://firebase.google.com/pricing";

function defaultLimitGb() {
  const value = Number(process.env.FIREBASE_STORAGE_LIMIT_GB);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_LIMIT_GB;
}

function projectId() {
  return process.env.FIREBASE_PROJECT_ID?.trim() || null;
}

function firebaseConsoleUrl() {
  const id = projectId();
  return id
    ? `https://console.firebase.google.com/project/${encodeURIComponent(id)}/usage/details`
    : FIREBASE_PRICING_URL;
}

function defaultUpgradeUrl() {
  return (
    process.env.FIREBASE_STORAGE_UPGRADE_URL?.trim() || firebaseConsoleUrl()
  );
}

async function getSettings() {
  return prisma.platformSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storageLimitGb: defaultLimitGb(),
      storageUpgradeUrl: defaultUpgradeUrl(),
    },
  });
}

function storageState(percent: number) {
  if (percent >= 100) return "full";
  if (percent >= 80) return "warning";
  return "healthy";
}

export async function GET() {
  const auth = await requireModApi();
  if (!auth.ok) {
    return auth.response as unknown as ReturnType<typeof NextResponse.json>;
  }

  try {
    const [settings, usage, providerUsedBytes] = await Promise.all([
      getSettings(),
      computeAccountUsage(null),
      getFirestoreStorageBytes(),
    ]);
    const storageLimitGb = Math.max(
      0.1,
      Number(settings.storageLimitGb) || defaultLimitGb(),
    );
    const limitBytes = Math.round(storageLimitGb * GB);
    const usedBytes = providerUsedBytes ?? usage.storageUsedBytes;
    const remainingBytes = Math.max(0, limitBytes - usedBytes);
    const percent =
      limitBytes > 0 ? Math.min(100, (usedBytes / limitBytes) * 100) : 100;

    return NextResponse.json(
      {
        provider: {
          name: "Firebase / Firestore",
          projectId: projectId(),
          metricAvailable: providerUsedBytes !== null,
          consoleUrl: firebaseConsoleUrl(),
          pricingUrl: FIREBASE_PRICING_URL,
        },
        settings: {
          storageLimitGb,
          storageUpgradeUrl:
            settings.storageUpgradeUrl?.trim() || defaultUpgradeUrl(),
        },
        usage: {
          ...usage,
          applicationUsedBytes: usage.storageUsedBytes,
          providerUsedBytes,
          usedBytes,
          limitBytes,
          remainingBytes,
          percent: Math.round(percent * 10) / 10,
          freePercent: Math.max(0, Math.round((100 - percent) * 10) / 10),
          state: storageState(percent),
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Moderator storage dashboard error:", error);
    return NextResponse.json(
      { error: "Le suivi du stockage n'a pas pu être calculé." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireModApi();
  if (!auth.ok) {
    return auth.response as unknown as ReturnType<typeof NextResponse.json>;
  }

  try {
    const body = (await request.json()) as {
      storageLimitGb?: unknown;
      storageUpgradeUrl?: unknown;
    };
    const storageLimitGb = Number(body.storageLimitGb);
    const rawUpgradeUrl =
      typeof body.storageUpgradeUrl === "string"
        ? body.storageUpgradeUrl.trim()
        : "";

    if (
      !Number.isFinite(storageLimitGb) ||
      storageLimitGb < 0.1 ||
      storageLimitGb > 1_000_000
    ) {
      return NextResponse.json(
        { error: "La capacité doit être comprise entre 0,1 et 1 000 000 Go." },
        { status: 400 },
      );
    }

    if (rawUpgradeUrl.length > 500) {
      return NextResponse.json(
        { error: "Le lien est trop long." },
        { status: 400 },
      );
    }

    if (rawUpgradeUrl) {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(rawUpgradeUrl);
      } catch {
        return NextResponse.json(
          { error: "Le lien doit être une URL HTTPS valide." },
          { status: 400 },
        );
      }

      if (parsedUrl.protocol !== "https:") {
        return NextResponse.json(
          { error: "Le lien doit commencer par https://." },
          { status: 400 },
        );
      }
    }

    const settings = await prisma.platformSettings.upsert({
      where: { id: "default" },
      update: {
        storageLimitGb,
        storageUpgradeUrl: rawUpgradeUrl || defaultUpgradeUrl(),
      },
      create: {
        id: "default",
        storageLimitGb,
        storageUpgradeUrl: rawUpgradeUrl || defaultUpgradeUrl(),
      },
    });

    return NextResponse.json({
      message: "Configuration du stockage enregistrée.",
      settings: {
        storageLimitGb: settings.storageLimitGb,
        storageUpgradeUrl: settings.storageUpgradeUrl,
      },
    });
  } catch (error) {
    console.error("Moderator storage settings error:", error);
    return NextResponse.json(
      { error: "La configuration n'a pas pu être enregistrée." },
      { status: 500 },
    );
  }
}
