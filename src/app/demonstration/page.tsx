import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { ProductDemo } from "@/components/ProductDemo";
import { QoravoLogo } from "@/components/QoravoLogo";
import { DemoRequestForm } from "./DemoRequestForm";

export const metadata: Metadata = {
  title: "Démonstration du logiciel",
  description: "Explorez une démonstration de Qoravo avec un tableau de bord, une fiche de réparation, le stock, l'agenda et le suivi client.",
  alternates: { canonical: "/demonstration" },
};

export default function DemonstrationPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <QoravoLogo />
          <Link href="/pro/inscription" className="q-btn q-btn-primary text-sm">Essayer 7 jours <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </header>
      <section className="px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-sky-700">Démonstration libre</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">Voyez le produit avant de créer un compte.</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">Changez de vue pour examiner les principaux écrans. Les noms et chiffres sont des données de démonstration ; l&apos;interface représente le parcours Qoravo.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm font-semibold text-slate-700">
              <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600" /> Sans connexion</span>
              <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600" /> Sans carte bancaire</span>
              <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600" /> Données fictives clairement indiquées</span>
            </div>
          </div>
          <ProductDemo />
        </div>
      </section>
      <section className="border-t border-slate-200 bg-white px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.8fr]">
          <DemoRequestForm />
          <div className="grid content-center gap-4 rounded-lg bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-300">Test complet</p>
            <h2 className="text-3xl font-extrabold">7 jours pour l&apos;essayer dans votre atelier.</h2>
            <p className="text-sm leading-6 text-slate-300">Créez quelques réparations, testez le QR code et les emails, puis décidez. Aucun moyen de paiement n&apos;est demandé au démarrage.</p>
            <Link href="/pro/inscription" className="q-btn q-btn-primary mt-2 w-fit">Démarrer l&apos;essai gratuit <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
