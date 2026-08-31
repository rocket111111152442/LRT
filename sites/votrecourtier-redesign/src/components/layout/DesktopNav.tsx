"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { primaryNav, secondaryNav } from "@/config/nav";
import { cn } from "@/lib/utils/cn";

export function DesktopNav({ inverse }: { inverse?: boolean }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <nav
      className="relative hidden items-center gap-1 lg:flex"
      onMouseLeave={() => setOpenGroup(null)}
    >
      {primaryNav.map((group) => (
        <div key={group.label} onMouseEnter={() => setOpenGroup(group.label)}>
          <button
            type="button"
            className={cn(
              "relative px-4 py-2 text-[0.8125rem] font-medium tracking-[0.01em] transition-colors",
              inverse ? "text-paper/90 hover:text-paper" : "text-ink-soft hover:text-ink",
              openGroup === group.label && (inverse ? "text-paper" : "text-ink"),
            )}
            aria-expanded={openGroup === group.label}
          >
            {group.label}
          </button>
        </div>
      ))}
      {secondaryNav.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "px-4 py-2 text-[0.8125rem] font-medium tracking-[0.01em] transition-colors",
            inverse ? "text-paper/90 hover:text-paper" : "text-ink-soft hover:text-ink",
          )}
        >
          {link.label}
        </Link>
      ))}

      <AnimatePresence>
        {openGroup && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-full mt-3 w-[38rem] border border-stone bg-paper shadow-lift"
          >
            {primaryNav
              .filter((g) => g.label === openGroup)
              .map((group) => (
                <div key={group.label} className="grid grid-cols-[1.4fr_1fr]">
                  <div className="grid grid-cols-2 gap-8 p-8">
                    {group.columns.map((col) => (
                      <div key={col.heading}>
                        <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ink-faint">
                          {col.heading}
                        </p>
                        <ul className="space-y-3">
                          {col.links.map((link) => (
                            <li key={link.href}>
                              <Link href={link.href} className="group block">
                                <span className="block text-[0.9rem] text-ink transition-colors group-hover:text-clay">
                                  {link.label}
                                </span>
                                {link.description ? (
                                  <span className="block text-xs text-ink-faint">{link.description}</span>
                                ) : null}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={group.featured.href}
                    className="group flex flex-col justify-end border-l border-stone bg-paper-dim p-8"
                  >
                    <span className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-clay">
                      {group.featured.eyebrow}
                    </span>
                    <span className="mt-2 font-serif text-lg leading-snug text-ink">
                      {group.featured.label}
                    </span>
                    <span className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-ink-soft transition-colors group-hover:text-clay">
                      Découvrir →
                    </span>
                  </Link>
                </div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
