import type { Metadata } from "next";
export const metadata: Metadata = { title: "Email — Qoravo Admin" };
import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { EmailSettingsForm } from "./EmailSettingsForm";

export default async function AdminEmailPage() {
  const admin = await requireAdminPage();

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
        <div className="mx-auto grid max-w-3xl gap-6">
          <header className="grid gap-2">
            <h1 className="text-3xl font-semibold text-slate-950">Email</h1>
          </header>
          <EmailSettingsForm />
        </div>
      </main>
    </>
  );
}
