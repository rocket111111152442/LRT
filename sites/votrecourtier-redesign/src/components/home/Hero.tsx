"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { ArchitecturalScene } from "@/components/illustrations/ArchitecturalScene";

const line = {
  hidden: { y: "110%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const, delay: 0.25 + i * 0.09 },
  }),
};

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-pine text-paper">
      <motion.div
        initial={{ scale: 1.08, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0"
      >
        <ArchitecturalScene
          variant="hero"
          label="Relevé architectural d'une villa contemporaine, cadre résidentiel vaudois"
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,33,27,0.35)_0%,rgba(22,33,27,0.05)_32%,rgba(22,33,27,0.3)_62%,rgba(22,33,27,0.92)_100%)]" />
      </motion.div>

      <div className="relative mx-auto flex w-full max-w-[88rem] flex-1 flex-col justify-end px-6 pb-16 pt-40 sm:px-8 lg:px-12 lg:pb-20">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-6 text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-clay-soft"
            >
              Courtage &amp; développement immobilier — Vaud &amp; Fribourg
            </motion.p>

            <h1 className="font-serif text-[2.6rem] font-medium leading-[1.05] tracking-[-0.01em] text-balance sm:text-[3.4rem] lg:text-[4.4rem]">
              <span className="block overflow-hidden">
                <motion.span custom={0} variants={line} initial="hidden" animate="visible" className="block">
                  Chaque bien a une valeur.
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span custom={1} variants={line} initial="hidden" animate="visible" className="block italic text-clay-soft">
                  Nous savons la révéler.
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="mt-8 max-w-md text-[1.0625rem] leading-relaxed text-paper/75"
            >
              Depuis 2006, votrecourtier.ch SA accompagne propriétaires, acquéreurs et investisseurs entre Lausanne et
              Fribourg — de l&rsquo;estimation jusqu&rsquo;à la signature chez le notaire.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
            >
              <Button href="/estimation-immobiliere" variant="inverse">
                Demander une estimation
              </Button>
              <TextLink href="/tous-nos-biens" className="text-sm text-paper/85">
                Découvrir nos biens
              </TextLink>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="hidden border-l border-paper/20 pl-6 text-sm text-paper/70 lg:col-span-4 lg:block"
          >
            <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-paper/45">Nos antennes</p>
            <p className="mt-3 font-serif text-lg text-paper">Lausanne — Crissier</p>
            <p className="mt-1 font-serif text-lg text-paper">Fribourg — Marly</p>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.3 }}
        className="absolute bottom-8 right-6 hidden items-center gap-3 text-paper/50 sm:right-8 lg:right-12 lg:flex"
      >
        <span className="text-[0.6875rem] uppercase tracking-[0.2em]">Découvrir</span>
        <span className="h-10 w-px bg-paper/30" />
      </motion.div>
    </section>
  );
}
