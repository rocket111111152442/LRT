import Image from "next/image";

/**
 * Logotype NATURAL BRUTAL.
 *
 * Par défaut, la marque est composée en typographie : deux lignes empilées,
 * « BRUTAL » nettement plus large que « NATURAL », comme sur le lockup dessiné.
 * Le tout hérite de `currentColor`, donc il fonctionne sur fond clair comme sur
 * fond noir sans second fichier.
 *
 * POUR UTILISER LE LOGO DESSINÉ (panthère + feuillage) :
 * déposer les fichiers dans `public/` sous les noms ci-dessous, puis passer
 * `USE_IMAGE` à `true`. Deux versions sont nécessaires car le dessin ne
 * s'inverse pas tout seul :
 *   public/logo-sombre.png  → version claire, posée sur les fonds noirs
 *   public/logo-clair.png   → version foncée, posée sur les fonds papier
 */
const USE_IMAGE = false;

const SIZES = {
  sm: { natural: "text-[0.62rem]", brutal: "text-[1.15rem]", image: 30 },
  md: { natural: "text-[0.8rem]", brutal: "text-[1.5rem]", image: 40 },
  lg: { natural: "text-[1.3rem]", brutal: "text-[2.45rem]", image: 66 },
} as const;

export function Logo({
  className = "",
  size = "md",
  onDark = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Fond noir : sélectionne la déclinaison claire du logo dessiné. */
  onDark?: boolean;
}) {
  const scale = SIZES[size];

  if (USE_IMAGE) {
    return (
      <Image
        src={onDark ? "/logo-sombre.png" : "/logo-clair.png"}
        alt="NATURAL BRUTAL"
        width={scale.image * 3}
        height={scale.image}
        className={`h-auto w-auto ${className}`}
        priority
      />
    );
  }

  return (
    <span
      className={`inline-flex flex-col items-center leading-none ${className}`}
      aria-label="NATURAL BRUTAL"
    >
      {/* « NATURAL » est lettré large et fin, « BRUTAL » massif : c'est ce
          contraste qui porte le nom, pas un ornement. */}
      <span
        className={`display ${scale.natural} tracking-[0.42em] indent-[0.42em]`}
        aria-hidden="true"
      >
        NATURAL
      </span>
      <span
        className={`display ${scale.brutal} tracking-[0.02em]`}
        aria-hidden="true"
      >
        BRUTAL
      </span>
    </span>
  );
}
