import type { SVGProps } from "react";

/**
 * Système d’icônes maison — traits fins (1.25px), cohérents avec la
 * typographie éditoriale. Volontairement réduit à ce dont les
 * interactions ont besoin plutôt qu’un jeu d’icônes générique.
 */
function base(props: SVGProps<SVGSVGElement>) {
  return {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function IconArrowUpRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

export function IconArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h16" />
      <path d="M14 6l6 6-6 6" />
    </svg>
  );
}

export function IconMenu(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function IconClose(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export function IconChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconPhone(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2 2C10.5 19 5 13.5 5 6a2 2 0 0 1 1-2Z" />
    </svg>
  );
}

export function IconPin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.25" />
    </svg>
  );
}

export function IconCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function IconBed(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
      <path d="M3 18v2M21 18v2" />
      <path d="M3 12V7a2 2 0 0 1 2-2h5v5" />
    </svg>
  );
}

export function IconRuler(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="9" width="18" height="6" rx="1" />
      <path d="M7 9v3M11 9v3M15 9v3M19 9v3" />
    </svg>
  );
}
