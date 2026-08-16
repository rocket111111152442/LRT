import Image from "next/image";

/**
 * Identité NATURAL BRUTAL.
 *
 * Le fichier fourni est un carré noir de 165 px de côté : la panthère, le
 * feuillage et le nom. Son fond (7,8,8) est à un cheveu de l'encre du site,
 * donc il se fond sans bord visible dans les sections noires.
 *
 * Deux usages, dictés par la lisibilité :
 *
 *  - `variant="lockup"` — le dessin complet, texte compris. Réservé aux fonds
 *    noirs et aux grandes tailles, sinon le nom à l'intérieur devient illisible.
 *  - `variant="mark"` (défaut) — la tête de panthère seule, accolée au nom
 *    composé en typographie. C'est ce qui tient dans une barre de navigation :
 *    le dessin reste reconnaissable à 34 px, le nom reste net.
 *
 * Le fichier source ne fait que 165 px : au-delà d'environ 150 px d'affichage
 * il commencera à manquer de définition. Un export plus grand règlera ça sans
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
  variant?: "mark" | "lockup";
}) {
  const scale = SIZES[size];

  if (variant === "lockup") {
    return (
      <Image
        src="/logo-natural-brutal.png"
        alt="NATURAL BRUTAL"
        width={scale.lockup}
        height={Math.round(scale.lockup * (162 / 165))}
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
      <Image
        src="/icone-natural-brutal.png"
        alt=""
        width={scale.mark}
        height={scale.mark}
        className="shrink-0"
        priority
      />

      <span className="flex flex-col" aria-hidden="true">
        <span className={`display ${scale.natural} tracking-[0.36em] indent-[0.36em]`}>
          NATURAL
        </span>
        <span className={`display ${scale.brutal} tracking-[0.02em]`}>BRUTAL</span>
      </span>
    </span>
  );
}
