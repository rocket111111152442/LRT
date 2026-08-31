"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BlogCard } from "@/components/blog/BlogCard";
import { blogCategories, type BlogPost, type BlogCategory } from "@/lib/data/blog";
import { cn } from "@/lib/utils/format";
import type { Dictionary } from "@/lib/i18n/dictionary-type";
import type { Locale } from "@/lib/i18n/config";

export function BlogListClient({ posts, locale, dict }: { posts: BlogPost[]; locale: Locale; dict: Dictionary }) {
  const t = dict.blog;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BlogCategory | "all">("all");

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      if (category !== "all" && post.category !== category) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q);
      }
      return true;
    });
  }, [posts, query, category]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={cn("rounded-full px-4 py-2 text-sm font-medium", category === "all" ? "bg-ink-900 text-cream-50" : "bg-stone-200 text-ink-700 hover:bg-stone-300")}
          >
            {t.allCategory}
          </button>
          {blogCategories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setCategory(cat.slug)}
              className={cn("rounded-full px-4 py-2 text-sm font-medium", category === cat.slug ? "bg-ink-900 text-cream-50" : "bg-stone-200 text-ink-700 hover:bg-stone-300")}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" aria-hidden="true" />
          <label htmlFor="blog-search" className="sr-only">
            {t.searchPlaceholder}
          </label>
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="input-field pl-9"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} locale={locale} minReadLabel={t.minRead} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-ink-500">{dict.properties.empty.title}</p>
      )}
    </div>
  );
}
