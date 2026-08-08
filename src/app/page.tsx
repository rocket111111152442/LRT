import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  Clock,
  FileText,
  Mail,
  MapPinned,
  Package,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wrench,
} from "lucide-react";
import { QoravoLogo } from "@/components/QoravoLogo";
import { ProductDemo } from "@/components/ProductDemo";
import { ConversionLink } from "@/components/ConversionLink";
import { seoResourceLinks } from "@/lib/seoResources";
import { PublicReviews } from "./PublicReviews";
import { TrialOfferCountdown } from "@/components/TrialOfferCountdown";
import { GoogleReviews } from "@/components/GoogleReviews";

export const metadata: Metadata = {
  title: { absolute: "Qoravo — Logiciel de gestion pour réparateurs" },
  description:
    "Qoravo aide les réparateurs de téléphone, PC, console et électronique à gérer réparations, clients, devis, stock, agenda, comptabilité et emails automatiques.",
  alternates: { canonical: "/" },
};

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1581993192008-63e896f4f744?auto=format&fit=crop&w=1200&q=80";
const WORKSHOP_IMAGE =
  "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1100&q=80";
const COUNTER_IMAGE =
  "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1100&q=80";

const stats = [
  { value: "7 jours", label: "d'essai gratuit" },
  { value: "89,99 €", label: "par an, tout compris" },
  { value: "Sans carte", label: "pour commencer" },
  { value: "1 QR", label: "pour le comptoir" },
];

const features = [
  {
    icon: QrCode,
    title: "QR code unique",
    text: "Chaque atelier reçoit son QR code à poser au comptoir. Le client scanne et remplit sa demande en 30 secondes.",
  },
  {
    icon: Wrench,
    title: "Suivi de réparation",
    text: "Statuts clairs, fiche détaillée, notes internes, photos et historique : tout l'atelier est rangé au même endroit.",
  },
  {
    icon: Mail,
    title: "Emails automatiques",
    text: "Le client est prévenu automatiquement quand son appareil est prêt, avec rappels et demande d'avis Google.",
  },
  {
    icon: FileText,
    title: "Devis, factures & reçus",
    text: "Envoyez un devis accepté en un clic, imprimez factures et reçus, gérez acompte et reste à payer.",
  },
  {
    icon: Calculator,
    title: "Compta intégrée",
    text: "Ventes, dépenses, TVA, salaires et estimations d'impôts. Un export CSV prêt pour votre comptable.",
  },
  {
    icon: Package,
    title: "Stock & agenda",
    text: "Gérez vos pièces avec alertes de stock bas et organisez vos réparations dans un agenda jour/semaine.",
  },
  {
    icon: MapPinned,
    title: "Vitrine publique",
    text: "Votre magasin est référencé sur Qoravo : les clients proches vous trouvent par horaires et disponibilité.",
  },
  {
    icon: ShieldCheck,
    title: "Sécurité & garantie",
    text: "Validation par code email, signatures client au dépôt et à la récupération, suivi des garanties et retours.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Le client scanne",
    text: "Il ouvre le formulaire depuis votre QR code et décrit son appareil. Aucun compte requis.",
  },
  {
    step: "02",
    title: "Vous gérez",
    text: "La demande arrive dans votre admin : recherche, filtres, devis, statut, photos et notes.",
  },
  {
    step: "03",
    title: "Le client est prévenu",
    text: "Dès que l'appareil est prêt, l'email part tout seul et le client sait quand revenir.",
  },
];

const includedInPlan = [
  "Espace admin complet pour gérer l'atelier",
  "QR code comptoir imprimable",
  "Référencement de votre magasin sur Qoravo",
  "Emails automatiques, tickets de suivi, devis et avis",
  "Compta, stock, agenda et statistiques",
  "Mises à jour et nouvelles fonctionnalités chaque mois",
];

const faqs = [
  {
    question: "Comment fonctionne l'essai gratuit ?",
    answer:
      "Vous disposez de 7 jours gratuits avec toutes les fonctionnalités, sans carte bancaire ni engagement. Vous démarrez l'essai quand vous le souhaitez, et vous pouvez vous abonner à tout moment.",
  },
  {
    question: "Le client a-t-il besoin d'un compte ?",
    answer:
      "Non. Le client remplit simplement le formulaire public depuis votre QR code, puis suit sa réparation avec un numéro de ticket.",
  },
  {
    question: "Que comprend l'abonnement ?",
    answer:
      "89,99 €/an pour l'espace admin complet de votre atelier. L'assistance prioritaire Qoravo est disponible en option à 29,99 €/an, à activer quand vous le souhaitez.",
  },
  {
    question: "Mon magasin sera-t-il visible par les clients ?",
    answer:
      "Oui, lorsque vous le décidez. Après l'inscription, vous renseignez adresse, téléphone, email et horaires dans les paramètres, puis vous activez la visibilité publique.",
  },
];

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.qoravo.fr/#organization",
        name: "Qoravo",
        url: "https://www.qoravo.fr",
        logo: "https://www.qoravo.fr/qoravo-logo.svg",
        email: "lrt.service.client@gmail.com",
      },
      {
        "@type": "WebSite",
        "@id": "https://www.qoravo.fr/#website",
        url: "https://www.qoravo.fr",
        name: "Qoravo",
        publisher: { "@id": "https://www.qoravo.fr/#organization" },
        inLanguage: "fr-FR",
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://www.qoravo.fr/#software",
        name: "Qoravo",
        url: "https://www.qoravo.fr/pro",
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Logiciel de gestion d'atelier de réparation",
        operatingSystem: "Web",
        description:
          "Logiciel de gestion pour réparateurs de téléphone, informatique, console et électronique avec suivi client, devis, stock, agenda et comptabilité.",
        offers: {
          "@type": "Offer",
          price: "89.99",
          priceCurrency: "EUR",
          url: "https://www.qoravo.fr/pro/inscription",
        },
        publisher: { "@id": "https://www.qoravo.fr/#organization" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <main className="bg-slate-50 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <TrialOfferCountdown />
      {/* Barre de navigation */}
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/55 backdrop-blur-xl [-webkit-backdrop-filter:blur(20px)_saturate(180%)] [backdrop-filter:blur(20px)_saturate(180%)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <QoravoLogo />
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a href="#fonctionnalites" className="transition hover:text-slate-950">
              Fonctionnalités
            </a>
            <a href="#etapes" className="transition hover:text-slate-950">
              Comment ça marche
            </a>
            <a href="#tarif" className="transition hover:text-slate-950">
              Tarif
            </a>
            <Link href="/demonstration" className="transition hover:text-slate-950">
              Démonstration
            </Link>
            <a href="#faq" className="transition hover:text-slate-950">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950 sm:inline-flex"
            >
              Connexion
            </Link>
            <ConversionLink href="/pro/inscription" eventName="signup_cta_clicked" location="header" className="q-btn q-btn-primary text-sm">
              Essai gratuit
            </ConversionLink>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-brand-ink px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(34,197,94,0.30),transparent_26rem),radial-gradient(circle_at_85%_12%,rgba(14,165,233,0.40),transparent_30rem),linear-gradient(135deg,#020617_0%,#07111f_55%,#0f172a_100%)]" />
        <div className="absolute right-[-9rem] top-20 h-80 w-80 rounded-full border border-sky-400/15" />
        <div className="absolute bottom-[-11rem] left-[-9rem] h-96 w-96 rounded-full border border-emerald-400/15" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="q-animate-up max-w-xl">
            <span className="q-chip border border-white/15 bg-white/10 text-sky-200">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              7 jours gratuits · sans carte bancaire
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.07] tracking-tight sm:text-5xl lg:text-6xl">
              Qoravo, le logiciel tout-en-un des{" "}
              <span className="q-gradient-text">réparateurs</span>.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-200 sm:text-lg">
              Centralisez les dossiers, prévenez les clients et retrouvez chaque
              réparation sans chercher dans des cahiers ou des messages dispersés.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ConversionLink href="/pro/inscription" eventName="signup_cta_clicked" location="hero" className="q-btn q-btn-primary">
                Démarrer l&apos;essai gratuit
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ConversionLink>
              <ConversionLink href="/demonstration" eventName="demo_opened" location="hero" className="q-btn q-btn-ghost">
                Explorer la démonstration
              </ConversionLink>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-300">
              <BadgeCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              Sans engagement · Reprenez où vous vous étiez arrêté après l&apos;essai
            </p>
            <dl className="mt-10 grid max-w-lg grid-cols-2 gap-5 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="border-l border-white/20 pl-3">
                  <dt className="text-2xl font-extrabold">{stat.value}</dt>
                  <dd className="text-xs leading-4 text-slate-300">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="q-animate-up relative">
            <div className="q-animate-float overflow-hidden rounded-[1.6rem] border border-white/10 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_IMAGE}
                alt="Technicien réparant un smartphone dans son atelier"
                className="h-[26rem] w-full object-cover"
              />
            </div>
            <div className="absolute -right-3 top-6 hidden rounded-2xl border border-white/15 bg-brand-ink/90 p-4 text-white shadow-xl sm:block">
              <Smartphone className="h-5 w-5 text-sky-300" aria-hidden="true" />
              <p className="mt-2 text-sm font-bold">Appareil prêt</p>
              <p className="text-xs text-slate-300">Email envoyé automatiquement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bandeau confiance */}
      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-semibold text-slate-500">
          <span className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-brand-blue" aria-hidden="true" /> Réparateurs mobiles
          </span>
          <span className="flex items-center gap-2">
            <Package className="h-4 w-4 text-brand-green" aria-hidden="true" /> Consoles & ordinateurs
          </span>
          <span className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-amber-500" aria-hidden="true" /> Petits ateliers
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand-blue" aria-hidden="true" /> Données séparées par compte
          </span>
        </div>
      </section>

      {/* DÉMONSTRATION PRODUIT */}
      <section className="border-b border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-10">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-wide text-brand-blue">
                Une preuve avant une promesse
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Regardez comment Qoravo s&apos;utilise réellement.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Passez du tableau de bord à une fiche, au stock, à l&apos;agenda et
                au suivi client. Les exemples sont clairement identifiés comme
                données de démonstration.
              </p>
            </div>
            <ConversionLink href="/demonstration" eventName="demo_opened" location="product_preview" className="q-btn q-btn-dark w-fit">
              Ouvrir la démonstration complète
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ConversionLink>
          </div>
          <ProductDemo compact />
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="fonctionnalites" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-blue">
              Tout votre atelier, un seul outil
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Moins d&apos;appels, moins d&apos;oublis, plus de réparations suivies.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Qoravo remplace les notes papier et les messages éparpillés par un
              parcours clair, du comptoir jusqu&apos;à la récupération de l&apos;appareil.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article key={feature.title} className="q-glass p-6 transition hover:-translate-y-1">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 text-brand-ink">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {feature.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ÉTAPES */}
      <section id="etapes" className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={WORKSHOP_IMAGE}
              alt="Atelier de réparation organisé"
              className="h-[28rem] w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand-green">
              Comment ça marche
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Lancé en 3 étapes, dès aujourd&apos;hui.
            </h2>
            <div className="mt-8 grid gap-5">
              {workflow.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-ink text-sm font-extrabold text-white">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/pro/inscription" className="q-btn q-btn-primary mt-8">
              Créer mon atelier
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* TARIF + ESSAI */}
      <section id="tarif" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand-blue">
              Un tarif simple et clair
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Tout l&apos;atelier pour 89,99 €/an.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Un seul abonnement, aucune fonctionnalité bloquée. Commencez par
              7 jours d&apos;essai gratuit, puis abonnez-vous quand vous êtes prêt.
            </p>
            <ul className="mt-8 grid gap-3">
              {includedInPlan.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="q-glass overflow-hidden">
            <div className="bg-brand-ink p-7 text-white">
              <span className="q-chip border border-white/15 bg-white/10 text-emerald-200">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Essai gratuit de 7 jours
              </span>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-5xl font-extrabold">89,99 €</span>
                <span className="pb-1 text-sm text-slate-300">/ an</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Espace admin complet · QR code · vitrine publique
              </p>
              <ConversionLink href="/pro/inscription" eventName="signup_cta_clicked" location="pricing" className="q-btn q-btn-light mt-6 w-full">
                Démarrer gratuitement
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ConversionLink>
              <p className="mt-3 text-center text-xs text-slate-400">
                Sans carte requise pour démarrer l&apos;essai
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 p-5">
              <div>
                <p className="text-sm font-bold text-slate-950">Assistance prioritaire</p>
                <p className="text-xs text-slate-500">Aide au paramétrage & service client</p>
              </div>
              <span className="text-lg font-extrabold text-brand-blue">+29,99 €/an</span>
            </div>
          </div>
        </div>
      </section>

      {/* DEUX ESPACES */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <article className="q-glass relative overflow-hidden p-7">
            <p className="q-chip bg-brand-blue-soft text-brand-blue">Pour les réparateurs</p>
            <h3 className="mt-4 text-2xl font-extrabold text-slate-950">
              Gérez votre atelier de A à Z.
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              QR code, fiches client, devis, stock, agenda, compta et documents :
              tout est rangé pour travailler vite au comptoir.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/pro/inscription" className="q-btn q-btn-primary text-sm">
                Créer un compte pro
              </Link>
              <Link
                href="/admin/login"
                className="q-btn text-sm text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50"
              >
                Connexion admin
              </Link>
            </div>
          </article>

          <article className="q-glass relative overflow-hidden p-7">
            <p className="q-chip bg-brand-green-soft text-brand-green">Pour les clients</p>
            <h3 className="mt-4 text-2xl font-extrabold text-slate-950">
              Trouvez un magasin et suivez votre réparation.
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              La recherche affiche les ateliers ouverts et disponibles près de
              chez vous, et vous suivez l&apos;avancement avec un numéro de ticket.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/client/magasins"
                className="q-btn text-sm text-white"
                style={{ backgroundColor: "#22c55e" }}
              >
                Trouver un magasin
              </Link>
              <Link
                href="/suivi"
                className="q-btn text-sm text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50"
              >
                Suivre une réparation
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* AVIS RÉELS UNIQUEMENT */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Avis Google en direct (s'affiche une fois la clé API + Place ID configurés) */}
          <div className="mb-8">
            <GoogleReviews />
          </div>
          <PublicReviews displayOnly />
        </div>
      </section>

      {/* GUIDES SEO */}
      <section id="guides-reparateurs" className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-blue">
              Guides pratiques
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Mieux organiser un atelier de réparation.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Des méthodes concrètes pour structurer les dossiers, informer les clients,
              suivre les pièces et remplacer progressivement les outils dispersés.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {seoResourceLinks.map((resource) => (
              <Link
                key={resource.href}
                href={resource.href}
                className="group rounded-lg border border-slate-200 bg-slate-50 p-5 transition hover:border-sky-300 hover:bg-sky-50"
              >
                <FileText className="h-6 w-6 text-brand-blue" aria-hidden="true" />
                <h3 className="mt-4 font-bold text-slate-950 group-hover:text-brand-blue">
                  {resource.label}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                  {resource.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-blue">
                  Lire le guide
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand-blue">
              Questions fréquentes
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Les points importants avant de commencer.
            </h2>
            <div className="mt-6 overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={COUNTER_IMAGE}
                alt="Commerçant satisfait dans sa boutique"
                className="h-56 w-full rounded-2xl object-cover"
              />
            </div>
          </div>
          <div className="grid gap-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group q-glass p-5 transition hover:-translate-y-0.5"
              >
                <summary className="cursor-pointer list-none text-base font-bold text-slate-950 marker:hidden">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] bg-brand-ink px-6 py-14 text-center text-white sm:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.28),transparent_22rem),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.34),transparent_24rem)]" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Prêt à professionnaliser votre atelier ?
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-200">
              Lancez votre essai gratuit de 7 jours avec seulement trois
              informations. Aucun engagement, aucune carte bancaire.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ConversionLink href="/pro/inscription" eventName="signup_cta_clicked" location="final_cta" className="q-btn q-btn-primary">
                Démarrer l&apos;essai gratuit
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ConversionLink>
              <Link href="/pro" className="q-btn q-btn-ghost">
                Découvrir l&apos;espace pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-sm">
            <QoravoLogo />
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Le logiciel propre et complet pour gérer un atelier de réparation
              sans usine à gaz.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-600">
            <Link href="/pro" className="hover:text-slate-950">
              Professionnels
            </Link>
            <Link href="/client" className="hover:text-slate-950">
              Clients
            </Link>
            <Link href="/client/magasins" className="hover:text-slate-950">
              Trouver un magasin
            </Link>
            <Link href="/suivi" className="hover:text-slate-950">
              Suivre une réparation
            </Link>
            <Link href="/conditions-utilisation" className="hover:text-slate-950">
              Conditions
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-6xl text-xs text-slate-400">
          © {new Date().getFullYear()} Qoravo. Tous droits réservés.
        </p>
      </footer>
    </main>
  );
}
