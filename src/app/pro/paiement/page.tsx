import Link from "next/link";
import { QoravoLogo } from "@/components/QoravoLogo";
import { prisma } from "@/lib/prisma";
import { readSignupToken } from "@/lib/pro/signupToken";
import { PaymentClient } from "./PaymentClient";

export const dynamic = "force-dynamic";

type PaymentPageProps = {
  searchParams: Promise<{
    compte?: string;
    inscription?: string;
    inscriptionToken?: string;
    raison?: string;
  }>;
};

const reasons = [
  "Activation de votre espace admin professionnel",
  "QR code unique pour votre atelier",
  "Limitation des faux comptes et des abus",
  "Acces aux reparations, statuts, notes internes et emails client",
  "Option assistance annuelle disponible pour le service client Qoravo",
];

type PendingSignupSummary = {
  id?: string;
  signupToken?: string;
  slug: string;
  companyName: string;
  ownerEmail: string;
  premiumDiscountCode?: string | null;
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

function getSignupTokenSummary(token?: string): PendingSignupSummary {
  if (!token) {
    return null;
  }

  const signup = readSignupToken(token);

  if (!signup) {
    return null;
  }

  return {
    signupToken: token,
    slug: signup.slug,
    companyName: signup.companyName,
    ownerEmail: signup.ownerEmail,
    premiumDiscountCode: signup.premiumDiscountCode,
  };
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const { compte, inscription, inscriptionToken, raison } = await searchParams;
  const pendingSignup =
    getSignupTokenSummary(inscriptionToken) ??
    (await getPendingSignupSummary(inscription));
  const accountName = pendingSignup?.slug ?? compte ?? "";
  const isShopListingUpgrade = raison === "boutique" && Boolean(compte);

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-2xl gap-6">
        <Link
          href={isShopListingUpgrade ? "/admin/parametres" : "/pro/inscription"}
          className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
        >
          {isShopListingUpgrade ? "Retour aux paramètres" : "Retour a l inscription"}
        </Link>
        <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <header className="grid gap-2">
            <QoravoLogo />
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Activation premium
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              {isShopListingUpgrade
                ? "Rendez votre boutique visible aux clients."
                : "Votre compte est pret, il reste l activation."}
            </h1>
            <p className="text-sm leading-6 text-slate-700">
              {isShopListingUpgrade ? (
                <>
                  Votre essai et toutes vos données restent disponibles.
                  L&apos;abonnement annuel de 89,99 EUR débloque le référencement
                  public de votre atelier et conserve votre accès à Qoravo.
                </>
              ) : (
                <>
                  L&apos;abonnement annuel de 89,99 EUR sert a activer le compte pro et
                  a eviter la creation massive de comptes inutiles. A ce stade,
                  aucun compte admin n est encore cree. Il sera cree automatiquement
                  apres le paiement reussi.
                </>
              )}
            </p>
          </header>

          {isShopListingUpgrade ? (
            <section className="grid gap-2 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sky-950">
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                Visibilité de votre boutique
              </p>
              <h2 className="text-xl font-semibold">
                Passez à l&apos;abonnement pour afficher votre boutique aux clients.
              </h2>
              <p className="text-sm leading-6 text-sky-900">
                L&apos;abonnement permet de publier votre atelier dans la recherche
                Qoravo afin que les clients puissent le trouver, consulter ses
                informations et envoyer une demande. Vos paramètres actuels sont
                conservés et vous pourrez activer l&apos;affichage après le paiement.
              </p>
            </section>
          ) : null}

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
                Atelier : {pendingSignup.companyName} - Email admin :{" "}
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
            signupToken={pendingSignup?.signupToken}
            slug={compte ?? undefined}
            initialPromoCode={pendingSignup?.premiumDiscountCode ?? ""}
          />
        </section>
      </div>
    </main>
  );
}
