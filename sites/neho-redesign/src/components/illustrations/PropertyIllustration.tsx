import { cn } from "@/lib/utils/format";

export type IllustrationVariant = "villa" | "chalet" | "appartement" | "immeuble" | "terrain";

const backgrounds: Record<IllustrationVariant, string> = {
  villa: "from-ivy-100 via-cream-100 to-stone-200",
  chalet: "from-bronze-100 via-cream-100 to-stone-200",
  appartement: "from-stone-200 via-cream-100 to-ivy-100",
  immeuble: "from-stone-300 via-stone-200 to-cream-100",
  terrain: "from-ivy-100 via-stone-200 to-bronze-100",
};

/**
 * Illustration architecturale au trait, générée en SVG — jamais une photo.
 * Choix assumé du concept (voir docs/neho-audit.md §12) : aucune
 * photographie de bien réel ou de stock n'est utilisée, pour ne jamais
 * laisser croire qu'un bien fictif est une véritable annonce.
 */
export function PropertyIllustration({
  variant,
  className,
  label,
}: {
  variant: IllustrationVariant;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        backgrounds[variant],
        className,
      )}
      role="img"
      aria-label={label ?? "Illustration architecturale de démonstration"}
    >
      <svg viewBox="0 0 320 200" className="h-full w-full text-ink-900/70" fill="none" strokeWidth="1.4">
        {variant === "villa" && <VillaLines />}
        {variant === "chalet" && <ChaletLines />}
        {variant === "appartement" && <AppartementLines />}
        {variant === "immeuble" && <ImmeubleLines />}
        {variant === "terrain" && <TerrainLines />}
      </svg>
      <div className="pointer-events-none absolute inset-0 grain" />
    </div>
  );
}

function VillaLines() {
  return (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 150h240" />
      <path d="M70 150V95l60-30 60 30v55" />
      <path d="M70 95h120" />
      <path d="M130 150V115h30v35" />
      <path d="M85 110h20v20H85z" />
      <path d="M175 110h20v20h-20z" />
      <path d="M190 150V100l40-16 40 20v46" opacity="0.55" />
      <path d="M245 150v-30h20v30" opacity="0.55" />
    </g>
  );
}

function ChaletLines() {
  return (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 155h260" />
      <path d="M60 155V100L160 50l100 50v55" />
      <path d="M60 100h200" />
      <path d="M145 155v-45h30v45" />
      <path d="M90 112h18v18H90z" />
      <path d="M212 112h18v18h-18z" />
      <path d="M100 100V70h10v30" opacity="0.5" />
      <path d="M40 165h240" opacity="0.35" />
    </g>
  );
}

function AppartementLines() {
  return (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M60 165h200" />
      <path d="M80 165V45h140v120" />
      {[65, 85, 105, 125].map((y) => (
        <path key={y} d={`M95 ${y}h30M155 ${y}h30M195 ${y}h30`} opacity="0.6" />
      ))}
      <path d="M130 165v-35h30v35" />
    </g>
  );
}

function ImmeubleLines() {
  return (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 168h240" />
      <path d="M55 168V35h95v133" />
      <path d="M165 168V60h100v108" />
      {[50, 70, 90, 110, 130].map((y) => (
        <path key={`a${y}`} d={`M65 ${y}h15M100 ${y}h15M125 ${y}h15`} opacity="0.55" />
      ))}
      {[75, 95, 115, 135].map((y) => (
        <path key={`b${y}`} d={`M180 ${y}h15M210 ${y}h15M240 ${y}h15`} opacity="0.55" />
      ))}
    </g>
  );
}

function TerrainLines() {
  return (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 150c40-18 70-18 100 0s70 18 100 0 60-18 80 0" />
      <path d="M20 165c40-14 70-14 100 0s70 14 100 0 60-14 80 0" opacity="0.5" />
      <path d="M90 150v-40l20-14 20 14v40" opacity="0.35" strokeDasharray="4 4" />
      <path d="M240 70v20M230 80h20" opacity="0.5" />
    </g>
  );
}
