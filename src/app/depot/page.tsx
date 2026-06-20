import { QoravoLogo } from "@/components/QoravoLogo";
import { prisma } from "@/lib/prisma";
import { DepositClient } from "./DepositClient";

type DepositPageProps = {
  searchParams: Promise<{ compte?: string }>;
};

export const dynamic = "force-dynamic";

export default async function DepositPage({ searchParams }: DepositPageProps) {
  const { compte } = await searchParams;
  const slug = compte?.trim() ?? "";
  const account = slug
    ? await prisma.proAccount.findUnique({
        where: { slug },
        select: {
          companyName: true,
          paymentStatus: true,
        },
      })
    : null;
  const isAvailable = Boolean(account && account.paymentStatus === "PAID");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-3xl gap-6">
        <QoravoLogo />

        {isAvailable && account ? (
          <DepositClient proAccountSlug={slug} shopName={account.companyName} />
        ) : (
          <section className="grid gap-4 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
              QR code invalide
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              Impossible de confirmer le depot.
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              Le lien ne contient pas de magasin actif. Scannez le QR code de
              depot affiche dans le magasin.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
