import { cn } from "@/lib/utils/format";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-xs font-semibold uppercase tracking-[0.14em]",
            tone === "dark" ? "text-ivy-300" : "text-ivy-600",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "text-3xl sm:text-4xl lg:text-[2.75rem] font-medium",
          tone === "dark" ? "text-cream-50" : "text-ink-900",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className={cn("mt-4 text-base sm:text-lg leading-relaxed", tone === "dark" ? "text-cream-50/75" : "text-ink-500")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
