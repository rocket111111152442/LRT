import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.qoravo.fr"),
  applicationName: "Qoravo",
  title: {
    default: "Qoravo — Logiciel de gestion pour réparateurs",
    template: "%s | Qoravo",
  },
  description:
    "Qoravo est le logiciel de gestion tout-en-un pour réparateurs de téléphone, informatique et électronique : suivi client, devis, stock, agenda, comptabilité et emails automatiques.",
  keywords: [
    "Qoravo",
    "logiciel gestion réparation téléphone",
    "logiciel réparateur smartphone",
    "gestion atelier réparation",
    "suivi réparation client",
    "logiciel stock pièces détachées",
  ],
  authors: [{ name: "Qoravo", url: "https://www.qoravo.fr" }],
  creator: "Qoravo",
  publisher: "Qoravo",
  category: "Business software",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.qoravo.fr",
    siteName: "Qoravo",
    title: "Qoravo — Logiciel de gestion pour réparateurs",
    description:
      "Gérez réparations, clients, devis, stock, agenda, comptabilité et emails automatiques depuis un seul logiciel.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qoravo — Logiciel de gestion pour réparateurs",
    description:
      "Le logiciel tout-en-un des ateliers de réparation téléphone, informatique et électronique.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={jakarta.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
