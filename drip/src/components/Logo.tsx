import Image from "next/image";

/**
 * Identité NATURAL BRUTAL.
 *
 * Le fichier fourni (`logo-natural-brutal.png`) est un carré noir d'environ
 * 415 px de côté : la panthère qui rugit, le feuillage et le nom. Son fond
 * (7,8,8) est à un cheveu de l'encre du site, donc il se fond sans bord
 * visible dans les sections noires. `icone-natural-brutal.png` en est un
 * recadrage carré qui isole la tête et le feuillage, sans le nom.
 *
 * Trois usages, dictés par la lisibilité :
 *
 *  - `variant="lockup"` — le dessin complet, texte compris. Réservé aux fonds
 *    noirs et aux grandes tailles, sinon le nom à l'intérieur devient illisible.
 *  - `variant="mark"` (défaut) — la tête de panthère seule, accolée au nom
 *    composé en typographie.
 *  - `variant="wordmark"` — le nom seul. C'est ce que porte la barre de
 *    navigation : à 30 px le dessin se referme en tache noire, le nom composé
 *    reste net et le blanc autour respire.
 *
 * Le fichier source fait 415 px : au-delà d'environ 370 px d'affichage il
 * commencera à manquer de définition. Un export plus grand règlera ça sans
 * toucher au code.
 */

const SIZES = {
  sm: { mark: 30, natural: "text-[0.54rem]", brutal: "text-[1rem]", lockup: 74 },
  md: { mark: 40, natural: "text-[0.7rem]", brutal: "text-[1.3rem]", lockup: 104 },
  lg: { mark: 56, natural: "text-[1rem]", brutal: "text-[1.9rem]", lockup: 150 },
} as const;

export function Logo({
  className = "",
  size = "md",
  variant = "mark",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "mark" | "wordmark" | "lockup";
}) {
  const scale = SIZES[size];

  if (variant === "lockup") {
    return (
      <Image
        src="/logo-natural-brutal.png"
        alt="NATURAL BRUTAL"
        width={scale.lockup}
        height={Math.round(scale.lockup * (408 / 415))}
        className={`h-auto ${className}`}
        priority
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2.5 leading-none ${className}`}
      aria-label="NATURAL BRUTAL"
    >
      {variant === "mark" && (
        <Image
          src="/icone-natural-brutal.png"
          alt=""
          width={scale.mark}
          height={scale.mark}
          className="shrink-0"
          priority
        />
      )}

      <span className="flex flex-col" aria-hidden="true">
        <span className={`display ${scale.natural} tracking-[0.36em] indent-[0.36em]`}>
          NATURAL
        </span>
        <span className={`display ${scale.brutal} tracking-[0.02em]`}>BRUTAL</span>
      </span>
    </span>
  );
}
