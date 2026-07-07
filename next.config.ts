import type { NextConfig } from "next";

const securityHeaders = [
  // Empêche l'affichage du site dans une iframe tierce (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Empêche le MIME-sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Limite les informations de provenance envoyées aux sites externes.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Force HTTPS pendant 2 ans (HSTS).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Désactive les API navigateur non utilisées.
  {
    key: "Permissions-Policy",
    value: "microphone=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    return [
      // Application sport Cailloux (statique dans public/cailloux/).
      { source: "/cailloux", destination: "/cailloux/index.html" },
    ];
  },
};

export default nextConfig;
