import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { ResetPasswordForm } from "@/components/PasswordForms";

export const metadata: Metadata = {
  title: "Nouveau mot de passe",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ token?: string }>;

export default async function ReinitialiserPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell
        title="Lien invalide"
        intro="Ce lien de réinitialisation est incomplet ou a expiré."
        footer={
          <Link href="/mot-de-passe-oublie" className="btn btn-outline btn-sm">
            Demander un nouveau lien
          </Link>
        }
      >
        <span />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Nouveau mot de passe"
      intro="Choisissez un mot de passe. Toutes vos sessions ouvertes ailleurs seront déconnectées."
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
