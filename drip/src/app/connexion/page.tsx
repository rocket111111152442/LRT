import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ suite?: string; reinitialise?: string }>;

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (user) redirect(params.suite?.startsWith("/") ? params.suite : "/compte");

  return (
    <AuthShell
      title="Connexion"
      intro="Accédez à vos commandes, vos adresses et vos avis."
      footer={
        <p className="text-sm text-[color:var(--color-smoke)]">
          Pas encore de compte ?{" "}
          <Link
            href={
              params.suite
                ? `/inscription?suite=${encodeURIComponent(params.suite)}`
                : "/inscription"
            }
            className="link-underline text-[color:var(--color-ink)]"
          >
            Créer un compte
          </Link>
        </p>
      }
    >
      <LoginForm
        next={params.suite}
        notice={
          params.reinitialise
            ? "Mot de passe mis à jour. Connectez-vous avec le nouveau."
            : undefined
        }
      />
    </AuthShell>
  );
}
