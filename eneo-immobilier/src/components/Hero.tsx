"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const lineVariants = {
  hidden: { y: "110%" },
  visible: (i: number) => ({
    y: "0%",
    transition: {
      delay: 0.5 + i * 0.12,
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export default function Hero() {
  const titleLines = [
    "Valoriser votre",
    "patrimoine immobilier",
    "à Genève",
  ];

  return (
    <section id="top" className="relative h-[100svh] w-full overflow-hidden bg-ink">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero-poster.svg"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/35 to-ink/70" />
      <div className="absolute inset-0 bg-ink/10" />

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-16 md:px-10 md:pb-20">
        <div className="max-w-5xl">
          <h1 className="font-display text-[13vw] font-light italic leading-[0.98] text-ivory md:text-[6.4vw]">
            {titleLines.map((line, i) => (
              <span key={line} className="reveal-line">
                <motion.span
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={lineVariants}
                  className="block"
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-md text-balance text-[15px] font-light leading-relaxed text-ivory/80 md:text-base"
          >
            Gérance, courtage, rénovation et projets immobiliers avec une
            approche humaine, précise et durable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="#services"
              className="group inline-flex items-center gap-3 rounded-full border border-ivory/40 px-7 py-3.5 text-[13px] uppercase tracking-widest2 text-ivory transition-colors duration-500 hover:border-ivory hover:bg-ivory hover:text-ink"
            >
              Découvrir les services
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center gap-3 px-2 py-3.5 text-[13px] uppercase tracking-widest2 text-ivory/85 underline underline-offset-4 transition-colors duration-500 hover:text-ivory"
            >
              Nous contacter
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 right-6 hidden flex-col items-end gap-2 text-right text-[11px] uppercase tracking-widest2 text-ivory/60 md:right-10 md:flex"
      >
        <span className="h-12 w-px bg-ivory/30" />
        Depuis 2005
      </motion.div>
    </section>
  );
}
