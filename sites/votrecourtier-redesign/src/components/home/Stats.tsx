import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/animation/Reveal";
import { AnimatedNumber } from "@/components/animation/AnimatedNumber";
import { companyStats } from "@/lib/data/stats";

export function Stats() {
  return (
    <Section tone="pine" compact>
      <Container>
        <div className="grid grid-cols-2 gap-y-12 border-t border-pine-line pt-12 lg:grid-cols-4 lg:gap-x-8">
          {companyStats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08} className="border-l border-pine-line pl-5">
              <p className="font-serif text-[2.4rem] leading-none text-paper sm:text-[3rem]">
                {stat.isYear ? (
                  stat.value
                ) : (
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                )}
              </p>
              <p className="mt-3 max-w-[12rem] text-[0.8125rem] leading-snug text-paper/60">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
