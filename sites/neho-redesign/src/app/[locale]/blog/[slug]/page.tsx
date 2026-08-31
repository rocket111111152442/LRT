import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { DemoBadge } from "@/components/ui/Badge";
import { RichText } from "@/components/blog/RichText";
import { FrenchContent } from "@/components/ui/FrenchContent";
import { BlogCard } from "@/components/blog/BlogCard";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd } from "@/lib/seo/jsonld";
import { blogPosts, blogCategories, getPostBySlug, getRelatedPosts, getTableOfContents } from "@/lib/data/blog";
import { formatDate } from "@/lib/utils/format";
import { siteConfig } from "@/config/site";

export function generateStaticParams() {
  return locales.flatMap((locale) => blogPosts.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const post = getPostBySlug(slug);
  if (!post) return buildMetadata({ locale, path: `/blog/${slug}`, title: dict.notFound.title, description: dict.notFound.description, noIndex: true });
  return buildMetadata({ locale, path: `/blog/${post.slug}`, title: post.title, description: post.excerpt });
}

export default async function BlogArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const category = blogCategories.find((c) => c.slug === post.category);
  const toc = getTableOfContents(post);
  const related = getRelatedPosts(post);
  const t = dict.blog;
  const url = `${siteConfig.url}/${locale}/blog/${post.slug}`;

  return (
    <div className="py-10 sm:py-14">
      <Container narrow>
        <JsonLd data={articleJsonLd(post, locale, url)} />
        <Breadcrumbs
          locale={locale}
          items={[
            { label: dict.common.breadcrumbHome, href: "" },
            { label: dict.nav.menu.discoverBlog, href: "/blog" },
            { label: post.title },
          ]}
        />

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold uppercase tracking-wide text-ivy-600">{category?.label}</span>
          <span className="flex items-center gap-1 text-ink-500">
            <Clock size={13} aria-hidden="true" /> {post.readTimeMinutes} {t.minRead}
          </span>
          <DemoBadge label={dict.meta.demoBadge} />
        </div>

        <h1 className="mt-3 font-display text-3xl text-ink-900 sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-ink-500">
          {t.byAuthor} {post.author.name} — {formatDate(post.publishedAt, locale)}
        </p>

        <div className="mt-6">
          <ShareButtons title={post.title} label={t.shareTitle} />
        </div>
      </Container>

      <Container className="mt-10">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          {toc.length > 0 ? (
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-stone-200 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">{t.tableOfContents}</p>
                <nav aria-label={t.tableOfContents}>
                  <ol className="space-y-2 text-sm">
                    {toc.map((heading) => (
                      <li key={heading.id} className={heading.level === 3 ? "pl-3" : ""}>
                        <a href={`#${heading.id}`} className="text-ink-700 hover:text-ivy-600 hover:underline">
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </aside>
          ) : null}

          <article className="max-w-2xl">
            <FrenchContent locale={locale} notice={dict.common.contentInFrench} as="div" className="mb-4">
              <RichText blocks={post.blocks} />
            </FrenchContent>

            <div className="mt-10 rounded-2xl border border-ivy-500/30 bg-ivy-100/40 p-6">
              <p className="font-display text-lg text-ink-900">{t.ctaEstimateTitle}</p>
              <p className="mt-1 text-sm text-ink-700">{t.ctaEstimateDescription}</p>
              <Button href={`/${locale}/estimation`} className="mt-4">
                {t.ctaEstimateButton}
              </Button>
            </div>
          </article>
        </div>

        {related.length > 0 ? (
          <div className="mt-16">
            <h2 className="mb-6 font-display text-2xl text-ink-900">{t.relatedArticles}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <BlogCard key={p.slug} post={p} locale={locale} minReadLabel={t.minRead} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-12">
          <Link href={`/${locale}/blog`} className="text-sm font-medium text-ivy-600 hover:underline">
            ← {t.hero.title}
          </Link>
        </div>
      </Container>
    </div>
  );
}
