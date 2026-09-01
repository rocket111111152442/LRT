import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { EstimationForm } from "@/components/forms/EstimationForm";
import { offices } from "@/config/site";

export const metadata: Metadata = {
  title: "Estimation immobilière gratuite — Vaud & Fribourg",
  description:
    "Recevez une estimation gratuite et réaliste de votre bien par un expert breveté, sans engagement. Maison, appartement, terrain ou immeuble à Vaud et Fribourg.",
  alternates: { canonical: "/estimation-immobiliere" },
};

export default function EstimationPage() {
  return (
    <>
      <PageHero
        eyebrow="Estimation gratuite"
        title="Quatre étapes pour une première estimation fiable."
        intro="Réponse d'un expert en estimations immobilières breveté, membre de la Chambre suisse d'experts en estimation immobilière (CEI). Sans engagement."
        scene="investissement"
      />
      <Section tone="paper">
        <Container narrow>
          <EstimationForm />
        </Container>
      </Section>
      <Section tone="dim" compact>
        <Container narrow className="text-center">
          <p className="text-sm text-ink-soft">
            Une question avant de commencer ? Nos équipes répondent directement.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
            {offices.map((o) => (
              <a key={o.id} href={`tel:${o.phone}`} className="text-ink transition-colors hover:text-clay">
                {o.label} — {o.phoneDisplay}
              </a>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
