import { cn } from "@/lib/utils/cn";

/**
 * Système d'illustrations au trait, dessinées en SVG — jamais une photo de
 * stock. Choix assumé : aucun bien fictif de démonstration n'est présenté
 * avec une photographie qui pourrait laisser croire à une véritable
 * annonce, et la direction artistique (relevés architecturaux au trait,
 * palette pierre/pin/terre cuite) reste cohérente sur tout le site. Voir
 * docs/votrecourtier-audit.md §7.
 */

export type SceneVariant =
  | "villa"
  | "appartement"
  | "terrain"
  | "projet-neuf"
  | "investissement"
  | "bureau"
  | "hero"
  | "paysage";

const backgrounds: Record<SceneVariant, string> = {
  villa: "from-[#efe6d4] via-[#e7dbc4] to-[#d8c6a6]",
  appartement: "from-[#e3ded1] via-[#d7cfba] to-[#c3b697]",
  terrain: "from-[#e9e2cd] via-[#ddd0ab] to-[#c9b783]",
  "projet-neuf": "from-[#e2ddd0] via-[#d2c9b3] to-[#b9ab86]",
  investissement: "from-[#e6e0d2] via-[#d6cbaf] to-[#bfae88]",
  bureau: "from-[#22312a] via-[#1c2721] to-[#161f1a]",
  hero: "from-[#2c3a32] via-[#1c2921] to-[#0f1611]",
  paysage: "from-[#243329] via-[#18231d] to-[#101713]",
};

const darkVariants: SceneVariant[] = ["bureau", "hero", "paysage"];

export function ArchitecturalScene({
  variant,
  className,
  label,
}: {
  variant: SceneVariant;
  className?: string;
  label?: string;
}) {
  const dark = darkVariants.includes(variant);

  return (
    <div
      className={cn("relative overflow-hidden bg-gradient-to-br", backgrounds[variant], className)}
      role="img"
      aria-label={label ?? "Illustration architecturale de démonstration"}
    >
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className={cn("absolute inset-0 h-full w-full", dark ? "text-paper/80" : "text-ink/60")}
        fill="none"
        strokeWidth="1.3"
      >
        {variant === "villa" && <VillaScene />}
        {variant === "appartement" && <AppartementScene />}
        {variant === "terrain" && <TerrainScene />}
        {variant === "projet-neuf" && <ProjetNeufScene />}
        {variant === "investissement" && <InvestissementScene />}
        {variant === "bureau" && <BureauScene />}
        {variant === "hero" && <HeroScene />}
        {variant === "paysage" && <PaysageScene />}
      </svg>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

function VillaScene() {
  return (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 230h400" opacity="0.5" />
      <path d="M60 230v-70l70-38 70 38v70" />
      <path d="M60 160h140" />
      <path d="M120 230v-45h34v45" />
      <path d="M78 172h24v24H78z" />
      <path d="M178 172h24v24h-24z" />
      <path d="M210 230v-56l52-20 52 24v52" opacity="0.55" />
      <path d="M275 230v-34h24v34" opacity="0.55" />
      <path d="M300 230v-90" opacity="0.3" />
      <path d="M20 230v-14l14-10" opacity="0.35" />
    </g>
  );
}

function AppartementScene() {
  return (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 250h400" opacity="0.5" />
      <path d="M90 250V70h180v180" />
      <path d="M90 70h180" opacity="0.7" />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={112 + col * 52}
            y={92 + row * 38}
            width="30"
            height="22"
            opacity={0.6}
          />
        )),
      )}
      <path d="M170 250v-58h30v58" opacity="0.7" />
    </g>
  );
}

function TerrainScene() {
  return (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M50 90 L330 100 L300 230 L70 220 Z" strokeDasharray="4 5" />
      <path d="M50 90 L40 80 M40 80 L46 88 M40 80 L48 76" opacity="0.6" />
      <path d="M330 100 L340 92 M340 92 L334 100 M340 92 L344 84" opacity="0.6" />
      <path d="M300 230 L310 238 M310 238 L302 240 M310 238 L316 232" opacity="0.6" />
      <path d="M70 220 L58 226 M58 226 L64 232 M58 226 L52 220" opacity="0.6" />
      <path d="M110 150h20M150 150h20M190 150h20M230 150h20" opacity="0.3" />
      <path d="M120 240 q70 -18 150 0" opacity="0.35" />
    </g>
  );
}

function ProjetNeufScene() {
  return (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 250h400" opacity="0.5" />
      <path d="M110 250V110h140v140" strokeDasharray="3 4" />
      <path d="M110 110h140" opacity="0.7" />
      <path d="M300 250V60" />
      <path d="M300 60h70" />
      <path d="M300 60l-14 14M340 60l14 12" opacity="0.6" />
      <path d="M300 90h-40" opacity="0.5" />
      <path d="M260 90v10" opacity="0.5" />
      {[0, 1, 2].map((row) => (
        <path key={row} d={`M130 ${140 + row * 34}h100`} opacity="0.3" />
      ))}
    </g>
  );
}

function InvestissementScene() {
  return (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 250h400" opacity="0.5" />
      <path d="M40 250V130h100v120" />
      <path d="M140 250V90h120v160" />
      <path d="M260 250V150h100v100" />
      {[0, 1, 2].map((row) =>
        [0, 1].map((col) => <rect key={`a${row}-${col}`} x={58 + col * 40} y={150 + row * 26} width="22" height="16" opacity="0.5" />),
      )}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2].map((col) => <rect key={`b${row}-${col}`} x={156 + col * 32} y={108 + row * 26} width="18" height="16" opacity="0.5" />),
      )}
      {[0, 1].map((row) =>
        [0, 1, 2].map((col) => <rect key={`c${row}-${col}`} x={276 + col * 26} y={168 + row * 26} width="16" height="16" opacity="0.5" />),
      )}
    </g>
  );
}

function BureauScene() {
  return (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 260h320" opacity="0.4" />
      <rect x="70" y="150" width="150" height="70" rx="2" opacity="0.7" />
      <path d="M70 175h150" opacity="0.4" />
      <path d="M100 150v70M140 150v70M180 150v70" opacity="0.3" />
      <path d="M260 260V150" />
      <path d="M260 150c0-16 26-16 26 0v10" />
      <ellipse cx="286" cy="168" rx="14" ry="8" opacity="0.7" />
      <path d="M40 130h340" opacity="0.25" />
      <path d="M330 260V90h50v170" opacity="0.3" />
    </g>
  );
}

function HeroScene() {
  return (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 210 L90 140 L170 210 Z" opacity="0.28" />
      <path d="M140 210 L250 110 L360 210 Z" opacity="0.22" />
      <path d="M0 260h400" opacity="0.5" />
      <path d="M130 260v-92l60-34 60 34v92" />
      <path d="M130 168h120" opacity="0.8" />
      <path d="M190 260v-52h26v52" opacity="0.7" />
      <path d="M152 182h22v24h-22z" opacity="0.6" />
      <path d="M226 182h22v24h-22z" opacity="0.6" />
      <path d="M250 260v-70l58-24 58 26v68" opacity="0.4" />
      <path d="M310 260v-38h26v38" opacity="0.4" />
      <path d="M40 260v-10l16-10 16 10v10" opacity="0.3" />
    </g>
  );
}

function PaysageScene() {
  return (
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 190 L70 120 L140 190 Z" opacity="0.3" />
      <path d="M100 210 L200 100 L300 210 Z" opacity="0.24" />
      <path d="M240 200 L320 140 L400 200 Z" opacity="0.3" />
      <path d="M0 240h400" opacity="0.5" />
      <path d="M60 240v-30l20-14 20 14v30" opacity="0.6" />
      <path d="M0 260h400" opacity="0.15" />
    </g>
  );
}
