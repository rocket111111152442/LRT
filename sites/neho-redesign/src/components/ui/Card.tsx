import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/format";

export function Card({
  as,
  className,
  children,
  hover = true,
}: {
  as?: ElementType<{ className?: string; children?: ReactNode }>;
  className?: string;
  children: ReactNode;
  hover?: boolean;
}) {
  const Component = as ?? "div";
  return (
    <Component
      className={cn(
        "rounded-2xl border border-stone-200 bg-cream-50 shadow-soft",
        hover && "transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        className,
      )}
    >
      {children}
    </Component>
  );
}
