import { NextResponse, type NextRequest } from "next/server";

// Domaine canonique : qoravo.fr (apex). On redirige les anciens domaines et le
// sous-domaine www vers le domaine canonique en 308.
const CANONICAL_HOST = "qoravo.fr";
const REDIRECTED_HOSTS = new Set([
  "www.qoravo.fr",
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
