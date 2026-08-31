import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { Reveal } from "@/components/ui/reveal";
import { Artwork } from "@/components/illustrations/artwork";
import { IconArrowUpRight } from "@/components/ui/icons";
import { promotions } from "@/lib/data/promotions";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Promotions immobilières sur l’arc lémanique",
  description:
    "Découvrez les projets de développement résidentiel de Courvoisier Immobilier entre Rolle et Lausanne.",
  path: "/promotion",
});

export default function PromotionListPage() {
  return (
    <>
      <PageIntro
        eyebrow="Développement"
        title="Des projets pensés pour durer."
        lead="Courvoisier accompagne promoteurs, investisseurs et propriétaires fonciers à travers toutes les étapes du développement immobilier — étude, acquisition, permis, construction, commercialisation."
      />
      <Container className="pb-28 sm:pb-36">
        <div className="grid gap-20 border-t border-[var(--color-stone-dark)] pt-16 lg:grid-cols-2 lg:gap-12">
          {promotions.map((promotion, i) => (
            <Reveal key={promotion.slug} delay={i * 100}>
              <Link href={`/promotion/${promotion.slug}`} className="group block">
                <Artwork
                  scene={i % 2 === 0 ? "plan" : "facade"}
                  tone="stone"
                  ratio="wide"
                  className="transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
                <div className="mt-6 flex items-start justify-between gap-6">
                  <div>
                    <p className="font-sans text-xs uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
                      {promotion.locality} — {promotion.status}
                    </p>
                    <p className="mt-2 font-serif text-3xl italic sm:text-4xl">{promotion.name}</p>
                    <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
                      {promotion.concept}
                    </p>
                  </div>
                  <IconArrowUpRight className="mt-2 h-5 w-5 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
