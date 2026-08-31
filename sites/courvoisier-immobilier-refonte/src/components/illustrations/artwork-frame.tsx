import type { ReactNode } from "react";

interface ArtworkFrameProps {
  children: ReactNode;
  tone?: "ivory" | "stone" | "ink" | "green";
  ratio?: "square" | "portrait" | "landscape" | "wide" | "full";
  caption?: string;
  className?: string;
}

const TONE_BG: Record<NonNullable<ArtworkFrameProps["tone"]>, string> = {
  ivory: "bg-paper text-[var(--color-ink)]",
  stone: "bg-stone text-[var(--color-ink)]",
  ink: "bg-[var(--color-ink)] text-[var(--color-ivory)]",
  green: "bg-[var(--color-green)] text-[var(--color-ivory)]",
};

const RATIO_CLASS: Record<NonNullable<ArtworkFrameProps["ratio"]>, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/10]",
  full: "h-full",
};

/**
 * Cadre pour le système d’illustrations architecturales qui tient lieu de
 * photographie dans ce concept — voir README (aucun accès aux visuels
 * réels de l’agence au moment de l’audit). La légende visible est traitée
 * comme une légende de planche éditoriale (convention de magazine
 * d’architecture) ; la mention explicite « illustration de démonstration »
 * vit dans le markup pour les technologies d’assistance et dans le code,
 * pas comme un bandeau visuel qui casserait la direction artistique.
 */
export function ArtworkFrame({
  children,
  tone = "stone",
  ratio = "landscape",
  caption,
  className = "",
}: ArtworkFrameProps) {
  return (
    <figure
      role="img"
      aria-label={caption ? `Illustration de démonstration — ${caption}` : "Illustration de démonstration"}
      className={`relative overflow-hidden ${TONE_BG[tone]} ${RATIO_CLASS[ratio]} ${className}`}
    >
      {children}
      {caption && (
        <figcaption aria-hidden="true" className="absolute bottom-3 left-3 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-current opacity-70">
          — {caption}
        </figcaption>
      )}
    </figure>
  );
}
