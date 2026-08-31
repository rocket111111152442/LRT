import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Politique de confidentialité",
  description: "Comment Courvoisier Immobilier traite vos données personnelles.",
  path: "/confidentialite",
});

export default function ConfidentialitePage() {
  return (
    <>
      <PageIntro eyebrow="Confidentialité" title="Politique de confidentialité" />
      <Container className="max-w-(--container-copy) pb-28 font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
        <section className="mb-10">
          <h2 className="mb-2 font-sans text-base font-medium text-[var(--color-ink)]">Données collectées</h2>
          <p>
            Les formulaires de ce site (contact, estimation, demande de visite)
            collectent uniquement les informations que vous transmettez
            volontairement : nom, e-mail, téléphone et le contenu de votre
            demande.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-2 font-sans text-base font-medium text-[var(--color-ink)]">Utilisation</h2>
          <p>
            Ces informations sont utilisées exclusivement pour traiter votre
            demande (rappel, estimation, prise de rendez-vous) par l&rsquo;équipe
            de {siteConfig.legalName}. Elles ne sont ni vendues ni transmises à
            des tiers à des fins commerciales.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-2 font-sans text-base font-medium text-[var(--color-ink)]">Vos droits</h2>
          <p>
            Conformément à la législation suisse sur la protection des données,
            vous pouvez demander l&rsquo;accès, la rectification ou la
            suppression de vos données en écrivant à{" "}
            <a href={`mailto:${siteConfig.email}`} className="link-underline">
              {siteConfig.email}
            </a>
            .
          </p>
        </section>
      </Container>
    </>
  );
}
