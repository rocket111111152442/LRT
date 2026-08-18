import { NextResponse, type NextRequest } from "next/server";

/**
 * Garde-fou d'origine sur les requêtes mutantes.
 *
 * Les cookies de session sont en SameSite=Lax, ce qui bloque déjà l'essentiel
 * du CSRF. Cette vérification ajoute une seconde barrière côté serveur : une
 * écriture dont l'en-tête Origin ne correspond pas au domaine est rejetée avant
 * d'atteindre la moindre Server Action.
 *
 * Le webhook Stripe est exclu : il est appelé de serveur à serveur, sans
 * Origin, et son authenticité est garantie par la signature cryptographique.
 */

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const EXEMPT_PATHS = ["/api/stripe/webhook"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!MUTATING_METHODS.has(request.method)) {
    return NextResponse.next();
  }

  if (EXEMPT_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const origin = request.headers.get("origin");

  // Absence d'Origin : requête non initiée par un navigateur (curl, appel
  // serveur). On laisse passer, les autres contrôles d'authentification
  // s'appliquent.
  if (!origin) {
    return NextResponse.next();
  }

  const allowed = new Set<string>();
  allowed.add(request.nextUrl.origin);

  const host = request.headers.get("host");
  if (host) {
    allowed.add(`https://${host}`);
    allowed.add(`http://${host}`);
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    allowed.add(process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ""));
  }

  if (allowed.has(origin)) {
    return NextResponse.next();
  }

  return NextResponse.json(
    { error: "Origine non autorisée." },
    { status: 403 },
  );
}

export const config = {
  // On ignore les fichiers statiques : le contrôle ne concerne que les routes
  // applicatives.
  matcher: ["/((?!_next/static|_next/image|favicon.svg|.*\\.(?:png|jpg|jpeg|svg|webp|avif|ico|txt|xml)$).*)"],
};
