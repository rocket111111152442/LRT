import { cn } from "@/lib/utils/format";
import type { Agent } from "@/lib/data/types";

const toneGradients: Record<Agent["photoTone"], string> = {
  warm: "from-bronze-300 via-bronze-500 to-ivy-700",
  cool: "from-ivy-300 via-ivy-500 to-night-800",
  neutral: "from-stone-300 via-stone-400 to-ink-700",
};

/**
 * Avatar géométrique généré (pas une photo) : garantit qu'aucun agent
 * fictif de démonstration n'est présenté avec un visage qui pourrait
 * passer pour une vraie photo de collaborateur.
 */
export function AgentAvatar({ agent, size = 96, className }: { agent: Agent; size?: number; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br font-display text-cream-50",
        toneGradients[agent.photoTone],
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-25"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <circle cx="20" cy="15" r="35" fill="white" fillOpacity="0.25" />
        <circle cx="85" cy="90" r="40" fill="black" fillOpacity="0.15" />
      </svg>
      <span className="relative">{agent.initials}</span>
    </div>
  );
}
