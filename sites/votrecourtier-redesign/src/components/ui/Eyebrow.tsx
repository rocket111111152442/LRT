import { cn } from "@/lib/utils/cn";

export function Eyebrow({
  children,
  index,
  className,
}: {
  children: React.ReactNode;
  index?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-clay", className)}>
      {index ? <span className="font-feature-numeric text-ink-faint">{index}</span> : null}
      <span>{children}</span>
    </div>
  );
}
