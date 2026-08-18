import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // DRIP vit dans un sous-dossier d'un dépôt qui contient une autre application :
  // sans cette racine explicite, Turbopack remonte au lockfile parent et compile
  // les fichiers du projet voisin.
  turbopack: { root: import.meta.dirname },
  images: {
    formats: ["image/avif", "image/webp"],
    // Un hôte absent de cette liste n'est pas seulement ignoré : `next/image`
    // refuse de le servir et le navigateur affiche une image cassée.
    remotePatterns: [
      // Maquettes Printify (images.printify.com, et les sous-domaines voisins
      // que l'API renvoie selon les gammes).
      { protocol: "https", hostname: "images.printify.com" },
      { protocol: "https", hostname: "*.printify.com" },
      // Fichiers uploadés dans l'admin via Vercel Blob (optionnel).
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
