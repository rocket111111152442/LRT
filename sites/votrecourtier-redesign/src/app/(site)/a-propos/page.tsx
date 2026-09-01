import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/animation/Reveal";
import { Button } from "@/components/ui/Button";
import { ArchitecturalScene } from "@/components/illustrations/ArchitecturalScene";
import { expert, offices, site } from "@/config/site";

export const metadata: Metadata = {
  title: "À propos — Alexandre Mirfassihi",
  description:
    "Développeur immobilier avec brevet fédéral et expert en estimations, Alexandre Mirfassihi dirige votrecourtier.ch SA à Lausanne et Fribourg depuis 2016.",
  alternates: { canonical: "/a-propos" },
};

const timeline = [
  {
    period: "Avant 2006",
    title: "Négoce de matières premières",
    description: "Formation chez une multinationale américaine, puis au sein de Credit Suisse.",
  },
  {
    period: "Dès 2006",
    title: "Foncia / Domicim / DBS",
    description:
      "Courtier principal, puis responsable des ventes du département valorisation & projets neufs pour les cantons de Vaud et Fribourg.",
  },
  {
    period: "Ensuite",
    title: "Barnes / Gerofinance",
    description: "Sous-directeur du département valorisation & projets neufs Vaud & Fribourg.",
  },
  {
    period: "Depuis 2016",
    title: "votrecourtier.ch SA",
    description: "Membre du conseil d'administration, aux commandes du développement foncier et du courtage.",
  },
];

export default function AProposPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-pine pb-0 pt-40 text-paper sm:pt-48">
        <Container className="relative pb-20">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-clay-soft">À propos</p>
          <h1 className="mt-5 max-w-2xl text-balance font-serif text-[2.3rem] leading-[1.1] sm:text-[3rem]">
            {expert.name}
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.1em] text-paper/60">{expert.role}</p>
        </Container>
      </section>

      <Section tone="paper">
        <Container>
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden">
                <ArchitecturalScene variant="bureau" label="Illustration du bureau d'Alexandre Mirfassihi" className="h-full w-full" />
                <div className="absolute inset-0 flex items-end p-8">
                  <span className="font-serif text-6xl italic text-paper/90">A.M.</span>
                </div>
              </div>
            </Reveal>

            <div className="lg:col-span-7">
              <Reveal>
                <p className="text-[1.1rem] leading-relaxed text-ink-soft">
                  Ingénieur agronome HES de formation, {expert.name} construit son expertise immobilière sur le
                  terrain plutôt que sur la théorie : quinze années passées au contact direct des propriétaires,
                  des acquéreurs et des chantiers, avant de fonder votrecourtier.ch SA en 2016.
                </p>
              </Reveal>

              <Reveal delay={0.08}>
                <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-soft">
                  Cette double compétence — développement foncier et estimation certifiée — reste rare sur le
                  marché romand. Elle permet à votrecourtier.ch d&rsquo;intervenir aussi bien sur un terrain brut à
                  fort potentiel que sur la vente d&rsquo;un bien résidentiel fini, avec la même exigence
                  méthodologique.
                </p>
              </Reveal>

              <Reveal delay={0.14} className="mt-10">
                <p className="text-[0.6875rem] uppercase tracking-[0.18em] text-ink-faint">Qualifications</p>
                <ul className="mt-4 space-y-3">
                  {expert.credentials.map((c) => (
                    <li key={c} className="flex gap-2.5 border-t border-stone pt-3 text-sm text-ink-soft">
                      <span className="text-clay">—</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="dim">
        <Container>
          <Eyebrow index="02">Parcours</Eyebrow>
          <ol className="mt-10 space-y-10 border-t border-stone-dark/50 pt-10">
            {timeline.map((item, i) => (
              <Reveal
                as="li"
                key={item.title}
                delay={i * 0.06}
                className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:gap-8"
              >
                <span className="font-feature-numeric text-sm text-clay sm:col-span-2">{item.period}</span>
                <h3 className="font-serif text-xl text-ink sm:col-span-4">{item.title}</h3>
                <p className="text-sm leading-relaxed text-ink-soft sm:col-span-6">{item.description}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="paper" compact>
        <Container>
          <div className="grid grid-cols-1 gap-8 border-t border-stone pt-10 sm:grid-cols-2">
            {offices.map((office) => (
              <div key={office.id}>
                <p className="font-serif text-lg text-ink">{office.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {office.street}, {office.postalCode} {office.city}
                  <br />
                  {office.phoneDisplay} — {office.email}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Button href="/estimation-immobiliere">Demander une estimation</Button>
          </div>
        </Container>
      </Section>

      <p className="sr-only">{site.description}</p>
    </>
  );
}
