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
  title: "Qoravo — Le logiciel tout-en-un des réparateurs",
  description:
    "Qoravo centralise vos réparations : QR code client, suivi, devis, stock, agenda, compta et emails automatiques. Essai gratuit 72h.",
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
    <html lang="fr" className={jakarta.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
