import type { Metadata } from "next";
export const metadata: Metadata = { title: "QR Code — Qoravo Admin" };
import { headers } from "next/headers";
import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { getPublicAppUrl } from "@/lib/appUrl";
import { QrCodeClient } from "./QrCodeClient";

async function getBaseUrl() {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const forwardedProto = headerStore.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return getPublicAppUrl();
}

async function getNewRepairUrl(slug?: string | null) {
  const baseUrl = await getBaseUrl();
  const url = new URL("/nouvelle-reparation", baseUrl);

  if (slug) {
    url.searchParams.set("compte", slug);
  }

  url.searchParams.set("mode", "qr-comptoir");

  return url.toString();
}

async function getDepositUrl(slug?: string | null) {
  const baseUrl = await getBaseUrl();
  const url = new URL("/depot", baseUrl);

  if (slug) {
    url.searchParams.set("compte", slug);
  }

  return url.toString();
}

export default async function AdminQrCodePage() {
  const admin = await requireAdminPage();
  const newRepairUrl = await getNewRepairUrl(admin.proAccountSlug);
  const depositUrl = await getDepositUrl(admin.proAccountSlug);

  return (
    <>
      <AdminHeader
        email={admin.email}
        supportIncluded={admin.supportIncluded}
        paymentStatus={admin.paymentStatus}
        trialEndsAt={admin.trialEndsAt}
        proAccountSlug={admin.proAccountSlug}
      />
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6">
          <QrCodeClient newRepairUrl={newRepairUrl} depositUrl={depositUrl} />
        </div>
      </main>
    </>
  );
}
