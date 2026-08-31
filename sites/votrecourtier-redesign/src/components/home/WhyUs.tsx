import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/animation/Reveal";

const reasons = [
  {
    title: "Expertise brevetée",
    description:
      "Brevet fédéral de développeur immobilier et d'expert en estimations, affiliation USPI et Chambre suisse d'experts en estimation immobilière (CEI).",
  },
  {
    title: "Foncier et résidentiel",
    description:
      "Une double compétence rare : intervenir aussi bien sur un terrain brut à valoriser que sur un bien fini à commercialiser.",
  },
  {
    title: "Deux antennes locales",
    description: "Une présence physique à Lausanne et à Fribourg — pas un simple point de contact digital.",
  },
  {
    title: "Un seul interlocuteur",
    description: "Le même accompagnement du premier rendez-vous d'estimation jusqu'à la signature chez le notaire.",
  },
];

export function WhyUs() {
  return (
    <Section tone="paper">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal>
              <Eyebrow index="06">Pourquoi nous</Eyebrow>
              <h2 className="mt-4 max-w-xs font-serif text-[1.9rem] leading-[1.15] text-ink sm:text-[2.3rem]">
                La rigueur d&rsquo;un expert, la disponibilité d&rsquo;un indépendant
              </h2>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <ul className="grid grid-cols-1 gap-x-10 gap-y-10 border-t border-stone pt-10 sm:grid-cols-2">
              {reasons.map((reason, i) => (
                <Reveal as="li" key={reason.title} delay={i * 0.07}>
                  <span className="font-feature-numeric text-xs text-clay">0{i + 1}</span>
                  <h3 className="mt-3 font-serif text-lg text-ink">{reason.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{reason.description}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
