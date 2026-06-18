import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { QrCodeClient } from "./QrCodeClient";

function getNewRepairUrl(slug?: string | null) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = new URL("/nouvelle-reparation", baseUrl);

  if (slug) {
    url.searchParams.set("compte", slug);
  }

  return url.toString();
}

export default async function AdminQrCodePage() {
  const admin = await requireAdminPage();

  return (
    <>
      <AdminHeader email={admin.email} />
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-3xl gap-6">
          <QrCodeClient url={getNewRepairUrl(admin.proAccountSlug)} />
        </div>
      </main>
    </>
  );
}
