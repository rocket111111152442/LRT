import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/animation/Reveal";
import { ArchitecturalScene } from "@/components/illustrations/ArchitecturalScene";
import { blogPosts } from "@/lib/data/blog";

export const metadata: Metadata = {
  title: "Blog — Conseils immobiliers Vaud & Fribourg",
  description: "Marché, estimation, vente et développement foncier : nos analyses pour les cantons de Vaud et Fribourg.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <>
      <PageHero eyebrow="Blog" title="Conseils et analyses de marché" scene="bureau" />
      <Section tone="paper">
        <Container>
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post, i) => (
              <Reveal key={post.slug} delay={(i % 3) * 0.06}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <ArchitecturalScene
                      variant={post.scene}
                      label={post.title}
                      className="h-full w-full transition-transform duration-[1200ms] ease-luxury group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="mt-4 text-[0.6875rem] uppercase tracking-[0.14em] text-clay">
                    {post.category} · {post.readingTime}
                  </p>
                  <h2 className="mt-2 font-serif text-xl leading-snug text-ink transition-colors group-hover:text-clay">
                    {post.title}
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-faint">{post.excerpt}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
