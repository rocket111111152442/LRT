import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { Reveal } from "@/components/ui/reveal";
import { articles } from "@/lib/data/articles";
import { formatDate } from "@/lib/utils/format";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Actualités & conseils immobiliers",
  description: "Nos articles sur le marché immobilier de l’arc lémanique : vendre, estimer, investir.",
  path: "/actualites",
});

export default function ArticlesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Actualités"
        title="Comprendre le marché avant d’agir."
        lead="Des repères concrets pour vendre, estimer ou investir sur l’arc lémanique."
      />
      <Container className="pb-28 sm:pb-36">
        <div className="divide-y divide-[var(--color-stone-dark)] border-t border-[var(--color-stone-dark)]">
          {articles.map((article, i) => (
            <Reveal key={article.slug} delay={i * 80}>
              <Link href={`/actualites/${article.slug}`} className="group flex flex-col gap-3 py-10 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
                <div>
                  <p className="font-sans text-xs uppercase tracking-[0.15em] text-[var(--color-brown)]">
                    {article.category}
                  </p>
                  <p className="link-underline mt-2 max-w-xl font-serif text-2xl italic sm:text-3xl">
                    {article.title}
                  </p>
                  <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-[var(--color-graphite)]">
                    {article.excerpt}
                  </p>
                </div>
                <p className="shrink-0 font-sans text-xs uppercase tracking-[0.15em] text-[var(--color-graphite-light)]">
                  {formatDate(article.publishedAt)} · {article.readingTime} min
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
