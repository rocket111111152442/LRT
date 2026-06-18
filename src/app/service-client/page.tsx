import Link from "next/link";
import { LrtLogo } from "@/components/LrtLogo";
import { SupportForm } from "./SupportForm";

const supportPoints = [
  "Demande envoyable 24h/24 depuis le site",
  "Aide pour la connexion, le paiement, Firebase et les emails",
  "Message transmis directement par email au support LRT",
];

const commonRequests = [
  "Je n arrive pas a recevoir le code de connexion",
  "Je veux configurer les emails PRET",
  "Je veux comprendre le QR code de mon atelier",
  "Je veux signaler un bug ou une erreur sur une fiche",
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8">
        <header className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <LrtLogo />
            <Link
              href="/"
              className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
            >
              Retour accueil
            </Link>
          </div>
          <div className="grid max-w-3xl gap-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Service client LRT
            </p>
            <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
              Support disponible 24h/24 pour envoyer une demande.
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              Vous pouvez contacter le service client a tout moment. La demande
              est transmise par email avec vos informations pour pouvoir vous
              repondre proprement.
            </p>
          </div>
        </header>

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
      </div>
    </main>
  );
}
