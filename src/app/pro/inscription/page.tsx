import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Créer un compte professionnel",
  robots: { index: false, follow: true },
};
import Link from "next/link";
import { QoravoLogo } from "@/components/QoravoLogo";
import { ProSignupForm } from "./ProSignupForm";
import { PlanPickerBanner } from "./PlanPickerBanner";

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
            Essai gratuit 72h
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Créez votre atelier et testez Qoravo gratuitement
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Remplissez votre compte comme d&apos;habitude. En cliquant sur
            <strong> Continuer avec l&apos;essai gratuit 72h</strong>, votre essai
            démarre immédiatement : vous accédez à tout le panel admin gratuitement
            pendant 72h. À la fin, vous pourrez vous abonner quand vous voulez et
            reprendre exactement là où vous vous étiez arrêté — vos fiches et
            réglages sont conservés. Vous pouvez aussi vous abonner dès maintenant
            (89,99 €/an).
          </p>
          <div className="grid gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-900 sm:grid-cols-3">
            <p className="font-semibold">✓ 72h gratuites, sans carte</p>
            <p className="font-semibold">✓ Abonnement possible à tout moment</p>
            <p className="font-semibold">✓ Vous reprenez où vous en étiez</p>
          </div>
        </header>

        <PlanPickerBanner />

        <ProSignupForm />
      </div>
    </main>
  );
}
