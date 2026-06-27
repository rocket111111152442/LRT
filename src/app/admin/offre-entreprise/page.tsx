import type { Metadata } from "next";
import Stripe from "stripe";
import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { activateEnterpriseCheckoutSession } from "@/lib/pro/enterpriseActivation";
import { EnterpriseQuoteClient } from "./EnterpriseQuoteClient";

export const metadata: Metadata = { title: "Offre entreprise — Qoravo Admin" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ paid?: string; session_id?: string }> };

// Filet de sécurité : si le webhook Stripe n'a pas (encore) activé l'offre, on
// confirme aussi au retour du paiement.
async function confirmEnterprisePayment(sessionId?: string) {
  if (!sessionId || !process.env.STRIPE_SECRET_KEY) return false;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const result = await activateEnterpriseCheckoutSession(session);
    return result.ok;
  } catch {
    return false;
  }
}

export default async function EnterpriseOfferPage({ searchParams }: Props) {
  const admin = await requireAdminPage();
  const { paid, session_id: sessionId } = await searchParams;

  let paymentConfirmed = false;
  if (paid === "1") {
    paymentConfirmed = await confirmEnterprisePayment(sessionId);
  }

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
          {paid === "1" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              {paymentConfirmed
                ? "Paiement reçu ! Votre offre entreprise est activée : plan entreprise, support et stockage mis à jour."
                : "Paiement reçu. L'activation est en cours de confirmation — rechargez la page dans quelques instants si besoin."}
            </div>
          ) : null}
          {paid === "cancel" ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              Paiement annulé. Vous pouvez ajuster votre offre et réessayer quand vous voulez.
            </div>
          ) : null}
          <EnterpriseQuoteClient adminEmail={admin.email} companyName={companyName} />
        </div>
      </main>
    </>
  );
}
