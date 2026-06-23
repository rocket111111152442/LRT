import Link from "next/link";
import { AdminHeader } from "../../../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { getPublicAppUrl } from "@/lib/appUrl";
import { prisma } from "@/lib/prisma";
import { RepairLabel } from "./RepairLabel";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function RepairLabelPage({ params }: Props) {
  const admin = await requireAdminPage();
  const { id } = await params;

  let repair: {
    id: string;
    ticketNumber: string | null;
    proAccountId: string | null;
    firstName: string;
    lastName: string;
    deviceType: string;
    brand: string;
    model: string;
  } | null = null;

  try {
    repair = await prisma.repair.findUnique({
      where: { id },
      select: {
        id: true, ticketNumber: true, proAccountId: true,
        firstName: true, lastName: true, deviceType: true, brand: true, model: true,
      },
    });
  } catch {
    repair = null;
  }

  const headerProps = {
    email: admin.email,
    supportIncluded: admin.supportIncluded,
    paymentStatus: admin.paymentStatus,
    trialEndsAt: admin.trialEndsAt,
    proAccountSlug: admin.proAccountSlug,
  };

  if (!repair || (admin.proAccountId && repair.proAccountId && repair.proAccountId !== admin.proAccountId)) {
    return (
      <>
        <AdminHeader {...headerProps} />
        <main className="min-h-screen px-4 py-8">
          <p className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Réparation introuvable.
          </p>
        </main>
      </>
    );
  }

  const ticket = repair.ticketNumber ?? repair.id.slice(0, 8);
  const trackingUrl = `${getPublicAppUrl()}/suivi?ticket=${encodeURIComponent(ticket)}`;

  return (
    <>
      <AdminHeader {...headerProps} />
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-md gap-4">
          <div className="no-print">
            <Link
              href={`/admin/repairs/${repair.id}`}
              className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
            >
              ← Retour à la fiche
            </Link>
          </div>
          <RepairLabel
            ticketNumber={ticket}
            customerName={`${repair.firstName} ${repair.lastName}`.trim()}
            device={`${repair.deviceType} ${repair.brand} ${repair.model}`.trim()}
            shopName={admin.email}
            trackingUrl={trackingUrl}
          />
        </div>
      </main>
    </>
  );
}
