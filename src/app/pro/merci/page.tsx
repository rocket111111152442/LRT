import Link from "next/link";
import Stripe from "stripe";
import { QoravoLogo } from "@/components/QoravoLogo";
import { activatePaidCheckoutSession } from "@/lib/pro/paymentActivation";
import { restoreFullPremiumPriceForRenewals } from "@/lib/stripeDiscounts";

export const dynamic = "force-dynamic";

type ProThanksPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

type ConfirmationState = {
  title: string;
  message: string;
  isActive: boolean;
  accountSlug?: string | null;
};

async function confirmStripePayment(
  sessionId?: string,
): Promise<ConfirmationState> {
  if (!sessionId) {
    return {
      title: "Paiement a verifier",
      message:
        "La reference Stripe est manquante. Si le paiement a ete accepte, reconnectez-vous dans quelques instants.",
      isActive: false,
    };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      title: "Paiement recu",
      message:
        "Stripe est revenu vers Qoravo, mais la cle secrete n est pas configuree cote serveur.",
      isActive: false,
    };
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const activation = await activatePaidCheckoutSession(session);
    await restoreFullPremiumPriceForRenewals(stripe, session);

    if (activation.ok) {
      return {
        title: "Compte pro actif",
        message:
          "Le paiement est confirme. Votre compte admin est maintenant debloque.",
        isActive: true,
        accountSlug: activation.slug,
      };
    }

    return {
      title: "Paiement en attente",
      message:
        "Stripe n a pas encore marque ce paiement comme paye. Attendez quelques secondes, puis rechargez cette page.",
      isActive: false,
    };
  } catch {
    return {
      title: "Verification impossible",
      message:
        "Qoravo n a pas pu verifier le paiement Stripe pour le moment. Reessayez dans quelques instants.",
      isActive: false,
    };
  }
}

export default async function ProThanksPage({
  searchParams,
}: ProThanksPageProps) {
  const { session_id: sessionId } = await searchParams;
  const confirmation = await confirmStripePayment(sessionId);

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div
        className={`mx-auto grid max-w-xl gap-5 rounded-lg border bg-white p-6 shadow-sm ${
          confirmation.isActive ? "border-emerald-200" : "border-slate-200"
        }`}
      >
        <QoravoLogo />
        <p
          className={`text-sm font-semibold uppercase tracking-wide ${
            confirmation.isActive ? "text-emerald-700" : "text-slate-500"
          }`}
        >
          {confirmation.isActive ? "Activation terminee" : "Activation premium"}
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">
          {confirmation.title}
        </h1>
        <p className="text-sm leading-6 text-slate-700">
          {confirmation.message}
          {confirmation.accountSlug ? (
            <>
              {" "}
              Compte : <strong>{confirmation.accountSlug}</strong>.
            </>
          ) : null}
        </p>
        <Link
          href="/admin/login"
          className="rounded-md bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Se connecter a l admin
        </Link>
      </div>
    </main>
  );
}
