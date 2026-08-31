import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Logo({ inverse, className }: { inverse?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="votrecourtier.ch — retour à l'accueil"
      className={cn("group flex items-center gap-2.5", className)}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden="true"
        className={cn("shrink-0 transition-colors duration-300", inverse ? "text-paper" : "text-pine")}
      >
        <path d="M2 15L13 4L24 15" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5.5 12V23H20.5V12" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10.5 23V16.5H15.5V23" stroke="currentColor" strokeWidth="1.4" className="text-clay" />
      </svg>
      <span className={cn("text-[1.05rem] leading-none tracking-[-0.01em]", inverse ? "text-paper" : "text-ink")}>
        <span className="font-normal">votre</span>
        <span className="font-serif italic font-medium">courtier</span>
        <span className={cn("text-[0.7em] align-top", inverse ? "text-paper/60" : "text-clay")}>.ch</span>
      </span>
    </Link>
  );
}
