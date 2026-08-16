import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "@/components/RegisterForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Créer un compte",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ suite?: string }>;

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (user) redirect("/compte");

  return (
    <AuthShell
      title="Créer un compte"
      intro="Un panier qui vous suit, l'historique de vos commandes, et la possibilité de laisser un avis sur ce que vous portez."
      aside={
        <>
          <p className="display-xl max-w-[12ch]">Bienvenue dans la série.</p>
          <ul className="mt-10 space-y-3 text-sm text-[color:var(--color-ash)]">
            <li>— Panier conservé d&apos;un appareil à l&apos;autre</li>
            <li>— Suivi de commande en temps réel</li>
            <li>— Accès anticipé aux nouvelles séries</li>
          </ul>
        </>
      }
      footer={
        <p className="text-sm text-[color:var(--color-smoke)]">
          Vous avez déjà un compte ?{" "}
          <Link href="/connexion" className="link-underline text-[color:var(--color-ink)]">
            Se connecter
          </Link>
        </p>
      }
    >
      <RegisterForm next={params.suite} />
    </AuthShell>
  );
}
