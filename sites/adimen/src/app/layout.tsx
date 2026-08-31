import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Newsreader } from 'next/font/google';
import './globals.css';

import BandeauConfidentialite from '@/components/BandeauConfidentialite';
import Entete from '@/components/Entete';
import IntroSite from '@/components/IntroSite';
import PiedDePage from '@/components/PiedDePage';
import ActiverJs from '@/components/ActiverJs';
import { SITE_URL, agence } from '@/content/site';
import { jsonLdOrganisation, jsonLdSiteWeb } from '@/lib/jsonld';

/* Les trois familles sont auto-hébergées par next/font : aucune requête vers un
   tiers depuis le navigateur du visiteur, ce qui évite tout traceur de police. */
const display = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--police-display',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
});

const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--police-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--police-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${agence.nom} — Détectives privés à Genève et en Suisse romande`,
    template: `%s — ${agence.nom}`,
  },
  description:
    "Agence de détectives privés agréée par le Conseil d'État à Genève. Enquêtes, filatures, contre-mesures et renseignement privé à Genève, Lausanne, Montreux et Sion.",
  applicationName: agence.nom,
  authors: [{ name: agence.nom }],
  creator: agence.nom,
  formatDetection: { telephone: true, address: false, email: true },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  themeColor: '#06080b',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CH" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          // Données structurées : sérialisation contrôlée, aucune donnée d'utilisateur.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganisation()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSiteWeb()) }}
        />
      </head>
      <body>
        <ActiverJs />
        <IntroSite />
        <a className="lien-evitement" href="#contenu">
          Aller au contenu principal
        </a>
        <BandeauConfidentialite />
        <Entete />
        <main id="contenu">{children}</main>
        <PiedDePage />
      </body>
    </html>
  );
}
