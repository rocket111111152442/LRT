import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { buildMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DemoBadge } from "@/components/ui/Badge";
import { BlogListClient } from "@/components/blog/BlogListClient";
import { getAllPosts } from "@/lib/data/blog";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, path: "/blog", title: dict.blog.hero.title, description: dict.blog.hero.description });
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <Breadcrumbs locale={locale} items={[{ label: dict.common.breadcrumbHome, href: "" }, { label: dict.nav.menu.discoverBlog }]} />
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">{dict.blog.hero.title}</h1>
          <DemoBadge label={dict.meta.demoBadge} />
        </div>
        <p className="mt-3 max-w-2xl text-ink-500">{dict.blog.hero.description}</p>

        <div className="mt-10">
          <BlogListClient posts={getAllPosts()} locale={locale} dict={dict} />
        </div>
      </Container>
    </div>
  );
}
