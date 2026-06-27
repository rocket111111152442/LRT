import type { Metadata } from "next";
import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EnterpriseQuoteClient } from "./EnterpriseQuoteClient";

export const metadata: Metadata = { title: "Offre entreprise — Qoravo Admin" };
export const dynamic = "force-dynamic";

export default async function EnterpriseOfferPage() {
  const admin = await requireAdminPage();

  let companyName = "";
  if (admin.proAccountId) {
    const account = await prisma.proAccount
      .findUnique({ where: { id: admin.proAccountId }, select: { companyName: true } })
      .catch(() => null);
    companyName = account?.companyName ?? "";
  }

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
          <header className="grid gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-fuchsia-700">
              Offre entreprise
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              Construisez votre offre sur mesure
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Répondez au questionnaire : le prix se calcule en direct selon vos
              besoins. Si l&apos;estimation vous convient, demandez l&apos;offre en un
              clic. Sinon, un conseiller vous recontacte pour l&apos;adapter.
            </p>
          </header>
          <EnterpriseQuoteClient adminEmail={admin.email} companyName={companyName} />
        </div>
      </main>
    </>
  );
}
