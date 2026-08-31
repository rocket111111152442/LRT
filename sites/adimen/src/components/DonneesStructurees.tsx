/**
 * Insère un bloc JSON-LD.
 *
 * La valeur est produite par les fabriques de `src/lib/jsonld.ts` : la
 * sérialisation ne porte donc que des données maîtrisées, jamais une saisie
 * de visiteur.
 */
export default function DonneesStructurees({ donnees }: { donnees: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(donnees) }}
    />
  );
}
