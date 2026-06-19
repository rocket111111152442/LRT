import { AdminHeader } from "../../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { RepairDetailClient } from "./RepairDetailClient";

type RepairDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RepairDetailPage({
  params,
}: RepairDetailPageProps) {
  const admin = await requireAdminPage();
  const { id } = await params;

  return (
    <>
      <AdminHeader email={admin.email} supportIncluded={admin.supportIncluded} />
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6">
          <header className="grid gap-2">
            <h1 className="text-3xl font-semibold text-slate-950">
              Reparation
            </h1>
          </header>
          <RepairDetailClient repairId={id} />
        </div>
      </main>
    </>
  );
}
