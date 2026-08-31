import { ArtworkFrame } from "./artwork-frame";
import { SCENES, type SceneName } from "./scenes";

interface ArtworkProps {
  scene: SceneName;
  tone?: "ivory" | "stone" | "ink" | "green";
  ratio?: "square" | "portrait" | "landscape" | "wide" | "full";
  className?: string;
  caption?: string;
  showCaption?: boolean;
}

const DEFAULT_CAPTIONS: Record<SceneName, string> = {
  horizon: "Léman & arc lémanique",
  facade: "Architecture contemporaine",
  contour: "Terrasses de La Côte",
  plan: "Plan architectural",
  staircase: "Détail architectural",
  roofline: "Villa contemporaine",
};

export function Artwork({ scene, tone, ratio, className, caption, showCaption = true }: ArtworkProps) {
  const Scene = SCENES[scene];
  return (
    <ArtworkFrame tone={tone} ratio={ratio} className={className} caption={showCaption ? caption ?? DEFAULT_CAPTIONS[scene] : undefined}>
      <Scene />
    </ArtworkFrame>
  );
}
