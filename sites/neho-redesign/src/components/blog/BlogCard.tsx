import Link from "next/link";
import { PropertyIllustration } from "@/components/illustrations/PropertyIllustration";
import { blogCategories, type BlogPost } from "@/lib/data/blog";
import { formatDate } from "@/lib/utils/format";
import type { Locale } from "@/lib/i18n/config";

export function BlogCard({ post, locale, minReadLabel }: { post: BlogPost; locale: Locale; minReadLabel: string }) {
  const category = blogCategories.find((c) => c.slug === post.category);
  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-cream-50 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <PropertyIllustration variant={post.illustration} label={post.title} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-ivy-600">
          <span className="font-semibold uppercase tracking-wide">{category?.label}</span>
          <span aria-hidden="true">·</span>
          <span>
            {post.readTimeMinutes} {minReadLabel}
          </span>
        </div>
        <h3 className="mt-2 text-base font-semibold text-ink-900 line-clamp-2">{post.title}</h3>
        <p className="mt-2 flex-1 text-sm text-ink-500 line-clamp-2">{post.excerpt}</p>
        <p className="mt-4 text-xs text-ink-500">{formatDate(post.publishedAt, locale)}</p>
      </div>
    </Link>
  );
}
