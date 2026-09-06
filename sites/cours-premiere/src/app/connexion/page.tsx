import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { SignInForm } from "./SignInForm";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (userId) redirect("/profil");
  const { next } = await searchParams;

  return (
    <main className="min-h-screen px-6 py-12 flex justify-center items-center">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-brand-ink">Connexion</h1>
        <SignInForm next={next ?? "/profil"} />
        <p className="text-sm text-slate-600">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-brand-primary font-medium">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}
