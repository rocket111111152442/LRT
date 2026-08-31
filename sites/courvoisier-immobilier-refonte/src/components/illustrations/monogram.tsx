interface MonogramProps {
  name: string;
  tone?: "stone" | "green";
  className?: string;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Portrait éditorial de substitution — un monogramme dessiné, pas une
 * photo ronde générique. Utilisé tant qu’aucun portrait réel n’est fourni.
 */
export function Monogram({ name, tone = "stone", className = "" }: MonogramProps) {
  const bg = tone === "green" ? "bg-[var(--color-green)] text-[var(--color-ivory)]" : "bg-stone text-[var(--color-ink)]";
  return (
    <div className={`relative flex aspect-[4/5] items-center justify-center ${bg} ${className}`}>
      <span className="font-serif text-6xl italic tracking-tight opacity-80">{initials(name)}</span>
      <span className="absolute bottom-3 left-3 font-sans text-[0.6rem] uppercase tracking-[0.2em] opacity-70">
        Portrait à venir
      </span>
    </div>
  );
}
