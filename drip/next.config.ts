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
    remotePatterns: [
      // Visuels hébergés par Printful (mockups générés automatiquement).
      { protocol: "https", hostname: "files.cdn.printful.com" },
      { protocol: "https", hostname: "printful-upload.s3-accelerate.amazonaws.com" },
      // Fichiers uploadés dans l'admin via Vercel Blob (optionnel).
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
