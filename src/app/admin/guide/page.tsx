import Link from "next/link";
import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";

const setupSteps = [
  {
    title: "1. Verifier le compte admin",
    text: "Gardez votre email et votre mot de passe admin dans un gestionnaire de mots de passe. C'est ce compte qui protege l'espace atelier.",
    href: "/admin",
    action: "Voir les reparations",
  },
  {
    title: "2. Configurer les emails",
    text: "Ajoutez l'adresse email du magasin, le mot de passe d'application SMTP et les informations de boutique. Sans SMTP, l'application continue de marcher, mais elle ne peut pas prevenir le client automatiquement.",
    href: "/admin/email",
    action: "Configurer l'email",
  },
  {
    title: "3. Imprimer le QR code",
    text: "Le QR code envoie les clients vers votre formulaire public. Imprimez-le et mettez-le au comptoir ou sur une affiche.",
    href: "/admin/qr-code",
    action: "Afficher le QR code",
  },
  {
    title: "4. Faire une reparation test",
    text: "Creez une fiche manuellement ou scannez le QR code avec votre telephone pour verifier que tout arrive bien dans l'admin.",
    href: "/admin/repairs/new",
    action: "Creer une fiche",
  },
  {
    title: "5. Tester le statut PRET",
    text: "Ouvrez une fiche, passez le statut a PRET, puis enregistrez. L'email part une seule fois si la configuration SMTP est complete.",
    href: "/admin",
    action: "Ouvrir la liste",
  },
];

const dailyTips = [
  "Utilisez la recherche pour retrouver un client par nom, telephone, email, marque ou modele.",
  "Gardez les notes internes pour les informations reservees a l'atelier.",
  "Archivez les anciennes reparations au lieu de les supprimer si vous voulez garder l'historique.",
  "Supprimez definitivement seulement les fiches creees par erreur.",
  "Si un email PRET ne part pas, verifiez d'abord la page Email et le mot de passe d'application.",
];

export default async function AdminGuidePage() {
  const admin = await requireAdminPage();

  return (
    <>
      <AdminHeader email={admin.email} />
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8">
          <header className="grid gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Premiere connexion
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              Guide de demarrage
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Suivez ces etapes une seule fois pour rendre l&apos;espace admin pret
              a utiliser au comptoir.
            </p>
          </header>

          <section className="grid gap-4 lg:grid-cols-2">
            {setupSteps.map((step) => (
              <article
                key={step.title}
                className="grid content-between gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="grid gap-2">
                  <h2 className="text-lg font-semibold text-slate-950">
                    {step.title}
                  </h2>
                  <p className="text-sm leading-6 text-slate-600">{step.text}</p>
                </div>
                <Link
                  href={step.href}
                  className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {step.action}
                </Link>
              </article>
            ))}
          </section>

          <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Routine conseillee
            </h2>
            <ul className="mt-4 grid gap-3">
              {dailyTips.map((tip) => (
                <li key={tip} className="text-sm leading-6 text-slate-700">
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
