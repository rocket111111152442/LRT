import { NextResponse, type NextRequest } from "next/server";

// Domaine canonique : qoravo.fr.
//
// IMPORTANT : on ne redirige PAS www.qoravo.fr <-> qoravo.fr ici. La
// canonicalisation www/apex est gérée par Vercel au niveau du projet (Settings
// > Domains). Le faire aussi dans le middleware crée une boucle infinie
// (ERR_TOO_MANY_REDIRECTS). Le middleware ne s'occupe que des ANCIENS domaines.
const CANONICAL_HOST = "qoravo.fr";
const REDIRECTED_HOSTS = new Set([
  "lrt.life",
  "www.lrt.life",
]);

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase();

  if (host && REDIRECTED_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg).*)"],
};
