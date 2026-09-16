import type { Metadata } from "next";
import type { ReactNode } from "react";

// La page de connexion est un composant client : le titre passe par ce layout.
export const metadata: Metadata = {
  title: "Connexion modérateur",
  robots: { index: false },
};

export default function ModLoginLayout({ children }: { children: ReactNode }) {
  return children;
}
