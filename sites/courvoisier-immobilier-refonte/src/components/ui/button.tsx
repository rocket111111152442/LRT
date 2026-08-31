import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { IconArrowUpRight } from "./icons";

interface SharedProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  showArrow?: boolean;
  className?: string;
}

const VARIANT_CLASS: Record<NonNullable<SharedProps["variant"]>, string> = {
  primary: "bg-[var(--color-ink)] text-[var(--color-ivory)] hover:bg-[var(--color-green)]",
  secondary: "border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)]",
  ghost: "text-[var(--color-ink)] hover:opacity-60",
};

const SIZE_CLASS: Record<NonNullable<SharedProps["size"]>, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

const base =
  "group inline-flex items-center gap-2.5 font-sans tracking-[0.01em] transition-colors duration-300 ease-out";

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  showArrow = true,
  className = "",
  ...rest
}: SharedProps & { href: string }) {
  return (
    <Link href={href} className={`${base} ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`} {...rest}>
      <span>{children}</span>
      {showArrow && (
        <IconArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
    </Link>
  );
}

export function ButtonAction({
  children,
  variant = "primary",
  size = "md",
  showArrow = true,
  className = "",
  ...rest
}: SharedProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`} {...rest}>
      <span>{children}</span>
      {showArrow && (
        <IconArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
    </button>
  );
}
