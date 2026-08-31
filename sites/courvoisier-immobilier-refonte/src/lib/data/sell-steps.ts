import type { SceneName } from "@/components/illustrations/scenes";

export interface SellStep {
  number: string;
  title: string;
  description: string;
  scene: SceneName;
}

/**
 * Étapes reconstituées à partir des descriptions confirmées du courtage
 * Courvoisier (estimation en trois formats, positionnement, photos
 * professionnelles, diffusion sur les canaux adaptés, visites, négociation
 * jusqu’à l’acte notarié) — voir docs/courvoisier-audit.md §3.
 */
export const sellSteps: SellStep[] = [
  {
    number: "01",
    title: "Estimation",
    description:
      "En vrai, en visio ou en ligne : une première estimation fondée sur l’emplacement, l’état du bien et le marché local, pour poser une base réaliste.",
    scene: "horizon",
  },
  {
    number: "02",
    title: "Valorisation & positionnement",
    description:
      "Positionnement du bien au juste prix et mise en valeur par des photographies professionnelles, pour présenter le bien sous son meilleur jour.",
    scene: "roofline",
  },
  {
    number: "03",
    title: "Diffusion & visites",
    description:
      "Diffusion sur les canaux adaptés et organisation de visites ciblées, pour toucher les bons acquéreurs sans multiplier les visites inutiles.",
    scene: "facade",
  },
  {
    number: "04",
    title: "Négociation",
    description:
      "Un accompagnement dans la négociation, pour défendre vos intérêts jusqu’à l’accord final avec l’acquéreur.",
    scene: "plan",
  },
  {
    number: "05",
    title: "Acte notarié",
    description:
      "Suivi administratif jusqu’à la signature chez le notaire, pour une transaction menée à son terme sereinement.",
    scene: "staircase",
  },
];
