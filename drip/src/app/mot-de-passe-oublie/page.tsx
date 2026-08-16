import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { ForgotPasswordForm } from "@/components/PasswordForms";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  robots: { index: false, follow: false },
};

export default function MotDePasseOubliePage() {
  return (
    <AuthShell
      title="Mot de passe oublié"
      intro="Indiquez l'adresse de votre compte : nous vous envoyons un lien pour en définir un nouveau."
      aside={
        <p className="display-xl max-w-[12ch]">Ça arrive à tout le monde.</p>
      }
      footer={
        <p className="text-sm text-[color:var(--color-smoke)]">
          <Link href="/connexion" className="link-underline text-[color:var(--color-ink)]">
            Retour à la connexion
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
