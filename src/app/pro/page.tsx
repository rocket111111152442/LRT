import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Download,
  MailCheck,
  PackageCheck,
  QrCode,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Users,
  Wrench,
} from "lucide-react";
import { QoravoLogo } from "@/components/QoravoLogo";

export const metadata: Metadata = {
  title: "Logiciel de gestion pour atelier de réparation",
  description:
    "Qoravo est le logiciel tout-en-un des réparateurs (smartphone, PC, console) : QR code de suivi client, devis, statuts, agenda, stock, comptabilité et emails automatiques. Essai gratuit 72h, 89,99 €/an, sans engagement.",
  keywords: [
    "logiciel gestion atelier réparation",
    "logiciel réparateur smartphone",
    "suivi réparation smartphone logiciel",
    "logiciel réparation téléphone",
    "gestion atelier réparation informatique",
  ],
  alternates: { canonical: "/pro" },
};

const proCards = [
  {
    title: "QR code de suivi client",
    text: "Un lien et un QR code propres à votre atelier. Le client scanne, suit sa réparation en temps réel et reçoit ses notifications — sans appli à installer.",
    icon: QrCode,
    tone: "text-sky-600 bg-sky-50 border-sky-100",
  },
  {
    title: "Fiches de réparation complètes",
    text: "Statuts, notes internes, devis, photos avant/après, signatures de dépôt et de retrait, historique client et checklist atelier.",
    icon: Wrench,
    tone: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  {
    title: "Agenda & rendez-vous",
    text: "Visualisez les réparations par jour, gérez vos créneaux et évitez les doublons. Vos disponibilités s'affichent automatiquement pour vos clients.",
    icon: CalendarDays,
    tone: "text-amber-600 bg-amber-50 border-amber-100",
  },
  {
    title: "Emails automatiques",
    text: "Le client est prévenu à chaque étape : demande reçue, devis à valider, réparation prête. Modèles personnalisables avec vos couleurs.",
    icon: MailCheck,
    tone: "text-cyan-600 bg-cyan-50 border-cyan-100",
  },
  {
    title: "Stock, pièces & comptabilité",
    text: "Suivez vos pièces, les alertes de stock bas, le coût d'achat, vos ventes, dépenses, TVA et la paie. Tout est calculé automatiquement.",
    icon: PackageCheck,
    tone: "text-lime-600 bg-lime-50 border-lime-100",
  },
  {
    title: "Documents & export",
    text: "Reçus, factures, devis, étiquettes QR, avis clients après récupération et export CSV de toutes vos données quand vous voulez.",
    icon: ReceiptText,
    tone: "text-violet-600 bg-violet-50 border-violet-100",
  },
];

const painPoints = [
  {
    pain: "Des fiches sur papier, des post-it, un cahier…",
    fix: "Toutes vos réparations centralisées, cherchables en une seconde.",
  },
  {
    pain: "Des clients qui appellent « c'est prêt ? » toute la journée",
    fix: "Ils suivent l'avancement eux-mêmes via le QR code et reçoivent un email à chaque étape.",
  },
  {
    pain: "Des devis oubliés et des appareils qui traînent",
    fix: "Devis envoyés en un clic, relances automatiques, emplacement de rangement sur l'étiquette.",
  },
  {
    pain: "Aucune visibilité sur le chiffre, le stock, la marge",
    fix: "Stats, comptabilité et stock intégrés — vous pilotez votre atelier.",
  },
];

const steps = [
  { n: "1", title: "Créez votre compte", text: "Inscription en quelques minutes. Essai gratuit 72h, sans carte bancaire pour démarrer." },
  { n: "2", title: "Imprimez votre QR code", text: "Affichez-le au comptoir. Vos clients déposent et suivent leurs réparations en autonomie." },
  { n: "3", title: "Gérez tout depuis l'admin", text: "Fiches, devis, agenda, stock, compta, emails : votre atelier tourne au même endroit." },
];

const objections = [
  {
    q: "Et si j'arrête mon abonnement, je perds mes données ?",
    a: "Non. Vous pouvez exporter toutes vos données (réparations, clients, compta) en CSV à tout moment. Vos données vous appartiennent.",
  },
  {
    q: "Est-ce que ça marche si j'ai plusieurs techniciens ?",
    a: "Oui. Chaque fiche peut être assignée à un technicien, avec le temps passé et l'historique. Vous suivez l'activité de tout l'atelier.",
  },
  {
    q: "C'est compliqué à installer ?",
    a: "Non, tout est en ligne. Aucune installation, aucun serveur à gérer. Vous vous connectez depuis n'importe quel ordinateur ou tablette.",
  },
  {
    q: "Pourquoi Qoravo plutôt qu'un autre logiciel ?",
    a: "Un tarif unique et clair (89,99 €/an, tout inclus), le suivi client par QR code sans appli, un vrai tout-en-un (réparations + stock + compta + agenda), et vos données exportables librement. Vous testez gratuitement avant de vous engager.",
  },
];

export default function ProLandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,197,94,0.25),transparent_26rem),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.35),transparent_30rem),linear-gradient(135deg,#020617_0%,#07111f_52%,#0f172a_100%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div className="grid gap-5">
            <QoravoLogo textClassName="text-white" />
            <div className="grid gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-300">
                Le logiciel des réparateurs
              </p>
              <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
                Gérez tout votre atelier de réparation au même endroit.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-200">
                Smartphones, ordinateurs, consoles : Qoravo centralise vos demandes
                client, devis, statuts, agenda, stock, comptabilité et emails
                automatiques. Vos clients suivent leur réparation par QR code.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/pro/inscription"
                className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-300"
              >
                Démarrer l&apos;essai gratuit 72h
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/admin/login"
                className="rounded-lg border border-white/50 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Connexion admin
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              <li className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />Sans carte pour démarrer</li>
              <li className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />Sans engagement</li>
              <li className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />Données exportables</li>
            </ul>
          </div>
          <aside className="grid gap-4 rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Tarif tout compris
            </p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-extrabold">89,99 €</span>
              <span className="pb-1 text-sm text-slate-300">/ an</span>
            </div>
            <ul className="grid gap-2 text-sm text-slate-200">
              <li className="inline-flex items-center gap-2"><Smartphone className="h-4 w-4 text-sky-300" aria-hidden="true" />Toutes les fonctions incluses</li>
              <li className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-sky-300" aria-hidden="true" />Aucune fonctionnalité bloquée</li>
              <li className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-sky-300" aria-hidden="true" />Multi-techniciens</li>
            </ul>
            <Link
              href="/pro/inscription"
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
            >
              Créer mon compte
            </Link>
          </aside>
        </div>
      </section>

      {/* PAIN -> SOLUTION */}
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-950">
            Fini le papier, les post-it et les appels « c&apos;est prêt ? »
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {painPoints.map((item) => (
              <div key={item.pain} className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-400 line-through decoration-red-300">
                  {item.pain}
                </p>
                <p className="inline-flex items-start gap-2 text-sm font-semibold text-slate-900">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" aria-hidden="true" />
                  {item.fix}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-blue">
              Tout-en-un
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
              Un seul logiciel pour tout votre atelier.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {proCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className={`rounded-2xl border p-5 shadow-sm ${card.tone}`}>
                  <Icon aria-hidden="true" className="h-7 w-7" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{card.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-blue">
              Simple et rapide
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
              Opérationnel en quelques minutes.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-lg font-extrabold text-white">
                  {step.n}
                </span>
                <h3 className="text-lg font-semibold text-slate-950">{step.title}</h3>
                <p className="text-sm leading-6 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OBJECTIONS */}
      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-950">
            Vos questions avant de vous lancer
          </h2>
          <div className="mt-10 grid gap-4">
            {objections.map((item) => (
              <div key={item.q} className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="inline-flex items-start gap-2 font-semibold text-slate-950">
                  <Download className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" aria-hidden="true" />
                  {item.q}
                </p>
                <p className="text-sm leading-6 text-slate-700">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-slate-950 px-6 py-12 text-center text-white">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Testez Qoravo gratuitement pendant 72h.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-200">
            Sans carte bancaire pour démarrer, sans engagement. Vous reprenez où
            vous vous êtes arrêté si vous vous abonnez.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/pro/inscription"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-300"
            >
              Démarrer l&apos;essai gratuit
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
