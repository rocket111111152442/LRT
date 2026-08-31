import type { ElementType, ReactNode } from "react";

export function Container({
  children,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return <Tag className={`mx-auto w-full max-w-(--container-page) px-6 md:px-10 lg:px-14 ${className}`}>{children}</Tag>;
}
