import type { Metadata } from "next";
import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { PaymentsClient } from "./PaymentsClient";

export const metadata: Metadata = { title: "Paiements en ligne — Qoravo Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
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
            <h1 className="text-3xl font-bold text-slate-950">Paiements en ligne</h1>
            <p className="text-sm leading-6 text-slate-600">
              Activez le paiement par carte pour que vos clients règlent leur
              réparation en ligne. L&apos;argent arrive directement sur votre
              compte bancaire via Stripe — Qoravo ne touche jamais à votre
              argent ni aux numéros de carte (sécurité bancaire PCI-DSS).
            </p>
          </header>
          <PaymentsClient />
        </div>
      </main>
    </>
  );
}
