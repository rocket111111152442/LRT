import { NextResponse, type NextRequest } from "next/server";
import {
  isMutatingMethod,
  isSameOriginRequest,
} from "@/lib/requestSecurity";

// Domaine canonique : qoravo.fr.
//
// IMPORTANT : on ne redirige PAS www.qoravo.fr <-> qoravo.fr ici. La
// canonicalisation www/apex est gérée par Vercel au niveau du projet (Settings
// > Domains). Le faire aussi dans le middleware crée une boucle infinie
// (ERR_TOO_MANY_REDIRECTS). Le middleware ne s'occupe que des ANCIENS domaines.
const CANONICAL_HOST = "www.qoravo.fr";
const REDIRECTED_HOSTS = new Set([
  "lrt.life",
  "www.lrt.life",
]);

const SERVER_TO_SERVER_PATHS = new Set([
  "/api/stripe/webhook",
  "/api/cron/ready-reminders",
]);

const SENSITIVE_PUBLIC_PREFIXES = [
  "/documents/",
  "/signature/",
  "/depot",
  "/suivi",
  "/devis/",
  "/avis/",
];

function requestBodyLimit(pathname: string) {
  if (pathname === "/api/repairs") {
    return 4 * 1024 * 1024;
  }

  if (pathname === "/api/stripe/webhook") {
    return 2 * 1024 * 1024;
  }

  return 512 * 1024;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase();

  if (host && REDIRECTED_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/") && isMutatingMethod(request.method)) {
    if (
      !SERVER_TO_SERVER_PATHS.has(pathname) &&
      !isSameOriginRequest({
        origin: request.headers.get("origin"),
        requestOrigin: request.nextUrl.origin,
        fetchSite: request.headers.get("sec-fetch-site"),
      })
    ) {
      return NextResponse.json(
        { error: "Origine de requete refusee." },
        { status: 403 },
      );
    }

    const contentLength = Number(request.headers.get("content-length") ?? "0");

    if (
      Number.isFinite(contentLength) &&
      contentLength > requestBodyLimit(pathname)
    ) {
      return NextResponse.json(
        { error: "Requete trop volumineuse." },
        { status: 413 },
      );
    }
  }

  const response = NextResponse.next();

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/moderateur") ||
    SENSITIVE_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    response.headers.set(
      "Cache-Control",
      "private, no-store, max-age=0, must-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg).*)"],
};
