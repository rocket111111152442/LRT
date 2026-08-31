"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { navStructure, type NavLink } from "@/config/nav";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import { cn } from "@/lib/utils/format";

type MenuGroup = "sell" | "buy" | "discover";

export function HeaderClient({
  locale,
  siteName,
  nav,
}: {
  locale: Locale;
  siteName: string;
  nav: Dictionary["nav"];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState<MenuGroup | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenGroup(null);
        setMobileOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function openWithDelay(group: MenuGroup) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenGroup(group);
  }
  function closeWithDelay() {
    closeTimer.current = setTimeout(() => setOpenGroup(null), 120);
  }

  const groups: { id: MenuGroup; label: string; links: NavLink[] }[] = [
    { id: "sell", label: nav.sell, links: navStructure.sell },
    { id: "buy", label: nav.buy, links: navStructure.buy },
    { id: "discover", label: nav.discover, links: navStructure.discover },
  ];

  const menuLabels = nav.menu as unknown as Record<string, string>;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-stone-200 bg-cream-50/92 backdrop-blur-md shadow-soft"
          : "border-transparent bg-cream-50/70 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex h-18 max-w-[88rem] items-center justify-between px-5 sm:px-8 lg:px-12" style={{ height: "4.5rem" }}>
        <Link href={`/${locale}`} className="flex items-center gap-2 font-display text-xl font-semibold text-ink-900">
          <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-ivy-600 text-cream-50 text-sm">
            N
          </span>
          {siteName}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {groups.map((group) => (
            <div
              key={group.id}
              className="relative"
              onMouseEnter={() => openWithDelay(group.id)}
              onMouseLeave={closeWithDelay}
            >
              <button
                type="button"
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-ink-900 hover:bg-ink-900/5"
                aria-expanded={openGroup === group.id}
                aria-controls={`menu-${group.id}`}
                onClick={() => setOpenGroup(openGroup === group.id ? null : group.id)}
              >
                {group.label}
                <ChevronDown size={15} className={cn("transition-transform", openGroup === group.id && "rotate-180")} />
              </button>
              <div
                id={`menu-${group.id}`}
                role="group"
                className={cn(
                  "absolute left-0 top-full w-80 rounded-2xl border border-stone-200 bg-cream-50 p-2 shadow-lift transition-all duration-150",
                  openGroup === group.id ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
                )}
              >
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={`/${locale}${link.href}`}
                    className="block rounded-xl px-3 py-2.5 hover:bg-ivy-100/60"
                    onClick={() => setOpenGroup(null)}
                  >
                    <span className="block text-sm font-semibold text-ink-900">{menuLabels[link.labelKey]}</span>
                    {link.descKey ? <span className="block text-xs text-ink-500">{menuLabels[link.descKey]}</span> : null}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link href={`/${locale}/contact`} className="rounded-full px-4 py-2 text-sm font-medium text-ink-900 hover:bg-ink-900/5">
            {nav.contact}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher locale={locale} label={nav.langSwitcher} />
          <Button href={`/${locale}/estimation`} size="sm">
            {nav.ctaEstimate}
          </Button>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink-900 lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? nav.closeMenu : nav.openMenu}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen ? (
        <div id="mobile-nav" className="max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-stone-200 bg-cream-50 px-5 pb-8 pt-4 lg:hidden">
          {groups.map((group) => (
            <div key={group.id} className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ivy-600">{group.label}</p>
              <div className="flex flex-col gap-1">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={`/${locale}${link.href}`}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900 hover:bg-ivy-100/60"
                    onClick={() => setMobileOpen(false)}
                  >
                    {menuLabels[link.labelKey]}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link href={`/${locale}/contact`} className="mb-4 block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900 hover:bg-ivy-100/60">
            {nav.contact}
          </Link>
          <div className="mb-4">
            <LanguageSwitcher locale={locale} label={nav.langSwitcher} />
          </div>
          <Button href={`/${locale}/estimation`} className="w-full">
            {nav.ctaEstimate}
          </Button>
        </div>
      ) : null}
    </header>
  );
}
