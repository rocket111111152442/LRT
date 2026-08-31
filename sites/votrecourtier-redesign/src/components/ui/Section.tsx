import { cn } from "@/lib/utils/cn";

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  tone?: "paper" | "dim" | "pine";
  compact?: boolean;
  id?: string;
};

const tones: Record<NonNullable<SectionProps["tone"]>, string> = {
  paper: "bg-paper text-ink",
  dim: "bg-paper-dim text-ink",
  pine: "bg-pine text-paper",
};

export function Section({ tone = "paper", compact, className, children, ...props }: SectionProps) {
  return (
    <section
      className={cn("relative", compact ? "py-20 sm:py-24" : "py-24 sm:py-28 lg:py-36", tones[tone], className)}
      {...props}
    >
      {children}
    </section>
  );
}
