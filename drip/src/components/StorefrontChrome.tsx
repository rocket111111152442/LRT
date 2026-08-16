"use client";

import { usePathname } from "next/navigation";
import { CartDrawer } from "@/components/CartDrawer";

/**
 * Décide si l'habillage boutique (bandeau, en-tête, pied de page, tiroir de
 * panier) doit entourer la page.
 *
 * L'administration a sa propre barre de navigation : lui superposer le menu
 * de la boutique ferait deux en-têtes empilés. Plutôt que de dupliquer la
 * mise en page racine dans un groupe de routes, on masque l'habillage sur
 * `/admin` — l'en-tête et le pied de page sont passés en props, donc ils
 * restent des composants serveur.
 */
export function StorefrontChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      {header}
      <main id="contenu">{children}</main>
      {footer}
      <CartDrawer />
    </>
  );
}
