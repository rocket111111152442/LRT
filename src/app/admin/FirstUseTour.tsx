"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type TourStep = {
  title: string;
  text: string;
  details: string[];
  path?: string;
  action?: string;
};

const steps: TourStep[] = [
  {
    title: "Bienvenue dans votre espace admin",
    text: "Ce tour montre quoi regler en premier pour que LRT soit pret pour votre atelier.",
    details: [
      "Vous allez voir les reparations, la creation manuelle, le QR code, les emails et les fiches client.",
      "A la fin, vous saurez quoi tester avant de donner le QR code aux clients.",
    ],
    path: "/admin",
    action: "Voir le tableau de bord",
  },
  {
    title: "Tableau des reparations",
    text: "Cette page sert a retrouver les dossiers de l atelier et a suivre leur avancee.",
    details: [
      "Utilisez la recherche pour nom, telephone, email, marque ou modele.",
      "Filtrez par statut pour voir uniquement les appareils en cours, prets ou recuperes.",
      "Cliquez sur une reparation pour ouvrir sa fiche detaillee.",
    ],
    path: "/admin",
    action: "Ouvrir les reparations",
  },
  {
    title: "Creation manuelle",
    text: "Cette page sert quand le client est devant vous ou quand vous voulez creer une fiche sans QR code.",
    details: [
      "Remplissez les coordonnees du client.",
      "Ajoutez le type d appareil, la marque, le modele et la panne.",
      "La fiche apparait ensuite dans la liste admin.",
    ],
    path: "/admin/repairs/new",
    action: "Ouvrir creation manuelle",
  },
  {
    title: "QR code client",
    text: "Le QR code envoie les clients vers votre formulaire public, avec votre identifiant d atelier.",
    details: [
      "Imprimez-le et mettez-le au comptoir.",
      "Scannez-le avec votre telephone pour verifier que le formulaire public s ouvre bien.",
      "Chaque fiche envoyee par ce formulaire arrive dans votre espace admin.",
    ],
    path: "/admin/qr-code",
    action: "Ouvrir le QR code",
  },
  {
    title: "Configuration email",
    text: "Cette page sert a regler l envoi automatique des mails quand le statut d'une reparation change.",
    details: [
      "Renseignez l email du magasin et le mot de passe d application SMTP.",
      "Ajoutez le nom, l adresse, les horaires et le telephone du magasin.",
      "Sans SMTP valide, LRT enregistre la reparation mais ne peut pas envoyer l email client.",
    ],
    path: "/admin/email",
    action: "Configurer les emails",
  },
  {
    title: "Fiche reparation",
    text: "La fiche detaillee sert a piloter une reparation precise.",
    details: [
      "Changez le statut quand l appareil avance.",
      "Ajoutez des notes internes visibles seulement par l atelier.",
      "Quand le statut change, LRT tente d envoyer un email au client.",
      "Pour le statut PRET, LRT garde une protection anti double envoi.",
    ],
    path: "/admin",
    action: "Choisir une reparation",
  },
  {
    title: "Dernier test avant utilisation",
    text: "Avant de l utiliser avec de vrais clients, faites un test complet.",
    details: [
      "Creez une reparation test depuis l admin ou le QR code.",
      "Ouvrez la fiche, mettez une note interne, puis testez un changement de statut.",
      "Verifiez que l email part si SMTP est configure, puis archivez ou supprimez la fiche test.",
    ],
    path: "/admin/guide",
    action: "Lire le guide complet",
  },
];

function storageKey(email: string) {
  return `lrt-admin-first-tour:${email}`;
}

function activeStepKey(email: string) {
  return `lrt-admin-first-tour-step:${email}`;
}

function activeTourKey(email: string) {
  return `lrt-admin-first-tour-active:${email}`;
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

export function FirstUseTour({ email }: { email: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const keys = useMemo(
    () => ({
      done: storageKey(email),
      step: activeStepKey(email),
      active: activeTourKey(email),
    }),
    [email],
  );

  useEffect(() => {
    const openTour = () => {
      writeStorage(keys.active, "1");
      writeStorage(keys.step, "0");
      setStepIndex(0);
      setIsOpen(true);
    };

    window.addEventListener("lrt-admin-tour-open", openTour);

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
      window.removeEventListener("lrt-admin-tour-open", openTour);
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

  function rememberCurrentStep() {
    writeStorage(keys.active, "1");
    writeStorage(keys.step, String(stepIndex));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 py-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-use-tour-title"
        className="grid max-h-[92vh] w-full max-w-2xl gap-5 overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 shadow-xl sm:p-6"
      >
        <header className="grid gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Tour de premiere utilisation {stepIndex + 1}/{steps.length}
          </p>
          <h2
            id="first-use-tour-title"
            className="text-2xl font-semibold text-slate-950"
          >
            {step.title}
          </h2>
          <p className="text-sm leading-6 text-slate-700">{step.text}</p>
        </header>

        <ol className="grid gap-3">
          {step.details.map((detail) => (
            <li
              key={detail}
              className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
            >
              {detail}
            </li>
          ))}
        </ol>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-slate-950 transition-all"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {step.path && !isCurrentPage ? (
              <Link
                href={step.path}
                onClick={rememberCurrentStep}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                {step.action}
              </Link>
            ) : null}
            {step.path && isCurrentPage ? (
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
                Page ouverte
              </span>
            ) : null}
            <button
              type="button"
              onClick={closeTour}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Fermer
            </button>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => goToStep(stepIndex - 1)}
              disabled={isFirst}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Retour
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={closeTour}
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Terminer le tour
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goToStep(stepIndex + 1)}
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Suivant
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
