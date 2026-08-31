"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { DesktopNav } from "./DesktopNav";
import { MobileMenu } from "./MobileMenu";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !mobileOpen;

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out-soft",
          transparent ? "bg-transparent py-6" : "border-b border-stone bg-paper/95 py-4 backdrop-blur-sm",
          mobileOpen && "border-b-0 bg-paper",
        )}
      >
        <div className="mx-auto flex max-w-[88rem] items-center justify-between px-6 sm:px-8 lg:px-12">
          <Logo inverse={transparent} />

          <DesktopNav inverse={transparent} />

          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <Button href="/estimation-immobiliere" size="sm" variant={transparent ? "inverse" : "primary"}>
                Estimation gratuite
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className={cn(
                "-mr-2 flex h-10 w-10 items-center justify-center transition-colors lg:hidden",
                transparent ? "text-paper" : "text-ink",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
