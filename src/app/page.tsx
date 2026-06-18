import Link from "next/link";
import { LrtLogo } from "@/components/LrtLogo";

const features = [
  "Formulaire client public avec QR code unique",
  "Tableau admin pour suivre toutes les reparations",
  "Email automatique quand l'appareil est pret",
  "Configuration email et Firebase par compte pro",
  "Recherche rapide par client, telephone, marque ou modele",
  "Statuts clairs pour garder l'atelier organise",
];

const workflow = [
  {
    title: "1. Le client scanne",
    text: "Il ouvre le formulaire depuis le QR code de votre atelier et decrit son appareil.",
  },
  {
    title: "2. Vous suivez",
    text: "Toutes les demandes arrivent dans l'admin avec recherche, filtres et fiche detaillee.",
  },
  {
    title: "3. Le client est prevenu",
    text: "Quand le statut passe a PRET, l'email de recuperation peut partir automatiquement.",
  },
];

const adminTools = [
  "Statuts PAS ENCORE, EN REPARATION, EN ATTENTE PIECE, PRET, RECUPERE, ANNULE",
  "Notes internes visibles seulement par l'atelier",
  "Archivage et suppression avec confirmation",
  "Configuration email directement dans l'admin",
  "QR code imprimable pour le comptoir",
  "Compte pro avec Firebase dedie",
];

const extraFeatures = [
  "Formulaire public pour les clients",
  "Creation manuelle depuis l'admin",
  "QR code unique par compte pro",
  "QR code pret a imprimer",
  "Liste complete des reparations",
  "Recherche par nom de client",
  "Recherche par telephone",
  "Recherche par email",
  "Recherche par marque ou modele",
  "Filtre par statut",
  "Fiche detaillee par reparation",
  "Modification rapide du statut",
  "Notes internes pour l'atelier",
  "Archivage des dossiers termines",
  "Suppression definitive avec confirmation",
  "Email automatique quand le statut passe a PRET",
  "Protection anti double envoi d'email",
  "Configuration SMTP depuis l'admin",
  "Informations du magasin dans les emails",
  "Guide de premiere connexion",
];

const faqs = [
  {
    question: "Est-ce que le client a besoin d'un compte ?",
    answer: "Non. Le client remplit simplement le formulaire public depuis le QR code.",
  },
  {
    question: "Est-ce que chaque atelier a son QR code ?",
    answer: "Oui. Chaque compte pro obtient un lien unique avec son identifiant.",
  },
  {
    question: "A quoi sert Firebase ?",
    answer: "Firebase permet de connecter le compte pro a son propre projet et de preparer une base separee par client.",
  },
  {
    question: "Le paiement est-il obligatoire ?",
    answer: "Le paiement unique de 4,99 EUR limite les abus. Un code promo peut activer un compte gratuitement.",
  },
];

export default function HomePage() {
  return (
    <main className="bg-white text-slate-950">
      <section
        className="relative min-h-[92vh] overflow-hidden bg-cover bg-center px-4 py-8 text-white sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(7,12,24,0.88), rgba(7,12,24,0.58), rgba(7,12,24,0.22)), url('https://source.unsplash.com/1800x1200/?phone-repair,workshop')",
        }}
      >
        <div className="mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center gap-8">
          <div className="max-w-2xl">
            <LrtLogo
              className="mb-5"
              markClassName="ring-1 ring-white/20"
              textClassName="text-white"
            />
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              LRT, le logiciel simple pour les reparateurs d&apos;appareils
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-100 sm:text-lg">
              Donnez un QR code a vos clients, centralisez les demandes,
              suivez les statuts et prevenez automatiquement le client quand
              son appareil est pret.
            </p>
            <dl className="mt-6 grid max-w-xl grid-cols-3 gap-3 text-sm">
              <div className="border-l border-white/40 pl-3">
                <dt className="text-2xl font-semibold">4,99 EUR</dt>
                <dd className="text-slate-200">compte pro</dd>
              </div>
              <div className="border-l border-white/40 pl-3">
                <dt className="text-2xl font-semibold">1 QR</dt>
                <dd className="text-slate-200">par atelier</dd>
              </div>
              <div className="border-l border-white/40 pl-3">
                <dt className="text-2xl font-semibold">0 papier</dt>
                <dd className="text-slate-200">a trier</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/pro/inscription"
                className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Creer mon compte pro - 4,99 EUR
              </Link>
              <Link
                href="/admin/login"
                className="rounded-md border border-white/60 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Connexion admin
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3">
          {workflow.map((item) => (
            <article key={item.title} className="grid gap-2">
              <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
              <p className="text-sm leading-6 text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid content-start gap-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Pourquoi l&apos;utiliser
            </p>
            <h2 className="text-3xl font-semibold text-slate-950">
              Moins d&apos;appels, moins d&apos;oublis, plus de reparations suivies.
            </h2>
            <p className="text-base leading-7 text-slate-600">
              LRT remplace les notes papier et les messages eparpilles
              par un parcours clair : le client remplit sa demande, l&apos;atelier
              suit l&apos;avancement, puis l&apos;email de recuperation part au bon moment.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-800"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="grid content-start gap-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Dans l&apos;admin
            </p>
            <h2 className="text-3xl font-semibold text-slate-950">
              Tout ce qu&apos;un atelier attend au quotidien.
            </h2>
            <p className="text-base leading-7 text-slate-600">
              L&apos;interface est pensee pour aller vite au comptoir : retrouver
              une reparation, changer un statut, ajouter une note, puis prevenir
              le client quand l&apos;appareil est pret.
            </p>
          </div>
          <ul className="grid gap-3">
            {adminTools.map((tool) => (
              <li
                key={tool}
                className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
              >
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Fonctionnalites
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              20 outils concrets pour gerer un atelier sans usine a gaz.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Chaque element sert au travail quotidien : recevoir une demande,
              retrouver une fiche, suivre l&apos;avancement et prevenir le client au
              bon moment.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {extraFeatures.map((feature, index) => (
              <article
                key={feature}
                className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-sm font-semibold leading-5 text-slate-950">
                  {feature}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Pour qui
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Reparateurs mobiles, consoles, ordinateurs et petits ateliers.
            </h2>
          </div>
          <div className="grid gap-4 text-sm leading-6 text-slate-700 sm:grid-cols-2">
            <p>
              Utile si vous recevez des appareils au comptoir et que vous voulez
              eviter les informations perdues entre carnet, SMS et appels.
            </p>
            <p>
              Utile aussi si vous voulez professionnaliser la reception client :
              un lien clair, un QR imprimable et un suivi simple par statut.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Compte pro a 4,99 EUR</h2>
            <p className="mt-2 text-sm text-slate-300">
              Paiement unique pour activer l&apos;espace admin et limiter les abus de
              comptes.
            </p>
          </div>
          <Link
            href="/pro/inscription"
            className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Commencer
          </Link>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Questions
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Les points importants avant de commencer.
            </h2>
          </div>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <article key={faq.question} className="border-b border-slate-200 pb-4">
                <h3 className="font-semibold text-slate-950">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
