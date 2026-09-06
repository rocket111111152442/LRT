import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";

export default async function HomePage() {
  const userId = await getCurrentUserId();
  if (userId) redirect("/profil");

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-ink">
          Ton espace personnel pour la Première
        </h1>
        <p className="text-slate-600 text-lg">
          Fiches de cours, agenda, notes et documents — adaptés à ta classe et
          à tes spécialités. Accessible depuis ton téléphone et ton
          ordinateur, protégé par un compte rien qu&apos;à toi.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/inscription"
            className="rounded-lg bg-brand-primary px-6 py-3 font-medium text-white hover:bg-brand-primary-dark transition"
          >
            Créer mon compte
          </Link>
          <Link
            href="/connexion"
            className="rounded-lg border border-brand-border bg-white px-6 py-3 font-medium text-brand-ink hover:bg-slate-50 transition"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </main>
  );
}
