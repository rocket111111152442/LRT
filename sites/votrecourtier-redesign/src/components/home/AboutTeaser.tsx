import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/Button";
import { ArchitecturalScene } from "@/components/illustrations/ArchitecturalScene";
import { expert } from "@/config/site";

export function AboutTeaser() {
  return (
    <Section tone="dim">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden">
              <ArchitecturalScene
                variant="bureau"
                label="Illustration du bureau de votrecourtier.ch, antenne de Crissier"
                className="h-full w-full"
              />
              <div className="absolute inset-0 flex items-end p-8">
                <span className="font-serif text-6xl italic text-paper/90">A.M.</span>
              </div>
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow index="09">À propos</Eyebrow>
              <h2 className="mt-4 font-serif text-[1.9rem] leading-[1.15] text-ink sm:text-[2.3rem]">
                {expert.name}
              </h2>
              <p className="mt-1 text-sm uppercase tracking-[0.1em] text-clay">{expert.role}</p>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-ink-soft">
                Formé au négoce de matières premières puis à la valorisation immobilière chez Foncia/Domicim/DBS
                dès 2006, avant de diriger le département valorisation &amp; projets neufs Vaud-Fribourg du groupe
                Barnes/Gerofinance. Une double expertise — foncier et estimation — qui structure aujourd&rsquo;hui
                chaque mandat de votrecourtier.ch SA.
              </p>
            </Reveal>

            <Reveal delay={0.14}>
              <ul className="mt-8 grid grid-cols-1 gap-3 text-sm text-ink-soft sm:grid-cols-2">
                {expert.credentials.map((c) => (
                  <li key={c} className="flex gap-2.5 border-t border-stone-dark/50 pt-3">
                    <span className="text-clay">—</span>
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.2} className="mt-10">
              <Button href="/a-propos" variant="secondary" size="sm">
                Découvrir son parcours
              </Button>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
