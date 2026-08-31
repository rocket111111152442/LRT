import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { IconArrowUpRight } from "@/components/ui/icons";
import { services } from "@/lib/data/services";

export function ServicesTeaser() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <Eyebrow>Métiers</Eyebrow>
            <h2 className="mt-4 max-w-md font-serif text-4xl italic sm:text-5xl">Une maison complète</h2>
          </Reveal>
          <Reveal delay={100}>
            <Button href="/services" variant="ghost">
              Tous nos services
            </Button>
          </Reveal>
        </div>

        <ul className="mt-14 border-t border-[var(--color-stone-dark)]">
          {services.map((service, i) => (
            <Reveal key={service.slug} as="li" delay={i * 60}>
              <Link
                href={`/services#${service.slug}`}
                className="group flex items-center justify-between gap-6 border-b border-[var(--color-stone-dark)] py-7 transition-colors hover:bg-[var(--color-stone)]/40"
              >
                <div className="flex items-baseline gap-6 sm:gap-10">
                  <span className="font-serif text-lg italic text-[var(--color-brown)]">{service.number}</span>
                  <span className="font-serif text-2xl italic sm:text-3xl">{service.title}</span>
                  <span className="hidden max-w-sm font-sans text-sm text-[var(--color-graphite)] md:block">
                    {service.short}
                  </span>
                </div>
                <IconArrowUpRight className="h-5 w-5 shrink-0 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100" />
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
