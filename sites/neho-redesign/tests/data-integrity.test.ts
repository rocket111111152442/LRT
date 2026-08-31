import { test } from "node:test";
import assert from "node:assert/strict";
import { cantons } from "../src/lib/data/cantons";
import { communes } from "../src/lib/data/communes";
import { agents } from "../src/lib/data/agents";
import { properties } from "../src/lib/data/properties";
import { testimonials } from "../src/lib/data/testimonials";
import { blogPosts } from "../src/lib/data/blog";
import { pricingTiers, pricingFeatureMatrix } from "../src/config/site-numbers";

function uniqueSlugs(items: { slug: string }[]) {
  return new Set(items.map((i) => i.slug)).size === items.length;
}

test("every commune references an existing canton", () => {
  const cantonSlugs = new Set(cantons.map((c) => c.slug));
  for (const commune of communes) {
    assert.ok(cantonSlugs.has(commune.canton), `Commune ${commune.slug} references unknown canton ${commune.canton}`);
  }
});

test("every agent references an existing canton and known communes", () => {
  const cantonSlugs = new Set(cantons.map((c) => c.slug));
  const communeSlugs = new Set(communes.map((c) => c.slug));
  for (const agent of agents) {
    assert.ok(cantonSlugs.has(agent.canton), `Agent ${agent.slug} references unknown canton ${agent.canton}`);
    for (const communeSlug of agent.communes) {
      assert.ok(communeSlugs.has(communeSlug), `Agent ${agent.slug} references unknown commune ${communeSlug}`);
    }
  }
});

test("every property references an existing commune, canton and agent", () => {
  const cantonSlugs = new Set(cantons.map((c) => c.slug));
  const communeSlugs = new Set(communes.map((c) => c.slug));
  const agentSlugs = new Set(agents.map((a) => a.slug));
  for (const property of properties) {
    assert.ok(communeSlugs.has(property.commune), `Property ${property.slug} references unknown commune ${property.commune}`);
    assert.ok(cantonSlugs.has(property.canton), `Property ${property.slug} references unknown canton ${property.canton}`);
    assert.ok(agentSlugs.has(property.agentSlug), `Property ${property.slug} references unknown agent ${property.agentSlug}`);
  }
});

test("every testimonial references an existing commune and canton", () => {
  const cantonSlugs = new Set(cantons.map((c) => c.slug));
  const communeSlugs = new Set(communes.map((c) => c.slug));
  for (const testimonial of testimonials) {
    assert.ok(communeSlugs.has(testimonial.commune), `Testimonial ${testimonial.slug} references unknown commune ${testimonial.commune}`);
    assert.ok(cantonSlugs.has(testimonial.canton), `Testimonial ${testimonial.slug} references unknown canton ${testimonial.canton}`);
  }
});

test("all slugs are unique within each demo dataset", () => {
  assert.ok(uniqueSlugs(cantons));
  assert.ok(uniqueSlugs(communes));
  assert.ok(uniqueSlugs(agents));
  assert.ok(uniqueSlugs(properties));
  assert.ok(uniqueSlugs(testimonials));
  assert.ok(uniqueSlugs(blogPosts));
});

test("pricing feature matrix only references the three declared tiers", () => {
  const tierIds = new Set(pricingTiers.map((t) => t.id));
  assert.equal(tierIds.size, 3);
  for (const row of pricingFeatureMatrix) {
    for (const tierId of tierIds) {
      assert.equal(typeof row[tierId as "essential" | "serenity" | "privilege"], "boolean");
    }
  }
});

test("exactly one pricing tier is marked as recommended", () => {
  const recommended = pricingTiers.filter((t) => t.recommended);
  assert.equal(recommended.length, 1);
});

test("every blog post has at least one heading for its table of contents", () => {
  for (const post of blogPosts) {
    const hasHeading = post.blocks.some((b) => b.type === "heading");
    assert.ok(hasHeading, `Blog post ${post.slug} has no heading block`);
  }
});
