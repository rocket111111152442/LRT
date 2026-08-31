import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ContactForm } from "@/components/forms/contact-form";
import { agencies } from "@/lib/data/agencies";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Contactez Courvoisier Immobilier à Lausanne, Rolle ou Lonay.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="Parlons de votre projet."
        lead="Une question, un bien à estimer, un projet de développement ? Écrivez-nous ou contactez directement l’une de nos agences."
      />

      <Container className="pb-28 sm:pb-36">
        <div className="grid gap-16 lg:grid-cols-[1.3fr_1fr] lg:gap-24">
          <ContactForm />

          <div className="space-y-10 lg:border-l lg:border-[var(--color-stone-dark)] lg:pl-16">
            <div>
              <Eyebrow>Coordonnées générales</Eyebrow>
              <a href={siteConfig.phoneHref} className="link-underline mt-3 block font-serif text-2xl italic">
                {siteConfig.phone}
              </a>
              <a href={`mailto:${siteConfig.email}`} className="link-underline mt-1 block font-sans text-sm">
                {siteConfig.email}
              </a>
            </div>

            {agencies.map((agency) => (
              <div key={agency.id} className="border-t border-[var(--color-stone-dark)] pt-6">
                <p className="font-sans text-xs uppercase tracking-[0.15em] text-[var(--color-graphite-light)]">
                  {agency.city}
                </p>
                <p className="mt-1.5 font-sans text-sm">
                  {agency.street}, {agency.postalCode} {agency.city}
                </p>
                <a href={agency.phoneHref} className="link-underline mt-1 block font-sans text-sm">
                  {agency.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}
