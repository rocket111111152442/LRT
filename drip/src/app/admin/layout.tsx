import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { AdminNav } from "@/components/AdminNav";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s — Admin NATURAL BRUTAL" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Double barrière : le rôle est vérifié ici pour l'affichage, et à nouveau
  // dans chaque action serveur avant toute écriture.
  const user = await requireAdmin();


  return (
    <div className="min-h-screen">
      <div className="invert-block">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-5">
            <Link href="/" aria-label="Retour à la boutique">
              <Logo size="sm" />
            </Link>
            <span className="tag">Administration</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="label link-sweep">
              Voir la boutique
            </Link>
            <span className="label-sm hidden text-[color:var(--color-smoke)] sm:block">
              {user.email}
            </span>
            <form action={logoutAction}>
              <button type="submit" className="label link-sweep text-[color:var(--color-smoke)]">
                Quitter
              </button>
            </form>
          </div>
        </div>

        <AdminNav />
      </div>

      {/* L'habillage boutique est retiré sur /admin : ce <main> est donc le
          point de repère principal de la page pour les lecteurs d'écran. */}
      <main id="contenu" className="shell py-12">
        {children}
      </main>
    </div>
  );
}
