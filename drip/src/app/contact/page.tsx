import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "@/components/ContactForm";
import { SHOP } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Une question sur une commande, une taille ou un retour ? Contactez le studio DRIP, réponse sous 24 à 48 heures ouvrées.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Écrivez-nous."
        intro="Commande, taille, retour, collaboration : une seule adresse et une vraie réponse, généralement sous 24 à 48 heures ouvrées."
      />

      <section className="shell pb-24">
        <div className="hairline grid gap-14 pt-12 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
          <div className="space-y-10">
            <div>
              <p className="label mb-3 text-[color:var(--color-smoke)]">E-mail</p>
              <a href={`mailto:${SHOP.email}`} className="text-lg link-underline">
                {SHOP.email}
              </a>
            </div>

            {SHOP.phone && (
              <div>
                <p className="label mb-3 text-[color:var(--color-smoke)]">Téléphone</p>
                <a href={`tel:${SHOP.phone.replace(/\s/g, "")}`} className="text-lg link-underline">
                  {SHOP.phone}
                </a>
              </div>
            )}

            <div>
              <p className="label mb-3 text-[color:var(--color-smoke)]">Réseaux</p>
              <div className="flex flex-col gap-2">
                <a
                  href={SHOP.social.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm link-underline"
                >
                  Instagram
                </a>
                <a
                  href={SHOP.social.tiktok}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm link-underline"
                >
                  TikTok
                </a>
              </div>
            </div>

            <div>
              <p className="label mb-3 text-[color:var(--color-smoke)]">Avant d&apos;écrire</p>
              <p className="max-w-[40ch] text-sm leading-relaxed text-[color:var(--color-smoke)]">
                La plupart des questions sur les délais, les tailles et les
                retours trouvent leur réponse dans la{" "}
                <Link href="/faq" className="link-underline text-[color:var(--color-ink)]">
                  FAQ
                </Link>
                . Pour une commande en cours, indiquez son numéro (DRIP-000000) :
                on gagne un aller-retour.
              </p>
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
