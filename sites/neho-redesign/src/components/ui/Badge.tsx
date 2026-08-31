import { cn } from "@/lib/utils/format";

export function Badge({
  children,
  tone = "ivy",
  className,
}: {
  children: React.ReactNode;
  tone?: "ivy" | "bronze" | "stone" | "cream";
  className?: string;
}) {
  const tones: Record<string, string> = {
    ivy: "bg-ivy-100 text-ivy-700",
    bronze: "bg-bronze-100 text-bronze-700",
    stone: "bg-stone-200 text-ink-700",
    cream: "bg-cream-50/15 text-cream-50 border border-cream-50/25",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DemoBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-bronze-500/60 bg-bronze-100 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-bronze-700",
        className,
      )}
      role="note"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M6 1 7.4 4.3 11 4.7 8.3 7 9 10.6 6 8.7 3 10.6 3.7 7 1 4.7 4.6 4.3Z" fill="currentColor" />
      </svg>
      {label}
    </span>
  );
}
