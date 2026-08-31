import type { ReactNode } from "react";
import { Container } from "./container";
import { Eyebrow } from "./eyebrow";
import { Reveal } from "./reveal";

export function PageIntro({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="pb-16 pt-40 sm:pt-48">
      <Container>
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl italic leading-[1.08] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
        </Reveal>
        {lead && (
          <Reveal delay={100}>
            <p className="mt-7 max-w-xl font-sans text-base leading-relaxed text-[var(--color-graphite)]">
              {lead}
            </p>
          </Reveal>
        )}
        {children}
      </Container>
    </section>
  );
}
