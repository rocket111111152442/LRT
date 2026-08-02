import Link from "next/link";
import { Check, Circle, Mail, MapPin, QrCode, Wrench } from "lucide-react";

type SetupStep = {
  label: string;
  description: string;
  href: string;
  action: string;
  complete: boolean;
  icon: typeof MapPin;
};

export function AdminSetupChecklist({
  profileComplete,
  emailConfigured,
  hasRepair,
}: {
  profileComplete: boolean;
  emailConfigured: boolean;
  hasRepair: boolean;
}) {
  const steps: SetupStep[] = [
    {
      label: "Compléter la boutique",
      description: "Adresse, téléphone et horaires pour votre fiche publique.",
      href: "/admin/parametres",
      action: "Configurer",
      complete: profileComplete,
      icon: MapPin,
    },
    {
      label: "Régler les emails clients",
      description: "Ajoutez l'adresse d'envoi utilisée par votre magasin.",
      href: "/admin/email",
      action: "Régler",
      complete: emailConfigured,
      icon: Mail,
    },
    {
      label: "Créer une première réparation",
      description: "Testez le parcours avec une fiche que vous pourrez supprimer.",
      href: "/admin/repairs/new",
      action: "Créer",
      complete: hasRepair,
      icon: Wrench,
    },
    {
      label: "Vérifier le QR code",
      description: "Imprimez le formulaire comptoir quand votre profil est prêt.",
      href: "/admin/qr-code",
      action: "Afficher",
      complete: profileComplete,
      icon: QrCode,
    },
  ];
  const completed = steps.filter((step) => step.complete).length;

  if (completed === steps.length) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-lg border border-sky-200 bg-white shadow-sm">
      <div className="grid gap-3 bg-gradient-to-r from-sky-50 to-emerald-50 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
            Mise en route
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Préparez Qoravo à votre rythme
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Votre compte fonctionne déjà. Ces réglages rendent ensuite le QR code,
            les emails et la fiche publique opérationnels.
          </p>
        </div>
        <div className="min-w-28 text-left sm:text-right">
          <p className="text-2xl font-extrabold text-slate-950">
            {completed}/{steps.length}
          </p>
          <p className="text-xs font-semibold text-slate-500">étapes terminées</p>
        </div>
      </div>
      <div className="h-1.5 bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all"
          style={{ width: `${(completed / steps.length) * 100}%` }}
        />
      </div>
      <div className="grid gap-px bg-slate-200 md:grid-cols-2">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <article key={step.label} className="flex items-start gap-3 bg-white p-4">
              <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${step.complete ? "bg-emerald-100 text-emerald-700" : "bg-sky-50 text-sky-700"}`}>
                {step.complete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-950">{step.label}</h3>
                  {step.complete ? (
                    <span className="text-xs font-semibold text-emerald-700">Terminé</span>
                  ) : (
                    <Circle className="h-3 w-3 text-slate-300" />
                  )}
                </div>
                <p className="mt-1 text-sm leading-5 text-slate-600">{step.description}</p>
                {!step.complete ? (
                  <Link href={step.href} className="mt-2 inline-flex text-sm font-bold text-sky-700 hover:text-sky-900">
                    {step.action}
                  </Link>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
