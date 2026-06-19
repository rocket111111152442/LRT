import Link from "next/link";
import { QoravoLogo } from "@/components/QoravoLogo";
import { ProSignupForm } from "./ProSignupForm";

export default function ProSignupPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-3xl gap-6">
        <header className="grid gap-3">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
          >
            Retour
          </Link>
          <QoravoLogo />
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Compte pro
          </p>
          <h1 className="text-3xl font-semibold text-slate-950">
            Creer votre espace admin
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Le compte est active apres l&apos;abonnement annuel de 49,99 EUR. Chaque
            compte obtient son QR code public avec son identifiant. Un code est
            envoye par email pour valider l adresse avant le paiement.
          </p>
        </header>
        <ProSignupForm />
      </div>
    </main>
  );
}
