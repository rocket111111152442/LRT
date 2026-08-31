"use client";

import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { primaryNav, secondaryNav } from "@/config/nav";
import { offices } from "@/config/site";
import { Button } from "@/components/ui/Button";

const panelVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.045, delayChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const allLinks = [
    ...primaryNav.flatMap((g) => g.columns.flatMap((c) => c.links)),
    ...secondaryNav,
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 flex flex-col bg-paper pt-24 lg:hidden"
        >
          <motion.nav
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 overflow-y-auto px-6 pb-10"
          >
            <ul className="flex flex-col divide-y divide-stone border-t border-stone">
              {allLinks.map((link) => (
                <motion.li key={link.href} variants={itemVariants}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center justify-between py-4 font-serif text-[1.7rem] leading-none text-ink"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>

            <motion.div variants={itemVariants} className="mt-10">
              <Button href="/estimation-immobiliere" onClick={onClose} className="w-full justify-center">
                Estimation gratuite
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-10 space-y-4 border-t border-stone pt-8 text-sm text-ink-soft">
              {offices.map((office) => (
                <div key={office.id} className="flex items-baseline justify-between gap-4">
                  <span>{office.label}</span>
                  <a href={`tel:${office.phone}`} className="font-feature-numeric text-ink">
                    {office.phoneDisplay}
                  </a>
                </div>
              ))}
            </motion.div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
