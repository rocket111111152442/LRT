import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Créer un compte professionnel",
  robots: { index: false, follow: true },
};
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
          <span className="q-chip w-fit bg-brand-green-soft text-brand-green">
            Essai gratuit de 7 jours
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Créez votre atelier et testez Qoravo gratuitement
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Entrez seulement le nom de votre atelier, votre email et votre mot de
            passe. Après validation de l&apos;email, votre essai démarre immédiatement.
            Les informations publiques, le QR code et les horaires se configurent
            ensuite tranquillement depuis votre espace admin.
          </p>
          <div className="grid gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-900 sm:grid-cols-3">
            <p className="font-semibold">✓ 7 jours gratuits, sans carte</p>
            <p className="font-semibold">✓ Abonnement possible à tout moment</p>
            <p className="font-semibold">✓ Vous reprenez où vous en étiez</p>
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Essai sans carte bancaire ni engagement. Vous pouvez vous abonner à
            tout moment depuis votre espace admin.
          </p>
        </header>

        <ProSignupForm />
      </div>
    </main>
  );
}
