"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/config/site";
import { useScrolled } from "@/lib/hooks/use-scrolled";
import { IconMenu } from "@/components/ui/icons";
import { MobileMenu } from "./mobile-menu";

export function Header() {
  const pathname = usePathname();
  const scrolled = useScrolled(48);
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !menuOpen;

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-out ${
          transparent
            ? "bg-transparent text-[var(--color-ivory)]"
            : "border-b border-[var(--color-stone-dark)] bg-[var(--color-ivory)]/95 text-[var(--color-ink)] backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-(--container-page) items-center justify-between px-6 md:px-10 lg:px-14">
          <Link href="/" className="flex flex-col leading-none" onClick={() => setMenuOpen(false)}>
            <span className="font-sans text-lg font-medium tracking-[0.16em]">COURVOISIER</span>
            <span className="font-serif text-[0.68rem] italic tracking-[0.05em] opacity-70">Immobilier</span>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="link-underline font-sans text-sm tracking-[0.02em]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <Link
              href="/estimer"
              className={`hidden font-sans text-sm tracking-[0.02em] transition-colors duration-300 sm:inline-flex sm:items-center sm:gap-2 sm:border sm:px-5 sm:py-2.5 ${
                transparent
                  ? "border-[var(--color-ivory)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-ink)]"
                  : "border-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)]"
              }`}
            >
              Estimer mon bien
            </Link>
            <button
              type="button"
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="p-1"
            >
              <IconMenu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
