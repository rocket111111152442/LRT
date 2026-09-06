import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mes cours",
  description: "Espace personnel pour tes cours, notes, agenda et documents, quel que soit ton niveau.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
