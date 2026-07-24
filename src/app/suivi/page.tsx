import Link from "next/link";
import { TrackingClient } from "./TrackingClient";

export default function TrackingPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-xl gap-6">
        <Link
          href="/"
          className="text-sm font-semibold text-slate-950 underline-offset-4 hover:underline"
        >
          Retour a l&apos;accueil
        </Link>
        <header className="grid gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Suivi client
          </p>
          <h1 className="text-3xl font-semibold text-slate-950">
            Suivre une reparation
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Utilisez le lien sécurisé reçu par email ou entrez votre ticket et
            l&apos;adresse email utilisée pour la réparation.
          </p>
        </header>
        <TrackingClient />
      </div>
    </main>
  );
}
