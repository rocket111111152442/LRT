import { AdminHeader } from "../../../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { ReceiptClient } from "./ReceiptClient";

type ReceiptPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RepairReceiptPage({ params }: ReceiptPageProps) {
  const admin = await requireAdminPage();
  const { id } = await params;

  return (
    <>
      <AdminHeader email={admin.email} supportIncluded={admin.supportIncluded} />
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <ReceiptClient repairId={id} />
        </div>
      </main>
    </>
  );
}
