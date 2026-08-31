/**
 * Injecte un bloc JSON-LD. `data` doit provenir de src/lib/seo/jsonld.ts
 * (jamais de valeurs saisies librement) pour éviter tout XSS via JSON-LD.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify d'un objet contrôlé côté serveur (src/lib/seo/jsonld.ts), pas d'entrée utilisateur brute.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
