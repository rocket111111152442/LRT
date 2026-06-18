import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LRT",
  description: "Logiciel de gestion des reparations d'appareils.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
