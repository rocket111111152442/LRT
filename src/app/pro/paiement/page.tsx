import Link from "next/link";
import { LrtLogo } from "@/components/LrtLogo";
import { prisma } from "@/lib/prisma";
import { PaymentClient } from "./PaymentClient";

export const dynamic = "force-dynamic";

type PaymentPageProps = {
  searchParams: Promise<{ compte?: string; inscription?: string }>;
};

const reasons = [
  "Activation de votre espace admin professionnel",
  "QR code unique pour votre atelier",
  "Limitation des faux comptes et des abus",
  "Acces aux reparations, statuts, notes internes et emails client",
];

type PendingSignupSummary = {
  id: string;
  slug: string;
  companyName: string;
  ownerEmail: string;
} | null;

async function getPendingSignupSummary(
  id?: string,
): Promise<PendingSignupSummary> {
  if (!id) {
    return null;
  }

  try {
    return await prisma.pendingProSignup.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        companyName: true,
        ownerEmail: true,
      },
    });
  } catch {
    return null;
  }
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const { compte, inscription } = await searchParams;
  const pendingSignup = await getPendingSignupSummary(inscription);
  const accountName = pendingSignup?.slug ?? compte ?? "";

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-2xl gap-6">
        <Link
          href="/pro/inscription"
          className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
        >
          Retour a l inscription
        </Link>
        <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <header className="grid gap-2">
            <LrtLogo />
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Activation premium
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              Votre compte est pret, il reste l activation.
            </h1>
            <p className="text-sm leading-6 text-slate-700">
              Le paiement unique de 9,99 EUR sert a activer le compte pro et a
              eviter la creation massive de comptes inutiles. A ce stade, aucun
              compte admin n est encore cree. Il sera cree automatiquement apres
              le paiement reussi.
            </p>
          </header>

          <ul className="grid gap-3">
            {reasons.map((reason) => (
              <li
                key={reason}
                className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
              >
                {reason}
              </li>
            ))}
          </ul>

          <div className="rounded-md bg-slate-950 p-4 text-white">
            <p className="text-sm text-slate-300">Compte</p>
            <p className="mt-1 text-lg font-semibold">
              {accountName || "Non precise"}
            </p>
            {pendingSignup ? (
              <p className="mt-2 text-sm text-slate-300">
                Atelier : {pendingSignup.companyName} Â· Email admin :{" "}
                {pendingSignup.ownerEmail}
              </p>
            ) : null}
          </div>

          {!pendingSignup && !compte ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Inscription introuvable. Retournez a l inscription et validez a
              nouveau le formulaire.
            </p>
          ) : null}

          <PaymentClient
            pendingSignupId={pendingSignup?.id}
            slug={compte ?? undefined}
          />
        </section>
      </div>
    </main>
  );
}
