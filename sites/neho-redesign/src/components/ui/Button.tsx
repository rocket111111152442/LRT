import Link from "next/link";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils/format";

const variants = {
  primary: "bg-ivy-600 text-cream-50 hover:bg-ivy-700 shadow-soft",
  dark: "bg-ink-900 text-cream-50 hover:bg-night-800 shadow-soft",
  outline: "border border-ink-900/20 text-ink-900 hover:border-ink-900 hover:bg-ink-900/5",
  "outline-light": "border border-cream-50/40 text-cream-50 hover:border-cream-50 hover:bg-cream-50/10",
  ghost: "text-ink-900 hover:bg-ink-900/5",
  bronze: "bg-bronze-500 text-ink-900 hover:bg-bronze-600 hover:text-cream-50 shadow-soft",
} as const;

const sizes = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-[0.95rem] gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  magnetic?: boolean;
  className?: string;
}

type ButtonAsButton = BaseButtonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof BaseButtonProps> & { href?: undefined };

type ButtonAsLink = BaseButtonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof BaseButtonProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const base =
  "inline-flex items-center justify-center rounded-full font-medium tracking-tight transition-all duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

export function Button({ variant = "primary", size = "md", magnetic, className, ...props }: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], magnetic && "js-magnetic", className);

  if ("href" in props && props.href) {
    const { href, ...rest } = props as ButtonAsLink;
    return <Link href={href} className={classes} {...rest} />;
  }

  const { type = "button", ...rest } = props as ButtonAsButton;
  return <button type={type} className={classes} {...rest} />;
}

export function IconWrap({ as, className, children }: { as?: ElementType<{ className?: string; children?: React.ReactNode }>; className?: string; children: React.ReactNode }) {
  const Component = as ?? "span";
  return <Component className={cn("inline-flex shrink-0", className)}>{children}</Component>;
}
