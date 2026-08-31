import { LakeHorizonScene } from "@/components/illustrations/scenes";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SearchWidget } from "./search-widget";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-[var(--color-ink)] text-[var(--color-ivory)]">
      <div
        role="img"
        aria-label="Illustration de démonstration — horizon du Léman et des Alpes vu depuis La Côte"
        className="absolute inset-0"
      >
        <LakeHorizonScene className="text-[var(--color-ivory)] opacity-[0.55]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/50 to-[var(--color-ink)]/10" />
      </div>

      <div className="relative mx-auto w-full max-w-(--container-page) px-6 pb-16 pt-44 md:px-10 lg:px-14 lg:pb-20">
        <Reveal mask>
          <Eyebrow light>Lausanne · Rolle · Lonay — arc lémanique</Eyebrow>
        </Reveal>

        <Reveal mask delay={80}>
          <h1 className="mt-6 max-w-4xl font-sans text-[2.6rem] font-medium leading-[1.05] tracking-[-0.01em] sm:text-6xl lg:text-7xl">
            Une maison immobilière, <span className="font-serif italic font-normal">pas un portail d&rsquo;annonces.</span>
          </h1>
        </Reveal>

        <Reveal delay={220}>
          <p className="mt-7 max-w-lg font-sans text-base leading-relaxed opacity-75 sm:text-lg">
            Courtage, promotion, conseil et gérance : depuis 2020, Dimitri et
            Célia Courvoisier accompagnent propriétaires, acheteurs et
            investisseurs de La Côte à Lausanne.
          </p>
        </Reveal>

        <Reveal delay={340} className="mt-10 flex flex-wrap items-center gap-5">
          <Button href="/estimer" variant="primary" className="!bg-[var(--color-ivory)] !text-[var(--color-ink)] hover:!bg-[var(--color-green)] hover:!text-[var(--color-ivory)]">
            Estimer mon bien
          </Button>
          <Button href="/acheter" variant="ghost" className="!text-[var(--color-ivory)]">
            Découvrir nos biens
          </Button>
        </Reveal>
      </div>

      <div className="relative">
        <SearchWidget />
      </div>
    </section>
  );
}
