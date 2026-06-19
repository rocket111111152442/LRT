import Link from "next/link";
import Stripe from "stripe";
import { LrtLogo } from "@/components/LrtLogo";
import { activatePaidCheckoutSession } from "@/lib/pro/paymentActivation";
import { SetupAppointmentClient } from "./SetupAppointmentClient";

export const dynamic = "force-dynamic";

type SetupHelpPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

type PageState =
  | {
      ok: true;
      sessionId: string;
      accountSlug: string | null;
      companyName: string;
      ownerEmail: string;
    }
  | {
      ok: false;
      title: string;
      message: string;
    };

function readMetadataText(
  metadata: Stripe.Metadata | null | undefined,
  key: string,
) {
  const value = metadata?.[key];
  return typeof value === "string" ? value : "";
}

async function loadSetupHelp(sessionId?: string): Promise<PageState> {
  if (!sessionId) {
    return {
      ok: false,
      title: "Paiement a verifier",
      message: "La reference Stripe est manquante.",
    };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      ok: false,
      title: "Stripe non configure",
      message: "La cle secrete Stripe n est pas configuree cote serveur.",
    };
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return {
        ok: false,
        title: "Paiement en attente",
        message:
          "Stripe n a pas encore confirme le paiement. Rechargez cette page dans quelques secondes.",
      };
    }

    if (session.metadata?.setupHelp !== "1") {
      return {
        ok: false,
        title: "Option non activee",
        message:
          "L assistance annuelle n a pas ete ajoutee a cet abonnement.",
      };
    }

    const activation = await activatePaidCheckoutSession(session);

    if (!activation.ok) {
      return {
        ok: false,
        title: "Activation impossible",
        message:
          "Le paiement est confirme, mais LRT n a pas pu activer le compte pour le moment.",
      };
    }

    return {
      ok: true,
      sessionId,
      accountSlug: activation.slug,
      companyName: readMetadataText(session.metadata, "companyName") || "Atelier",
      ownerEmail:
        readMetadataText(session.metadata, "ownerEmail") ||
        session.customer_email ||
        "",
    };
  } catch {
    return {
      ok: false,
      title: "Verification impossible",
      message:
        "LRT n a pas pu verifier le paiement Stripe pour le moment.",
    };
  }
}

export default async function SetupHelpPage({
  searchParams,
}: SetupHelpPageProps) {
  const { session_id: sessionId } = await searchParams;
  const state = await loadSetupHelp(sessionId);

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-2xl gap-6">
        <LrtLogo />
        {state.ok ? (
          <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <header className="grid gap-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Assistance activee
              </p>
              <h1 className="text-3xl font-semibold text-slate-950">
                Choisissez votre rendez-vous
              </h1>
              <p className="text-sm leading-6 text-slate-700">
                Votre compte est active. Choisissez maintenant le jour et
                l heure ou vous voulez etre contacte pour l assistance.
              </p>
            </header>

            <SetupAppointmentClient
              sessionId={state.sessionId}
              accountSlug={state.accountSlug}
              companyName={state.companyName}
              ownerEmail={state.ownerEmail}
            />
          </section>
        ) : (
          <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Assistance LRT
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              {state.title}
            </h1>
            <p className="text-sm leading-6 text-slate-700">{state.message}</p>
            <Link
              href="/admin/login"
              className="rounded-md bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Aller a la connexion admin
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
