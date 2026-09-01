import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/forms/ContactForm";
import { offices } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact — Lausanne & Fribourg",
  description: "Contactez votrecourtier.ch SA à Crissier (Lausanne) ou à Marly (Fribourg) pour toute question immobilière.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Deux antennes, une même équipe" scene="paysage" />
      <Section tone="paper">
        <Container>
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="space-y-10">
                {offices.map((office) => (
                  <div key={office.id} className="border-t border-stone pt-6">
                    <p className="font-serif text-xl text-ink">{office.label}</p>
                    <address className="mt-3 space-y-1 text-sm not-italic leading-relaxed text-ink-soft">
                      <p>
                        {office.street}
                        <br />
                        {office.postalCode} {office.city}
                      </p>
                      <p>
                        <a href={`tel:${office.phone}`} className="text-ink transition-colors hover:text-clay">
                          {office.phoneDisplay}
                        </a>
                      </p>
                      <p>
                        <a href={`mailto:${office.email}`} className="text-ink transition-colors hover:text-clay">
                          {office.email}
                        </a>
                      </p>
                    </address>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <Suspense fallback={null}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
