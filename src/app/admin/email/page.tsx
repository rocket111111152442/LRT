import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { EmailSettingsForm } from "./EmailSettingsForm";

export default async function AdminEmailPage() {
  const admin = await requireAdminPage();

  return (
    <>
      <AdminHeader email={admin.email} />
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
