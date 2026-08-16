/**
 * Encart affiché tant que les informations légales de l'entreprise ne sont pas
 * renseignées dans les variables d'environnement.
 *
 * Ces mentions sont obligatoires en France (article 6 III de la LCEN et
 * article L221-5 du code de la consommation) : mieux vaut un rappel visible
 * qu'un texte publié avec des champs vides.
 */
export function LegalNotice({ missing }: { missing: string[] }) {
  if (missing.length === 0) return null;

  return (
    <aside className="mb-12 border border-[color:var(--color-ink)] bg-[rgba(11,11,11,0.04)] p-6">
      <p className="label mb-3">À compléter avant l&apos;ouverture</p>
      <p className="mb-4 text-sm leading-relaxed">
        Ces informations sont légalement obligatoires pour vendre en ligne en
        France. Renseignez-les dans les variables d&apos;environnement du projet
        (voir le fichier <code className="font-mono text-xs">.env.example</code>) :
      </p>
      <ul className="list-disc pl-5 text-sm">
        {missing.map((item) => (
          <li key={item} className="mb-1 font-mono text-xs">
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** Liste les mentions légales encore absentes de la configuration. */
export function missingLegalInfo(shop: {
  legalName: string;
  address: string;
  siret: string;
  email: string;
}) {
  const missing: string[] = [];

  if (!shop.address) missing.push("NEXT_PUBLIC_SHOP_ADDRESS — adresse du siège");
  if (!shop.siret) missing.push("NEXT_PUBLIC_SHOP_SIRET — numéro SIRET / RCS");
  if (!shop.email || shop.email.includes("naturalbrutal.fr")) {
    missing.push("NEXT_PUBLIC_SHOP_EMAIL — adresse de contact réelle");
  }

  return missing;
}
