import type { Metadata } from "next";
export const metadata: Metadata = { title: "QR Code — Qoravo Admin" };
import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { getPublicAppUrl } from "@/lib/appUrl";
import { QrCodeClient } from "./QrCodeClient";

function getNewRepairUrl(slug?: string | null) {
  const url = new URL("/nouvelle-reparation", getPublicAppUrl());

  if (slug) {
    url.searchParams.set("compte", slug);
  }

  url.searchParams.set("mode", "qr-comptoir");

  return url.toString();
}

function getDepositUrl(slug?: string | null) {
  const url = new URL("/depot", getPublicAppUrl());

  if (slug) {
    url.searchParams.set("compte", slug);
  }

  return url.toString();
}

export default async function AdminQrCodePage() {
  const admin = await requireAdminPage();
  const newRepairUrl = getNewRepairUrl(admin.proAccountSlug);
  const depositUrl = getDepositUrl(admin.proAccountSlug);

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
