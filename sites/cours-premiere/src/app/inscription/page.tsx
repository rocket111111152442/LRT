import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
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
            Tu ajouteras tes matières juste après — ça marche pour n&apos;importe
            quel niveau, de la 6e aux études supérieures.
          </p>
        </div>
        <SignUpForm />
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
