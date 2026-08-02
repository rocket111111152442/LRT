import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
} from "lucide-react";
import { QoravoLogo } from "@/components/QoravoLogo";
import type { SeoResource } from "@/lib/seoResources";
import { seoResourceLinks } from "@/lib/seoResources";

type SeoResourcePageProps = {
  resource: SeoResource;
};

export function SeoResourcePage({ resource }: SeoResourcePageProps) {
  const pageUrl = `https://www.qoravo.fr/${resource.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: resource.title,
        description: resource.description,
        image: resource.image,
        mainEntityOfPage: pageUrl,
        author: { "@type": "Organization", name: "Qoravo" },
        publisher: {
          "@type": "Organization",
          name: "Qoravo",
          logo: {
            "@type": "ImageObject",
            url: "https://www.qoravo.fr/qoravo-logo.svg",
          },
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: resource.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Accueil",
            item: "https://www.qoravo.fr",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guides pour réparateurs",
            item: "https://www.qoravo.fr/#guides-reparateurs",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: resource.navLabel,
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <QoravoLogo />
          <nav className="flex items-center gap-2 text-sm font-semibold" aria-label="Navigation principale">
            <Link href="/pro" className="hidden px-3 py-2 text-slate-600 hover:text-slate-950 sm:block">
              Découvrir Qoravo
            </Link>
            <Link href="/admin/login" className="px-3 py-2 text-slate-600 hover:text-slate-950">
              Connexion
            </Link>
            <Link
              href="/pro/inscription"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-white hover:bg-sky-600"
            >
              Essai gratuit
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative isolate min-h-[480px] overflow-hidden bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resource.image}
          alt={resource.imageAlt}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-slate-950/85" />
        <div className="mx-auto max-w-6xl">
          <nav className="mb-10 flex flex-wrap items-center gap-1 text-sm text-slate-300" aria-label="Fil d'Ariane">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span>Guides pour réparateurs</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span className="text-white">{resource.navLabel}</span>
          </nav>
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-wide text-sky-300">{resource.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              {resource.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">{resource.lead}</p>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-200">
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                Guide pratique
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                Lecture : 6 minutes
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_320px]">
          <article className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-blue">Comprendre le besoin</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{resource.problemTitle}</h2>
            <div className="mt-6 grid gap-5 text-base leading-8 text-slate-700">
              {resource.problemParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </article>
          <aside className="border-l-4 border-brand-green bg-white p-6 shadow-sm">
            <ClipboardCheck className="h-7 w-7 text-brand-green" aria-hidden="true" />
            <p className="mt-4 text-lg font-bold">À retenir</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Un bon outil ne remplace pas la méthode de l&apos;atelier. Il rassemble les informations,
              rend les prochaines actions visibles et évite de saisir plusieurs fois la même chose.
            </p>
          </aside>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-green">Qoravo en situation</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{resource.situationTitle}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{resource.situationIntro}</p>
          </div>
          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {resource.workflow.map((step, index) => (
              <li key={step.title} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-extrabold tracking-tight">Ce que l&apos;atelier améliore concrètement</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {resource.benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <Check className="h-6 w-6 text-brand-green" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-bold">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-sky-300">Méthode pratique</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{resource.checklistTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Cette liste peut servir de contrôle au comptoir ou pendant la configuration de votre espace.
            </p>
          </div>
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {resource.checklist.map((item) => (
              <li key={item} className="flex items-start gap-3 border-b border-white/10 pb-4 text-sm leading-6 text-slate-100">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-wide text-brand-blue">Questions fréquentes</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Réponses utiles avant de choisir un outil</h2>
          <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
            {resource.faq.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="cursor-pointer list-none pr-8 text-base font-bold marker:hidden">
                  {item.question}
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-brand-green">Continuer à apprendre</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Autres guides pour l&apos;atelier</h2>
            </div>
            <Link href="/pro" className="text-sm font-bold text-brand-blue hover:text-sky-700">
              Voir le logiciel Qoravo
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {seoResourceLinks
              .filter((item) => item.href !== `/${resource.slug}`)
              .slice(0, 4)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-300"
                >
                  <p className="font-bold group-hover:text-brand-blue">{item.label}</p>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 text-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand-blue">Tester sur votre propre atelier</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Essayez Qoravo pendant 72 heures, sans carte bancaire.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Créez une fiche test, configurez votre email magasin et vérifiez le parcours complet avant de décider.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/pro/inscription"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-blue px-6 py-3 text-sm font-bold text-white hover:bg-sky-600"
            >
              Démarrer l&apos;essai gratuit
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/pro" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-6 py-3 text-sm font-bold hover:bg-slate-50">
              Découvrir toutes les fonctions
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <QoravoLogo />
          <div className="flex flex-wrap gap-5 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-slate-950">Accueil</Link>
            <Link href="/pro" className="hover:text-slate-950">Professionnels</Link>
            <Link href="/conditions-utilisation" className="hover:text-slate-950">Conditions</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
