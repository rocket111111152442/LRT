import Link from "next/link";
import {
  CalendarDays,
  MailCheck,
  PackageCheck,
  QrCode,
  ReceiptText,
  Wrench,
} from "lucide-react";
import { QoravoLogo } from "@/components/QoravoLogo";

const proCards = [
  {
    title: "QR code atelier",
    text: "Un lien public propre pour recevoir les demandes client.",
    icon: QrCode,
    tone: "text-sky-600 bg-sky-50 border-sky-100",
  },
  {
    title: "Suivi des reparations",
    text: "Statuts, notes internes, devis, photos, signatures et historique.",
    icon: Wrench,
    tone: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  {
    title: "Agenda atelier",
    text: "Visualisez les reparations par jour et gardez vos rendez-vous au clair.",
    icon: CalendarDays,
    tone: "text-amber-600 bg-amber-50 border-amber-100",
  },
  {
    title: "Emails automatiques",
    text: "Prevenez le client quand le statut change ou quand un devis attend sa reponse.",
    icon: MailCheck,
    tone: "text-cyan-600 bg-cyan-50 border-cyan-100",
  },
  {
    title: "Stock et pieces",
    text: "Suivez vos pieces, les alertes basses et le cout d'achat.",
    icon: PackageCheck,
    tone: "text-lime-600 bg-lime-50 border-lime-100",
  },
  {
    title: "Documents",
    text: "Recus, suivi client, avis apres recuperation et export CSV.",
    icon: ReceiptText,
    tone: "text-violet-600 bg-violet-50 border-violet-100",
  },
];

export default function ProLandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#020617_0%,#07111f_52%,#0f172a_100%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div className="grid gap-5">
            <QoravoLogo textClassName="text-white" />
            <div className="grid gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-300">
                Espace reparateur
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                Un admin clair pour ne plus perdre une seule fiche.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-200">
                Qoravo organise votre atelier : demandes client, devis, statuts,
                agenda, stock, emails et documents au meme endroit.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/pro/inscription"
                className="rounded-lg bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                Creer mon compte pro
              </Link>
              <Link
                href="/admin/login"
                className="rounded-lg border border-white/50 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Connexion admin
              </Link>
            </div>
          </div>
          <aside className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Inclus
            </p>
            <p className="mt-3 text-3xl font-semibold">Satisfait ou rembourse</p>
          </aside>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {proCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className={`rounded-2xl border p-5 shadow-sm ${card.tone}`}
              >
                <Icon aria-hidden="true" className="h-7 w-7" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {card.text}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
