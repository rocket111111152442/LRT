import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { Artwork } from "@/components/illustrations/artwork";
import { IconArrowUpRight } from "@/components/ui/icons";
import { promotions } from "@/lib/data/promotions";

export function PromotionsSection() {
  return (
    <section className="bg-[var(--color-ink)] py-24 text-[var(--color-ivory)] sm:py-32">
      <Container>
        <Reveal>
          <Eyebrow light>Développement</Eyebrow>
          <h2 className="mt-4 max-w-lg font-serif text-4xl italic sm:text-5xl">
            Nos promotions immobilières
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-16 lg:grid-cols-2 lg:gap-10">
          {promotions.map((promotion, i) => (
            <Reveal key={promotion.slug} delay={i * 120}>
              <Link href={`/promotion/${promotion.slug}`} className="group block">
                <Artwork
                  scene={i % 2 === 0 ? "plan" : "facade"}
                  tone="green"
                  ratio="wide"
                  className="transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
                <div className="mt-6 flex items-start justify-between gap-6">
                  <div>
                    <p className="font-sans text-xs uppercase tracking-[0.2em] opacity-60">
                      {promotion.locality} — {promotion.status}
                    </p>
                    <p className="mt-2 font-serif text-3xl italic sm:text-4xl">{promotion.name}</p>
                    <p className="mt-3 max-w-md font-sans text-sm leading-relaxed opacity-70">
                      {promotion.concept}
                    </p>
                    {promotion.roomsRange && (
                      <p className="mt-4 font-sans text-xs uppercase tracking-[0.15em] opacity-60">
                        {promotion.roomsRange} · {promotion.surfaceRange}
                      </p>
                    )}
                  </div>
                  <IconArrowUpRight className="mt-2 h-5 w-5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
