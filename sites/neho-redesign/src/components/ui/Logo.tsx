import { cn } from "@/lib/utils/format";

/**
 * Wordmark "négo" en lockup coloré (fond indigo, minuscules, blanc) —
 * un seul bloc de marque plutôt qu'un badge rond + texte séparé, dans
 * l'esprit d'un wordmark de marque réel. Le nom complet "Ného Concept"
 * reste toujours affiché à côté pour marquer la distance avec
 * l'identité réelle (voir docs/neho-audit.md).
 */
export function Logo({ size = "md", className }: { size?: "sm" | "md"; className?: string }) {
  const sizes: Record<string, string> = {
    sm: "px-2.5 py-1 text-sm rounded-lg",
    md: "px-3 py-1.5 text-base rounded-xl",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center bg-ivy-600 font-sans font-bold lowercase leading-none tracking-tight text-cream-50",
        sizes[size],
        className,
      )}
    >
      négo
    </span>
  );
}
