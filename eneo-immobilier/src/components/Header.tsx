"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { nav } from "@/lib/data";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <div
          className={`mx-auto flex max-w-[1600px] items-center justify-between px-6 text-ivory transition-[padding] duration-500 ease-premium md:px-10 ${
            scrolled ? "py-4" : "py-7"
          }`}
        >
          <Link
            href="#top"
            className="font-display text-2xl italic tracking-wide"
          >
            énéo
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13px] uppercase tracking-widest2 text-ivory/90 transition-colors duration-300 hover:text-ivory"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            aria-label="Ouvrir le menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="relative z-50 flex h-9 w-9 flex-col items-center justify-center gap-[6px] md:hidden"
          >
            <span
              className={`h-px w-6 bg-ivory transition-transform duration-300 ${
                menuOpen ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-6 bg-ivory transition-transform duration-300 ${
                menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
