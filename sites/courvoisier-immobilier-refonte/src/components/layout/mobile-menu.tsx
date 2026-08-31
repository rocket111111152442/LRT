"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { FOOTER_SERVICE_LINKS, NAV_LINKS, siteConfig } from "@/config/site";
import { agencies } from "@/lib/data/agencies";
import { IconClose } from "@/components/ui/icons";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])"
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      aria-hidden={!open}
      className={`fixed inset-0 z-[60] flex flex-col bg-[var(--color-ink)] text-[var(--color-ivory)] transition-[clip-path] duration-700 ease-[var(--ease-editorial)] ${
        open ? "[clip-path:circle(150%_at_100%_0%)]" : "pointer-events-none [clip-path:circle(0%_at_100%_0%)]"
      }`}
    >
      <div className="flex h-20 items-center justify-between px-6 md:px-10 lg:px-14">
        <span className="font-sans text-lg font-medium tracking-[0.16em]">COURVOISIER</span>
        <button type="button" aria-label="Fermer le menu" onClick={onClose} className="p-1">
          <IconClose className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-between overflow-y-auto px-6 pb-10 md:px-10 lg:px-14">
        <nav className="mt-6 flex flex-col gap-1">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
              className={`border-b border-[var(--color-ivory)]/10 py-3 font-serif text-4xl italic transition-all duration-500 ease-out sm:text-6xl ${
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          <div>
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.25em] opacity-60">Services</p>
            <ul className="space-y-2">
              {FOOTER_SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={onClose} className="link-underline font-sans text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.25em] opacity-60">Agences</p>
            <ul className="space-y-2">
              {agencies.map((agency) => (
                <li key={agency.id}>
                  <Link href="/agences" onClick={onClose} className="link-underline font-sans text-sm">
                    {agency.city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.25em] opacity-60">Contact</p>
            <a href={siteConfig.phoneHref} className="link-underline block font-sans text-sm">
              {siteConfig.phone}
            </a>
            <a href={`mailto:${siteConfig.email}`} className="link-underline block font-sans text-sm">
              {siteConfig.email}
            </a>
          </div>
        </div>

        <Link
          href="/estimer"
          onClick={onClose}
          className="mt-10 inline-flex w-fit items-center gap-3 border border-[var(--color-ivory)] px-6 py-3 font-sans text-sm tracking-[0.02em] transition-colors hover:bg-[var(--color-ivory)] hover:text-[var(--color-ink)]"
        >
          Estimer mon bien
        </Link>
      </div>
    </div>
  );
}
