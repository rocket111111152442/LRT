import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ButtonBaseProps = {
  variant?: "primary" | "secondary" | "ghost" | "inverse";
  size?: "sm" | "md";
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

const base =
  "group relative inline-flex items-center gap-2.5 font-medium tracking-[0.01em] transition-colors duration-300 ease-out-soft focus-visible:outline-offset-4";

const sizes: Record<NonNullable<ButtonBaseProps["size"]>, string> = {
  sm: "px-5 py-2.5 text-[0.8125rem]",
  md: "px-7 py-3.5 text-sm",
};

const variants: Record<NonNullable<ButtonBaseProps["variant"]>, string> = {
  primary: "bg-pine text-paper hover:bg-pine-dim",
  secondary: "border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink hover:text-clay",
  inverse: "bg-paper text-ink hover:bg-clay-soft",
};

function ArrowIcon({ show }: { show?: boolean }) {
  if (!show) return null;
  return (
    <span className="relative inline-block h-3.5 w-3.5 overflow-hidden">
      <ArrowUpRight
        className="absolute inset-0 h-3.5 w-3.5 transition-transform duration-500 ease-luxury group-hover:translate-x-4 group-hover:-translate-y-4"
        strokeWidth={1.75}
      />
      <ArrowUpRight
        className="absolute inset-0 h-3.5 w-3.5 -translate-x-4 translate-y-4 transition-transform duration-500 ease-luxury group-hover:translate-x-0 group-hover:translate-y-0"
        strokeWidth={1.75}
      />
    </span>
  );
}

export function Button({
  href,
  variant = "primary",
  size = "md",
  arrow = true,
  className,
  children,
  onClick,
  type,
}: ButtonBaseProps & { href?: string; onClick?: () => void; type?: "button" | "submit" }) {
  const classes = cn(base, sizes[size], variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        <span>{children}</span>
        <ArrowIcon show={arrow} />
      </Link>
    );
  }

  return (
    <button type={type ?? "button"} onClick={onClick} className={classes}>
      <span>{children}</span>
      <ArrowIcon show={arrow} />
    </button>
  );
}
