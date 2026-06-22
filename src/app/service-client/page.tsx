import Link from "next/link";
import Stripe from "stripe";
import { SupportSubscribeButton } from "@/app/admin/SupportSubscribeButton";
import { QoravoLogo } from "@/components/QoravoLogo";
import { getCurrentAdmin } from "@/lib/auth";
import { activatePaidCheckoutSession } from "@/lib/pro/paymentActivation";
import { SupportForm } from "./SupportForm";

const supportPhoneDisplay = "07 53 30 54 52";
const supportPhoneHref = "tel:+33753305452";

const supportPoints = [
  "Demande envoyable 24h/24 depuis le site",
  `Contact telephone : ${supportPhoneDisplay}`,
  "Aide pour la connexion, le paiement et les emails",
];

const commonRequests = [
  "Je n arrive pas a recevoir le code de connexion",
  "Je veux configurer les emails PRET",
  "Je veux comprendre le QR code de mon atelier",
  "Je veux signaler un bug ou une erreur sur une fiche",
];

export const dynamic = "force-dynamic";

type SupportPageProps = {
  searchParams: Promise<{ session_id?: string; offre?: string }>;
};

async function confirmSupportPayment(sessionId?: string) {
  if (!sessionId || !process.env.STRIPE_SECRET_KEY) {
    return;
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    await activatePaidCheckoutSession(session);
  } catch {
    // Le webhook Stripe peut encore activer l'option si le retour navigateur echoue.
  }
}

const offreLabels: Record<string, string> = {
  extra_storage_10gb: "Option Stockage Plus (+10 Go)",
  extra_storage_25gb: "Option Stockage Pro (+25 Go)",
  active_shop_pack: "Pack Boutique Active",
  big_workshop_pack: "Pack Gros Atelier",
  multi_shop_pack: "Pack Multi-Boutiques",
  enterprise: "Offre Entreprise / Sur mesure",
};

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const { session_id: sessionId, offre } = await searchParams;

  await confirmSupportPayment(sessionId);

  const admin = await getCurrentAdmin();

  // Si la demande concerne une extension de volume/stockage (param ?offre=),
  // on laisse passer sans exiger l'option assistance : ce n'est pas du support
  // technique, c'est une demande commerciale ouverte à tous.
  const isOffreRequest = Boolean(offre && offreLabels[offre]);

  if (!admin?.supportIncluded && !isOffreRequest) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl gap-6">
          <header className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <QoravoLogo />
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Service client Qoravo
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              Option assistance requise
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              Le service client est reserve aux comptes qui ajoutent l&apos;option
              assistance annuelle a 29,99 EUR/an. Connectez-vous avec un compte
              qui possede cette option pour envoyer une demande.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/login"
                className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Connexion admin
              </Link>
              {admin ? (
                <SupportSubscribeButton className="inline-flex min-h-11 items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-5 py-3 text-sm font-semibold text-sky-900 transition hover:bg-sky-100" />
              ) : (
                <Link
                  href="/pro/inscription"
                  className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                >
                  Creer un compte avec assistance
                </Link>
              )}
            </div>
          </header>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8">
        <header className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <QoravoLogo />
            <Link
              href="/"
              className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
            >
              Retour accueil
            </Link>
          </div>
          <div className="grid max-w-3xl gap-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Service client Qoravo
            </p>
            {isOffreRequest ? (
              <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
                Demande d&apos;extension de volume
              </h1>
            ) : (
              <>
                <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
                  Support disponible 24h/24 pour envoyer une demande.
                </h1>
                <p className="text-sm leading-6 text-slate-600">
                  Vous pouvez contacter le service client a tout moment par
                  telephone ou envoyer une demande ecrite avec vos informations.
                </p>
                <a
                  href={supportPhoneHref}
                  className="w-fit rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Appeler le {supportPhoneDisplay}
                </a>
              </>
            )}
          </div>
        </header>

        {isOffreRequest ? (
          /* Parcours demande d'extension — pas besoin d'assistance */
          <section className="grid gap-4">
            <div className="grid gap-3 rounded-xl border border-sky-100 bg-sky-50/60 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-blue">
                Demande d&apos;extension
              </p>
              <h2 className="text-2xl font-bold text-slate-950">
                {offreLabels[offre!]}
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                Envoyez-nous votre demande ci-dessous. Nous activons votre
                extension sous 24h et vous envoyons la confirmation par email.
              </p>
            </div>
            <SupportForm
              offreId={offre!}
              prefillSubject={`Demande d'activation : ${offreLabels[offre!]}`}
              prefillMessage={`Bonjour,\n\nJe souhaite activer l'offre "${offreLabels[offre!]}" pour mon compte Qoravo.\n\nMon email admin : ${admin?.email ?? ""}\n\nMerci.`}
            />
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="grid content-start gap-4">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">
                  Ce que le support peut traiter
                </h2>
                <ul className="mt-4 grid gap-3">
                  {supportPoints.map((point) => (
                    <li
                      key={point}
                      className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">
                  Exemples de demandes
                </h2>
                <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-700">
                  {commonRequests.map((request) => (
                    <li key={request}>{request}</li>
                  ))}
                </ul>
              </div>
            </aside>

            <section className="grid gap-4">
              <div className="grid gap-2">
                <h2 className="text-2xl font-semibold text-slate-950">
                  Envoyer un message
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  Decrivez le probleme avec le plus de details possible : email du
                  compte, page concernee, message d erreur, et ce que vous etiez
                  en train de faire.
                </p>
              </div>
              <SupportForm />
            </section>
          </section>
        )}
      </div>
    </main>
  );
}
