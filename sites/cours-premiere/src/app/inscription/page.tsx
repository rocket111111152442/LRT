import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { SPECIALITES, MAX_SPECIALITES } from "@/lib/subjects";
import { SignUpForm } from "./SignUpForm";

export default async function SignUpPage() {
  const userId = await getCurrentUserId();
  if (userId) redirect("/profil");

  return (
    <main className="min-h-screen px-6 py-12 flex justify-center">
      <div className="w-full max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Créer mon compte</h1>
          <p className="text-slate-600 mt-1">
            Renseigne tes spécialités de Première ({MAX_SPECIALITES} maximum)
            pour que ton espace s&apos;adapte automatiquement.
          </p>
        </div>
        <SignUpForm specialites={SPECIALITES} maxSpecialites={MAX_SPECIALITES} />
        <p className="text-sm text-slate-600">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-brand-primary font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
