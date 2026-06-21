import Link from "next/link";
import { AdminHeader } from "../AdminHeader";
import { requireAdminPage } from "@/lib/auth";

const setupSteps = [
  {
    title: "1. Faire le tour automatique",
    text: "A la premiere connexion, Qoravo ouvre un tour guide. Il presente chaque page admin et l ordre conseille pour regler l espace atelier.",
    href: "/admin",
    action: "Retour au tableau",
  },
  {
    title: "2. Regler les informations email",
    text: "Ajoutez l email du magasin, le mot de passe d application SMTP, le nom du magasin, l adresse, les horaires et le telephone. Ces infos servent aux messages envoyes quand le statut d une reparation change.",
    href: "/admin/email",
    action: "Configurer l'email",
  },
  {
    title: "3. Imprimer le QR code client",
    text: "Le QR code envoie vers le formulaire public de votre atelier. Imprimez-le, scannez-le avec votre telephone, puis verifiez que la fiche arrive dans l admin.",
    href: "/admin/qr-code",
    action: "Afficher le QR code",
  },
  {
    title: "4. Creer une reparation test",
    text: "Creez une fiche depuis le bouton Nouvelle ou depuis le QR code. Mettez un vrai email de test pour verifier le fonctionnement complet.",
    href: "/admin/repairs/new",
    action: "Creer une fiche",
  },
  {
    title: "5. Tester les emails de statut",
    text: "Ouvrez la fiche test, changez le statut, puis enregistrez. Si SMTP est correct, le client recoit un email. Le statut PRET garde une protection anti double envoi.",
    href: "/admin",
    action: "Ouvrir la liste",
  },
  {
    title: "6. Nettoyer la fiche test",
    text: "Quand tout marche, archivez la fiche test pour garder une trace ou supprimez-la definitivement si elle ne sert plus.",
    href: "/admin",
    action: "Retour aux fiches",
  },
];

const configurationBlocks = [
  {
    title: "Page Reparations",
    text: "C est la page de travail quotidienne. Elle sert a chercher, filtrer et ouvrir les dossiers clients.",
  },
  {
    title: "Page Nouvelle",
    text: "Elle sert a creer une reparation au comptoir sans demander au client de scanner le QR code.",
  },
  {
    title: "Page QR code",
    text: "Elle affiche le lien public de votre atelier et le QR code a imprimer pour les clients.",
  },
  {
    title: "Page Email",
    text: "Elle configure l envoi automatique des messages de statut et les informations affichees dans l email.",
  },
  {
    title: "Fiche detaillee",
    text: "Elle permet de changer le statut, ajouter des notes internes, archiver ou supprimer une reparation.",
  },
];

const dailyTips = [
  "Utilisez la recherche pour retrouver un client par nom, telephone, email, marque ou modele.",
  "Gardez les notes internes pour les informations reservees a l'atelier.",
  "Archivez les anciennes reparations au lieu de les supprimer si vous voulez garder l'historique.",
  "Supprimez definitivement seulement les fiches creees par erreur.",
  "Si un email de statut ne part pas, verifiez d'abord la page Email et le mot de passe d'application.",
];

export default async function AdminGuidePage() {
  const admin = await requireAdminPage();

  return (
    <>
      <AdminHeader
        email={admin.email}
        supportIncluded={admin.supportIncluded}
        paymentStatus={admin.paymentStatus}
        trialEndsAt={admin.trialEndsAt}
        proAccountSlug={admin.proAccountSlug}
      />
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
              Suivez ces etapes une seule fois pour regler Qoravo pour votre
              atelier. Le bouton Tour dans le menu permet de revoir le parcours
              de premiere utilisation quand vous voulez.
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
                  className="w-fit rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
                >
                  {step.action}
                </Link>
              </article>
            ))}
          </section>

          <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-2">
              <h2 className="text-lg font-semibold text-slate-950">
                A quoi sert chaque page
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                Le tour automatique montre ces zones dans l ordre. Cette liste
                sert de rappel rapide apres la premiere configuration.
              </p>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {configurationBlocks.map((block) => (
                <article
                  key={block.title}
                  className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <h3 className="text-sm font-semibold text-slate-950">
                    {block.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {block.text}
                  </p>
                </article>
              ))}
            </div>
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
