import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/estimation",
        destination: "/estimation-immobiliere",
        permanent: true,
      },
      {
        source: "/biens",
        destination: "/tous-nos-biens",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
