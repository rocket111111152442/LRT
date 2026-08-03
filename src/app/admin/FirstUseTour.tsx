"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Rocket,
  X,
} from "lucide-react";

type GuideStep = {
  title: string;
  shortTitle: string;
  text: string;
  details: string[];
  path?: string;
  action?: string;
};

const steps: GuideStep[] = [
  {
    title: "Bienvenue, votre compte est prêt",
    shortTitle: "Votre atelier",
    text: "Commencez par renseigner les informations essentielles de votre boutique.",
    details: [
      "Ajoutez l'adresse, le téléphone et les horaires depuis Paramètres.",
      "Vous pourrez modifier ces informations à tout moment.",
      "La fiche publique reste masquée tant que vous ne choisissez pas de l'activer.",
    ],
    path: "/admin/parametres",
    action: "Configurer ma boutique",
  },
  {
    title: "Créez votre première réparation",
    shortTitle: "Première fiche",
    text: "Ajoutez une fiche test pour découvrir le fonctionnement sans attendre un client.",
    details: [
      "Renseignez les coordonnées du client et les informations de l'appareil.",
      "Décrivez la panne et ajoutez les informations utiles à l'atelier.",
      "La nouvelle fiche apparaît immédiatement dans vos réparations.",
    ],
    path: "/admin/repairs/new",
    action: "Créer une fiche test",
  },
  {
    title: "Pilotez vos réparations",
    shortTitle: "Suivi quotidien",
    text: "Le tableau principal rassemble les dossiers et leur état d'avancement.",
    details: [
      "Recherchez par client, téléphone, email, marque, modèle ou ticket.",
      "Filtrez les appareils par statut.",
      "Ouvrez une fiche pour ajouter des notes, un devis ou changer le statut.",
    ],
    path: "/admin",
    action: "Voir mes réparations",
  },
  {
    title: "Organisez les rendez-vous",
    shortTitle: "Agenda",
    text: "Placez les réparations à une date précise et retrouvez-les dans le calendrier.",
    details: [
      "Sélectionnez une fiche qui n'a pas encore de créneau.",
      "Choisissez le jour et l'heure du rendez-vous.",
      "Cliquez sur un rendez-vous du calendrier pour ouvrir sa fiche.",
    ],
    path: "/admin/agenda",
    action: "Ouvrir l'agenda",
  },
  {
    title: "Installez le QR code au comptoir",
    shortTitle: "QR code",
    text: "Le QR code ouvre le formulaire public propre à votre atelier.",
    details: [
      "Imprimez-le et placez-le à un endroit visible.",
      "Scannez-le avec votre téléphone pour vérifier le formulaire.",
      "Les demandes envoyées arrivent directement dans vos réparations.",
    ],
    path: "/admin/qr-code",
    action: "Afficher mon QR code",
  },
  {
    title: "Configurez les emails clients",
    shortTitle: "Emails",
    text: "Utilisez l'adresse du magasin pour prévenir les clients automatiquement.",
    details: [
      "Renseignez l'email du magasin et son mot de passe d'application SMTP.",
      "Envoyez un message de test avant de commencer.",
      "Sans SMTP valide, les réparations restent enregistrées mais aucun email client ne part.",
    ],
    path: "/admin/email",
    action: "Régler les emails",
  },
  {
    title: "Votre espace est prêt",
    shortTitle: "C'est parti",
    text: "Vous connaissez maintenant les actions essentielles pour utiliser Qoravo au quotidien.",
    details: [
      "Testez un changement de statut et vérifiez l'email reçu.",
      "Découvrez ensuite le stock, les ventes et la comptabilité à votre rythme.",
      "Le guide d'utilisation reste disponible depuis le menu Aide.",
    ],
    path: "/admin/guide",
    action: "Ouvrir le guide complet",
  },
];

function storageKey(email: string) {
  return `Qoravo-admin-first-tour:${email}`;
}

function activeStepKey(email: string) {
  return `Qoravo-admin-first-tour-step:${email}`;
}

function activeTourKey(email: string) {
  return `Qoravo-admin-first-tour-active:${email}`;
}

function readStorage(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The tour is optional. If storage is blocked, the admin must still load.
  }
}

function removeStorage(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // The tour is optional. If storage is blocked, the admin must still load.
  }
}

export function FirstUseTour({ accountKey }: { accountKey: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const keys = useMemo(
    () => ({
      done: storageKey(accountKey),
      step: activeStepKey(accountKey),
      active: activeTourKey(accountKey),
    }),
    [accountKey],
  );

  useEffect(() => {
    const openTour = () => {
      writeStorage(keys.active, "1");
      writeStorage(keys.step, "0");
      setStepIndex(0);
      setIsOpen(true);
    };

    window.addEventListener("Qoravo-admin-tour-open", openTour);

    const savedStep = Number(readStorage(keys.step) ?? "0");
    const hasActiveTour = readStorage(keys.active) === "1";
    const hasSeenTour = readStorage(keys.done) === "1";

    let cancelled = false;

    if (hasActiveTour || !hasSeenTour) {
      const initialStep = Number.isFinite(savedStep)
        ? Math.min(Math.max(savedStep, 0), steps.length - 1)
        : 0;

      queueMicrotask(() => {
        if (cancelled) {
          return;
        }

        setStepIndex(initialStep);
        setIsOpen(true);
        writeStorage(keys.active, "1");
      });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("Qoravo-admin-tour-open", openTour);
    };
  }, [keys]);

  if (!isOpen) {
    return null;
  }

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const isCurrentPage = step.path === pathname;

  function goToStep(nextStep: number) {
    const safeStep = Math.min(Math.max(nextStep, 0), steps.length - 1);
    writeStorage(keys.active, "1");
    writeStorage(keys.step, String(safeStep));
    setStepIndex(safeStep);
  }

  function closeTour() {
    writeStorage(keys.done, "1");
    removeStorage(keys.active);
    removeStorage(keys.step);
    setIsOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[120] bg-white">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-use-tour-title"
        className="flex h-dvh w-full flex-col overflow-hidden bg-white"
      >
        <header className="flex shrink-0 items-start gap-4 bg-slate-950 px-5 py-5 text-white sm:px-8 lg:px-12">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-400 text-slate-950">
            <Rocket aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
              Guide de prise en main
            </p>
            <h2 id="first-use-tour-title" className="mt-1 text-xl font-semibold sm:text-2xl">
              {step.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeTour}
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
            aria-label="Fermer le guide"
            title="Fermer le guide"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[260px_minmax(0,1fr)] md:overflow-hidden lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="border-b border-slate-200 bg-slate-50 p-4 md:overflow-y-auto md:border-b-0 md:border-r md:p-6 lg:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Progression
            </p>
            <ol className="mt-3 grid grid-cols-4 gap-2 md:grid-cols-1">
              {steps.map((guideStep, index) => (
                <li key={guideStep.shortTitle}>
                  <button
                    type="button"
                    onClick={() => goToStep(index)}
                    className={`flex w-full min-w-0 items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition md:text-sm ${
                      index === stepIndex
                        ? "bg-sky-100 text-sky-900"
                        : index < stepIndex
                          ? "text-emerald-700 hover:bg-emerald-50"
                          : "text-slate-500 hover:bg-white hover:text-slate-800"
                    }`}
                    aria-current={index === stepIndex ? "step" : undefined}
                  >
                    <span className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] ${
                      index < stepIndex
                        ? "bg-emerald-500 text-white"
                        : index === stepIndex
                          ? "bg-sky-600 text-white"
                          : "border border-slate-300 bg-white text-slate-500"
                    }`}>
                      {index < stepIndex ? <CheckCircle2 aria-hidden="true" className="size-4" /> : index + 1}
                    </span>
                    <span className="hidden min-w-0 truncate md:block">{guideStep.shortTitle}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          <div className="grid content-start gap-6 p-5 sm:p-8 md:overflow-y-auto lg:p-12">
            <div>
              <p className="text-sm font-semibold text-sky-700">
                Étape {stepIndex + 1} sur {steps.length}
              </p>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">{step.text}</p>
            </div>

            <ul className="grid gap-3">
              {step.details.map((detail) => (
                <li key={detail} className="flex items-start gap-3 text-base leading-7 text-slate-700">
                  <CheckCircle2 aria-hidden="true" className="mt-1 size-5 shrink-0 text-emerald-600" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>

            {step.path ? (
              isCurrentPage ? (
                <p className="flex w-fit items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                  <CheckCircle2 aria-hidden="true" className="size-4" />
                  Vous êtes sur la bonne page
                </p>
              ) : (
                <Link
                  href={step.path}
                  onClick={closeTour}
                  className="inline-flex w-fit items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-900 transition hover:border-sky-300 hover:bg-sky-100"
                >
                  {step.action}
                  <ExternalLink aria-hidden="true" className="size-4" />
                </Link>
              )
            ) : null}
          </div>
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 sm:max-w-64">
            <div
              className="h-full rounded-full bg-sky-600 transition-all"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => goToStep(stepIndex - 1)}
              disabled={isFirst}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
              Retour
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={closeTour}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Terminer
                <CheckCircle2 aria-hidden="true" className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goToStep(stepIndex + 1)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Suivant
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}
