import type { Metadata, Viewport } from "next";
import { Anton, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SHOP } from "@/lib/shop";
import { appUrl } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { readCart } from "@/lib/cart";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RevealObserver } from "@/components/RevealObserver";
import { StorefrontChrome } from "@/components/StorefrontChrome";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-nb",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: `${SHOP.name} — ${SHOP.tagline}`,
    template: `%s — ${SHOP.name}`,
  },
  description: SHOP.description,
  applicationName: SHOP.name,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SHOP.name,
    title: `${SHOP.name} — ${SHOP.tagline}`,
    description: SHOP.description,
    images: [{ url: "/logo-natural-brutal.png", width: 165, height: 162 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SHOP.name} — ${SHOP.tagline}`,
    description: SHOP.description,
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icone-natural-brutal.png", type: "image/png" }],
    apple: "/icone-natural-brutal.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, cart] = await Promise.all([getCurrentUser(), readCart()]);

  return (
    <html lang="fr" className={`${anton.variable} ${interTight.variable} ${mono.variable}`}>
      <head>
        {/* Marque la page comme « JavaScript actif » avant le premier rendu.
            Les états masqués des animations d'apparition sont conditionnés à
            cette classe : si le script ne s'exécute pas, tout reste lisible. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js")`,
          }}
        />
      </head>
      <body>
        <CartProvider initialCart={cart}>
          <a
            href="#contenu"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper label"
          >
            Aller au contenu
          </a>

          <StorefrontChrome header={<Header user={user} />} footer={<Footer />}>
            {children}
          </StorefrontChrome>
        </CartProvider>

        <div className="grain" aria-hidden="true" />
        <RevealObserver />
      </body>
    </html>
  );
}
