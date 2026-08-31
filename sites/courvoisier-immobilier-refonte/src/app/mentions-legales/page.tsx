import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { siteConfig } from "@/config/site";
import { agencies } from "@/lib/data/agencies";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Mentions légales",
  description: "Mentions légales du site Courvoisier Immobilier.",
  path: "/mentions-legales",
});

export default function MentionsLegalesPage() {
  const lausanne = agencies[0];
  return (
    <>
      <PageIntro eyebrow="Informations légales" title="Mentions légales" />
      <Container className="max-w-(--container-copy) pb-28 font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
        <section className="mb-10">
          <h2 className="mb-2 font-sans text-base font-medium text-[var(--color-ink)]">Éditeur du site</h2>
          <p>
            {siteConfig.legalName}
            <br />
            {lausanne?.street}, {lausanne?.postalCode} {lausanne?.city} (siège)
            <br />
            {siteConfig.phone} — {siteConfig.email}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-2 font-sans text-base font-medium text-[var(--color-ink)]">Propriété intellectuelle</h2>
          <p>
            L&rsquo;ensemble des contenus de ce site (textes, illustrations,
            identité visuelle) est protégé. Toute reproduction sans
            autorisation est interdite.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-2 font-sans text-base font-medium text-[var(--color-ink)]">Responsabilité</h2>
          <p>
            Les informations relatives aux biens, promotions et disponibilités
            présentées sur ce site sont fournies à titre indicatif et peuvent
            évoluer. Contactez l&rsquo;une de nos agences pour toute
            information à jour.
          </p>
        </section>
      </Container>
    </>
  );
}
