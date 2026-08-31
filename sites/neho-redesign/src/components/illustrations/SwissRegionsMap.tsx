import { coveredCantons } from "@/config/site";
import { cantonMapPositions as nodes } from "@/lib/data/canton-map-positions";
import { cn } from "@/lib/utils/format";

/**
 * Carte stylisée (géométrie facettée volontairement abstraite, pas un
 * tracé cartographique exact) reliant les antennes régionales. Chaque
 * nœud correspond à un canton du jeu de démonstration. L'animation des
 * lignes est ajoutée côté client par components/home/RegionsMapAnimated.
 */

const facets = [
  "M40,235 L120,55 L150,108 L62,210 Z",
  "M120,55 L280,40 L210,150 L150,108 Z",
  "M150,108 L210,150 L230,235 L130,170 L62,210 Z",
  "M210,150 L280,40 L300,180 L230,235 Z",
  "M62,210 L130,170 L100,270 L20,260 Z",
];

export function SwissRegionsMap({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 300"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="Carte stylisée de la Suisse romande indiquant les cantons couverts par le réseau de démonstration"
    >
      <g className="regions-map-facets">
        {facets.map((d, i) => (
          <path
            key={d}
            d={d}
            fill={i % 2 === 0 ? "var(--color-ivy-700)" : "var(--color-night-700)"}
            fillOpacity="0.55"
            stroke="var(--color-night-line)"
            strokeWidth="1"
          />
        ))}
      </g>

      <g className="regions-map-lines" stroke="var(--color-bronze-300)" strokeWidth="1" strokeDasharray="4 4" opacity="0.7">
        <line x1={nodes.vaud.x} y1={nodes.vaud.y} x2={nodes.geneve.x} y2={nodes.geneve.y} className="map-line" />
        <line x1={nodes.vaud.x} y1={nodes.vaud.y} x2={nodes.fribourg.x} y2={nodes.fribourg.y} className="map-line" />
        <line x1={nodes.vaud.x} y1={nodes.vaud.y} x2={nodes.neuchatel.x} y2={nodes.neuchatel.y} className="map-line" />
        <line x1={nodes.neuchatel.x} y1={nodes.neuchatel.y} x2={nodes.jura.x} y2={nodes.jura.y} className="map-line" />
        <line x1={nodes.fribourg.x} y1={nodes.fribourg.y} x2={nodes.valais.x} y2={nodes.valais.y} className="map-line" />
      </g>

      <g className="regions-map-nodes">
        {coveredCantons.map((canton) => {
          const pos = nodes[canton.slug];
          if (!pos) return null;
          return (
            <g key={canton.slug} className="map-node" transform={`translate(${pos.x} ${pos.y})`}>
              <circle r="10" fill="var(--color-bronze-500)" opacity="0.25" />
              <circle r="4.5" fill="var(--color-bronze-300)" stroke="var(--color-cream-50)" strokeWidth="1.5" />
              <text x="10" y="4" fontSize="10" fill="var(--color-cream-50)" className="font-sans font-medium">
                {canton.name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
