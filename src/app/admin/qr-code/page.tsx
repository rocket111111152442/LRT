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

  return url.toString();
}

export default async function AdminQrCodePage() {
  const admin = await requireAdminPage();
  const newRepairUrl = await getNewRepairUrl(admin.proAccountSlug);

  return (
    <>
      <AdminHeader email={admin.email} />
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-3xl gap-6">
          <QrCodeClient url={newRepairUrl} />
        </div>
      </main>
    </>
  );
}
