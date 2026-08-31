"use client";

import type { ElementType, ReactNode } from "react";
import { useReveal } from "@/lib/hooks/use-reveal";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
  mask?: boolean;
}

export function Reveal({ children, as: Tag = "div", delay = 0, className = "", mask = false }: RevealProps) {
  const { ref, isVisible } = useReveal<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      className={`${mask ? "reveal-mask" : "reveal"} ${isVisible ? "reveal-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {mask ? <span>{children}</span> : children}
    </Tag>
  );
}
