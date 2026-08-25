"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { nav, company } from "@/lib/data";

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-40 flex flex-col justify-between bg-ink px-6 pb-10 pt-28 text-ivory md:hidden"
        >
          <nav className="flex flex-col gap-2">
            {nav.map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.5 }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block border-b border-ivory/10 py-4 font-display text-4xl italic leading-none"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col gap-1 pt-10 text-sm text-ivory/60"
          >
            <p>{company.address}, {company.city}</p>
            <p>{company.phone}</p>
            <p>{company.email}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
