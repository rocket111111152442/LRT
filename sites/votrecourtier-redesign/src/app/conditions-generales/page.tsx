import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Conditions générales",
  description: "Conditions générales d'utilisation du site votrecourtier.ch.",
  alternates: { canonical: "/conditions-generales" },
};

export default function ConditionsGeneralesPage() {
  return (
    <Section tone="paper" className="pt-40 sm:pt-48">
      <Container narrow>
        <h1 className="font-serif text-3xl text-ink">Conditions générales</h1>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink-soft">
          <div>
            <h2 className="font-serif text-lg text-ink">Objet</h2>
            <p className="mt-2">
              Les présentes conditions régissent l&rsquo;utilisation du site {site.url}, édité par {site.legalName}.
              L&rsquo;utilisation du site implique l&rsquo;acceptation pleine et entière de ces conditions.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-ink">Estimations et contenus</h2>
            <p className="mt-2">
              Les estimations demandées via ce site constituent une première approche indicative, établie sur la
              base des informations transmises par l&rsquo;utilisateur. Elles ne remplacent pas une expertise
              contradictoire sur place et n&rsquo;engagent pas votrecourtier.ch SA sur un prix de vente définitif.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-ink">Biens présentés</h2>
            <p className="mt-2">
              Les biens présentés sur ce site le sont sous réserve de disponibilité. Les surfaces, prix et
              caractéristiques sont donnés à titre indicatif et vérifiés lors du contact avec notre équipe.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-ink">Droit applicable</h2>
            <p className="mt-2">Les présentes conditions sont soumises au droit suisse.</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
