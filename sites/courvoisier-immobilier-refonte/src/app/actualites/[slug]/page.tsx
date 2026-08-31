import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { articles, getArticle } from "@/lib/data/articles";
import { formatDate } from "@/lib/utils/format";
import { pageMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return pageMetadata({ title: article.title, description: article.excerpt, path: `/actualites/${article.slug}` });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 2);

  return (
    <>
      <JsonLd data={articleJsonLd(article)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Actualités", path: "/actualites" },
          { name: article.title, path: `/actualites/${article.slug}` },
        ])}
      />

      <article className="pb-28 pt-40 sm:pt-48">
        <Container className="max-w-(--container-copy)">
          <Eyebrow>{article.category}</Eyebrow>
          <h1 className="mt-5 font-serif text-4xl italic leading-[1.1] sm:text-5xl">{article.title}</h1>
          <p className="mt-5 font-sans text-xs uppercase tracking-[0.15em] text-[var(--color-graphite-light)]">
            {formatDate(article.publishedAt)} · {article.readingTime} min de lecture
          </p>

          <div className="mt-12 space-y-6">
            {article.content.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="font-sans text-lg leading-relaxed text-[var(--color-graphite)]">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-16 border-t border-[var(--color-stone-dark)] pt-10">
            <p className="font-serif text-2xl italic">Une question sur votre situation ?</p>
            <Button href="/estimer" className="mt-5">
              Estimer mon bien
            </Button>
          </div>
        </Container>
      </article>

      {related.length > 0 && (
        <section className="border-t border-[var(--color-stone-dark)] bg-[var(--color-stone)]/40 py-20">
          <Container>
            <Eyebrow>À lire aussi</Eyebrow>
            <div className="mt-8 grid gap-10 sm:grid-cols-2">
              {related.map((a) => (
                <Link key={a.slug} href={`/actualites/${a.slug}`} className="link-underline block">
                  <p className="font-serif text-2xl italic">{a.title}</p>
                  <p className="mt-2 font-sans text-sm text-[var(--color-graphite)]">{a.excerpt}</p>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
