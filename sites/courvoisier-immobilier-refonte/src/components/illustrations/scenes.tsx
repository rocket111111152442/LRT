import type { SVGProps } from "react";

type SceneProps = SVGProps<SVGSVGElement>;

const wrap = (props: SceneProps) => ({
  viewBox: "0 0 640 480",
  preserveAspectRatio: "xMidYMid slice",
  className: "absolute inset-0 h-full w-full",
  ...props,
});

/** Léman et les Alpes vues de La Côte — horizon en lignes superposées. */
export function LakeHorizonScene(props: SceneProps) {
  return (
    <svg {...wrap(props)}>
      <circle cx="480" cy="120" r="46" stroke="currentColor" strokeWidth="1" opacity="0.5" fill="none" />
      <path
        d="M0 210 L60 178 L118 198 L172 150 L230 196 L288 168 L344 204 L402 160 L460 200 L520 172 L580 206 L640 182"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
      />
      <path
        d="M0 260 L80 232 L150 252 L210 214 L270 250 L330 226 L392 258 L452 220 L520 254 L580 230 L640 252"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.8"
      />
      <line x1="0" y1="300" x2="640" y2="300" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M0 300 L640 300 L640 480 L0 480 Z"
        fill="currentColor"
        opacity="0.06"
      />
      {Array.from({ length: 7 }).map((_, i) => (
        <line
          key={i}
          x1="0"
          x2="640"
          y1={310 + i * 22}
          y2={310 + i * 22}
          stroke="currentColor"
          strokeWidth="0.5"
          opacity={0.14 - i * 0.012}
        />
      ))}
    </svg>
  );
}

/** Façade contemporaine — trame de fenêtres et ombres portées. */
export function FacadeScene(props: SceneProps) {
  const cols = 6;
  const rows = 5;
  const gap = 14;
  const w = (640 - gap * (cols + 1)) / cols;
  const h = (480 - gap * (rows + 1)) / rows;

  return (
    <svg {...wrap(props)}>
      <rect x="0" y="0" width="640" height="480" fill="currentColor" opacity="0.03" />
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const x = gap + c * (w + gap);
          const y = gap + r * (h + gap);
          const lit = (r * cols + c) % 5 === 1 || (r * cols + c) % 7 === 3;
          return (
            <rect
              key={`${r}-${c}`}
              x={x}
              y={y}
              width={w}
              height={h}
              fill={lit ? "currentColor" : "none"}
              fillOpacity={lit ? 0.1 : 0}
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })
      )}
      <line x1="0" y1="0" x2="640" y2="0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Vignes en terrasses de La Côte — lignes topographiques. */
export function ContourScene(props: SceneProps) {
  const rows = 12;
  return (
    <svg {...wrap(props)}>
      {Array.from({ length: rows }).map((_, i) => {
        const y = 40 + i * 34;
        const amp = 10 + (i % 3) * 4;
        return (
          <path
            key={i}
            d={`M-20 ${y} Q 140 ${y - amp} 320 ${y} T 660 ${y}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={i % 4 === 0 ? 1.25 : 0.75}
            opacity={0.28 + (i % 4 === 0 ? 0.22 : 0)}
          />
        );
      })}
    </svg>
  );
}

/** Plan architectural abstrait — traits de cloisons et repère nord. */
export function PlanScene(props: SceneProps) {
  return (
    <svg {...wrap(props)}>
      <rect x="60" y="60" width="520" height="360" fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.7" />
      <line x1="260" y1="60" x2="260" y2="260" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="260" y1="260" x2="580" y2="260" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="400" y1="260" x2="400" y2="420" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="60" y1="330" x2="260" y2="330" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <g opacity="0.6">
        <circle cx="540" cy="100" r="22" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M540 84v32M524 100h32" stroke="currentColor" strokeWidth="0.75" />
      </g>
      {[
        [90, 60],
        [220, 60],
        [340, 260],
        [520, 260],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} v-16`} stroke="currentColor" strokeWidth="1" opacity="0.6" />
      ))}
    </svg>
  );
}

/** Escalier en coupe — nez de marche, contremarches et main courante. */
export function StaircaseScene(props: SceneProps) {
  const steps = 8;
  const stepW = 56;
  const stepH = 34;
  const startX = 90;
  const startY = 380;
  const treads: string[] = [];
  for (let i = 0; i < steps; i++) {
    const x = startX + i * stepW;
    const y = startY - i * stepH;
    treads.push(`${i === 0 ? "M" : "L"}${x} ${y}`, `L${x + stepW} ${y}`);
  }
  return (
    <svg {...wrap(props)}>
      <path d={treads.join(" ")} fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.75" />
      <path
        d={`M${startX} ${startY + 46} L${startX + steps * stepW} ${startY - (steps - 1) * stepH + 46}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.4"
      />
      <line
        x1={startX - 10}
        y1={startY + 60}
        x2={startX + steps * stepW + 10}
        y2={startY + 60}
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.6"
      />
    </svg>
  );
}

/** Villa — toiture à deux pans et lignes de façade épurées. */
export function RooflineScene(props: SceneProps) {
  return (
    <svg {...wrap(props)}>
      <path
        d="M40 260 L200 150 L360 260"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.75"
      />
      <path d="M60 260 V400 H340 V260" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <rect x="110" y="300" width="46" height="60" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <rect x="230" y="300" width="46" height="60" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <path
        d="M420 340 L540 260 L640 320"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.35"
      />
      <line x1="0" y1="400" x2="640" y2="400" stroke="currentColor" strokeWidth="1.5" opacity="0.65" />
      <line x1="0" y1="430" x2="640" y2="430" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
    </svg>
  );
}

export const SCENES = {
  horizon: LakeHorizonScene,
  facade: FacadeScene,
  contour: ContourScene,
  plan: PlanScene,
  staircase: StaircaseScene,
  roofline: RooflineScene,
} as const;

export type SceneName = keyof typeof SCENES;
