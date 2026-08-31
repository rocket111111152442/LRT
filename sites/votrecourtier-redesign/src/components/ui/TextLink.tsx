import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function TextLink({
  href,
  children,
  className,
  external,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "relative inline-block bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-[1px] transition-[background-size] duration-500 ease-luxury bg-bottom hover:bg-[length:100%_1px]",
        className,
      )}
      style={{ backgroundPosition: "0% 100%" }}
    >
      {children}
    </Link>
  );
}
