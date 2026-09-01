import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ArchitecturalScene } from "@/components/illustrations/ArchitecturalScene";
import { blogPosts, getPostBySlug } from "@/lib/data/blog";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CH", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <div className="bg-pine pt-28 sm:pt-32">
        <Container className="pb-10">
          <nav aria-label="Fil d'Ariane" className="text-[0.75rem] text-paper/50">
            <Link href="/blog" className="hover:text-paper">
              Blog
            </Link>
            <span className="mx-2">/</span>
            <span className="text-paper/80">{post.title}</span>
          </nav>
          <p className="mt-6 text-[0.6875rem] uppercase tracking-[0.18em] text-clay-soft">
            {post.category} · {formatDate(post.date)} · {post.readingTime} de lecture
          </p>
          <h1 className="mt-4 max-w-2xl text-balance font-serif text-[2rem] leading-[1.15] text-paper sm:text-[2.6rem]">
            {post.title}
          </h1>
        </Container>
      </div>

      <Container className="pb-0">
        <div className="relative aspect-[16/8] overflow-hidden">
          <ArchitecturalScene variant={post.scene} label={post.title} className="h-full w-full" />
        </div>
      </Container>

      <Section tone="paper">
        <Container narrow>
          <div className="space-y-6">
            {post.content.map((paragraph, i) => (
              <p key={i} className="text-[1.0625rem] leading-relaxed text-ink-soft">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-start gap-6 border-t border-stone pt-10 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-soft">Une question sur votre projet immobilier ?</p>
            <Button href="/contact">Nous contacter</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
