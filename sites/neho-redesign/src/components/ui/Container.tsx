import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/format";

export function Container({
  as,
  className,
  children,
  narrow,
}: {
  as?: ElementType<{ className?: string; children?: ReactNode }>;
  className?: string;
  children: ReactNode;
  narrow?: boolean;
}) {
  const Component = as ?? "div";
  return (
    <Component className={cn("mx-auto w-full px-5 sm:px-8 lg:px-12", narrow ? "max-w-3xl" : "max-w-[88rem]", className)}>
      {children}
    </Component>
  );
}
