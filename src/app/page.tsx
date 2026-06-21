import Link from "next/link";
import { QoravoLogo } from "@/components/QoravoLogo";
import { PublicReviews } from "./PublicReviews";
import { TrialCountdown } from "./TrialCountdown";

const features = [
  "Formulaire client public avec QR code unique",
  "Suivi client avec ticket court",
  "Tableau admin pour suivre toutes les reparations",
  "Email automatique a chaque changement de statut",
  "Configuration email par compte pro",
  "Recherche rapide par client, telephone, marque ou modele",
  "Statuts clairs pour garder l'atelier organise",
  "Validation par code email a l'inscription et a chaque connexion",
  "Option assistance annuelle avec service client Qoravo",
  "Recherche publique du magasin le plus proche",
  "Devis avec acceptation ou refus par le client",
  "Stock simple avec alertes de pieces faibles",
  "Agenda jour/semaine pour les reparations",
  "Paiement, acompte et reste a payer",
  "Facture et recu imprimables en PDF navigateur",
  "Garantie et retours sous garantie",
  "Page vitrine publique par atelier",
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
    text: "Quand le statut change, le client peut recevoir un email automatique.",
  },
];

const adminTools = [
  "Statuts PAS ENCORE, EN REPARATION, EN ATTENTE PIECE, PRET, RECUPERE, ANNULE",
  "Notes internes visibles seulement par l'atelier",
  "Archivage et suppression avec confirmation",
  "Configuration email directement dans l'admin",
  "QR code imprimable pour le comptoir",
  "Donnees separees par compte pro",
];

const priceDetails = [
  "89,99 EUR/an pour l'espace admin Qoravo de l'atelier",
  "Un QR code comptoir imprimable pour recevoir les demandes directement en magasin",
  "Votre magasin est reference sur Qoravo pour attirer de nouveaux clients autour de vous",
  "Recherche publique par disponibilite, horaires et proximite du magasin",
  "Emails automatiques de statut, tickets de suivi, devis et avis client",
  "Essai gratuit de 72h avant de vous engager",
  "Option service client a 29,99 EUR/an disponible a tout moment si vous voulez l'aide Qoravo",
];

const extraFeatures = [
  "Formulaire public pour les clients",
  "Creation manuelle depuis l'admin",
  "QR code unique par compte pro",
  "QR code pret a imprimer",
  "Numero de ticket court",
  "Page de suivi client",
  "Liste complete des reparations",
  "Recherche par nom de client",
  "Recherche par telephone",
  "Recherche par email",
  "Recherche par marque ou modele",
  "Filtre par statut",
  "Fiche detaillee par reparation",
  "Modification rapide du statut",
  "Devis avant reparation",
  "Validation du devis par bouton client",
  "Notes internes pour l'atelier",
  "Photos de l'appareil",
  "Signature client au depot",
  "Signature client a la recuperation",
  "Recu imprimable",
  "Historique complet des actions",
  "Archivage des dossiers termines",
  "Suppression definitive avec confirmation",
  "Email automatique quand le statut change",
  "Notifications gratuites par email",
  "Relance automatique apres 7 jours pret",
  "Demande d'avis Google apres recuperation",
  "Export CSV",
  "Tableau de bord avec chiffres",
  "Statistiques par marque",
  "Gestion des pieces",
  "Stock simple de pieces",
  "Alertes stock bas",
  "Agenda des reparations",
  "Priorite urgente",
  "Paiement client enregistre",
  "Acompte et reste a payer",
  "Facture imprimable",
  "Garantie automatique",
  "Retours sous garantie",
  "Mode reparation express",
  "Modeles de pannes",
  "Modeles de messages email",
  "Page vitrine atelier",
  "Badge client VIP ou PRO",
  "Objectif mensuel",
  "Top pannes frequentes",
  "Historique client",
  "Gestion des techniciens",
  "Checklist atelier",
  "Pieces sorties du stock",
  "Commandes fournisseurs",
  "Temps passe par reparation",
  "Archivage intelligent",
  "Documents client imprimables",
  "QR code sur recu",
  "Signature client publique",
  "Protection anti double envoi d'email",
  "Configuration SMTP depuis l'admin",
  "Informations du magasin dans les emails",
  "Guide de premiere connexion",
  "Nouvelles fonctionnalites ajoutees tous les mois",
];

const extraFeatureCount = extraFeatures.length;

const featureGroups = [
  {
    title: "Accueil client",
    items: extraFeatures.slice(0, 15),
  },
  {
    title: "Suivi atelier",
    items: extraFeatures.slice(15, 30),
  },
  {
    title: "Gestion et chiffres",
    items: extraFeatures.slice(30, 45),
  },
  {
    title: "Organisation quotidienne",
    items: extraFeatures.slice(45),
  },
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
    question: "Est-ce que ma boutique peut etre visible aux clients ?",
    answer: "Oui. Vous renseignez l'adresse, le telephone, l'email et les horaires dans les parametres de votre compte pro.",
  },
  {
    question: "Le paiement est-il obligatoire ?",
    answer: "L'abonnement annuel limite les abus. Un code promo peut activer un compte gratuitement.",
  },
];

export default function HomePage() {
  return (
    <main className="bg-slate-50 text-slate-950">
      <TrialCountdown />
      <section
        className="relative min-h-[92vh] overflow-hidden bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,197,94,0.30),transparent_24rem),radial-gradient(circle_at_82%_18%,rgba(14,165,233,0.36),transparent_28rem),linear-gradient(135deg,#020617_0%,#07111f_52%,#0f172a_100%)]" />
        <div className="absolute right-[-8rem] top-24 h-80 w-80 rounded-full border border-sky-400/20" />
        <div className="absolute bottom-[-10rem] left-[-8rem] h-96 w-96 rounded-full border border-emerald-400/20" />
        <div className="mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center gap-8">
          <div className="relative max-w-3xl">
            <QoravoLogo
              className="mb-5"
              markClassName="ring-1 ring-white/20"
              textClassName="text-white"
            />
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Qoravo, le logiciel propre et complet pour les reparateurs
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-100 sm:text-lg">
              Donnez un QR code a vos clients, centralisez les demandes,
              suivez les statuts et prevenez automatiquement le client quand
              son appareil est pret.
            </p>
            <dl className="mt-6 grid max-w-xl grid-cols-3 gap-3 text-sm">
              <div className="border-l border-white/40 pl-3">
                <dt className="text-2xl font-semibold">89,99 EUR</dt>
                <dd className="text-slate-200">par an</dd>
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
                href="#espaces"
                className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Choisir mon espace
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
              Prix clair
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Ce que l&apos;abonnement apporte a votre magasin.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              L&apos;objectif est simple : moins de papier, plus de suivi, et une
              presence visible sur Qoravo pour recevoir de nouvelles demandes.
            </p>
          </div>
          <ul className="grid gap-3">
            {priceDetails.map((detail) => (
              <li
                key={detail}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800"
              >
                {detail}
              </li>
            ))}
          </ul>
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

      <section id="espaces" className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8">
          <header className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Deux espaces separes
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Un parcours pour les reparateurs, un parcours pour les clients.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              L&apos;accueil ne liste pas les magasins et ne melange pas la
              creation d&apos;un compte pro avec la recherche client. Chaque
              personne choisit son espace puis continue sur une page dediee.
            </p>
          </header>

          <div className="grid gap-5">
            <article className="grid gap-5 rounded-2xl border border-sky-100 bg-white p-6 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                  Pour les reparateurs
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">
                  Creez votre compte atelier et gerez vos reparations.
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  QR code, fiches client, devis, stock, agenda, emails de statut
                  et documents : tout est range pour travailler vite au comptoir.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link
                  href="/pro"
                  className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  Voir l&apos;espace pro
                </Link>
                <Link
                  href="/pro/inscription"
                  className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-900 transition hover:bg-sky-100"
                >
                  Creer un compte pro
                </Link>
                <Link
                  href="/admin/login"
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Connexion admin
                </Link>
              </div>
            </article>

            <article className="grid gap-5 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Pour les clients
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">
                  Trouvez un magasin ouvert et suivez votre reparation.
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  La recherche magasin est sur une page dediee. Elle affiche les
                  ateliers ouverts et disponibles au moment de la recherche.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link
                  href="/client"
                  className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Voir l&apos;espace client
                </Link>
                <Link
                  href="/client/magasins"
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
                >
                  Trouver un magasin
                </Link>
                <Link
                  href="/suivi"
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Suivre une reparation
                </Link>
              </div>
            </article>
          </div>
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
              Qoravo remplace les notes papier et les messages eparpilles
              par un parcours clair : le client remplit sa demande, l&apos;atelier
              suit l&apos;avancement, puis l&apos;email de recuperation part au bon moment.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature}
                className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 shadow-sm"
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
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm"
              >
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Fonctionnalites
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Plus de {extraFeatureCount} outils concrets pour gerer un atelier sans usine a gaz.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Chaque element sert au travail quotidien : recevoir une demande,
              retrouver une fiche, suivre l&apos;avancement et prevenir le client au
              bon moment.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {featureGroups.map((group, groupIndex) => (
              <article
                key={group.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-slate-950">
                  {group.title}
                </h3>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {group.items.map((feature, itemIndex) => {
                    const number = groupIndex * 15 + itemIndex + 1;

                    return (
                      <li
                        key={feature}
                        className="flex gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-5 text-slate-700"
                      >
                        <span className="font-semibold text-sky-700">
                          {String(number).padStart(2, "0")}
                        </span>
                        <span>{feature}</span>
                      </li>
                    );
                  })}
                </ul>
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

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <PublicReviews />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Compte pro Qoravo</h2>
            <p className="mt-2 text-sm text-slate-300">
              Abonnement annuel pour activer l&apos;espace admin et limiter les abus.
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

      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <QoravoLogo />
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
            <Link href="/pro" className="hover:text-slate-950">
              Professionnels
            </Link>
            <Link href="/client" className="hover:text-slate-950">
              Clients
            </Link>
            <Link href="/conditions-utilisation" className="hover:text-slate-950">
              Conditions
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
