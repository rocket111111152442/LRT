import { test } from "node:test";
import assert from "node:assert/strict";
import { properties } from "../src/lib/data/properties";
import { promotions } from "../src/lib/data/promotions";
import { agencies } from "../src/lib/data/agencies";
import { services } from "../src/lib/data/services";
import { articles } from "../src/lib/data/articles";

function assertUniqueSlugs(items: { slug: string }[], label: string) {
  const slugs = items.map((i) => i.slug);
  assert.equal(new Set(slugs).size, slugs.length, `${label} contient des slugs dupliqués`);
}

test("properties have unique slugs", () => {
  assertUniqueSlugs(properties, "properties");
});

test("promotions have unique slugs", () => {
  assertUniqueSlugs(promotions, "promotions");
});

test("articles have unique slugs", () => {
  assertUniqueSlugs(articles, "articles");
});

test("every property references an existing agency", () => {
  const agencyIds = new Set(agencies.map((a) => a.id));
  for (const property of properties) {
    assert.ok(agencyIds.has(property.agencyId), `Agence inconnue pour ${property.slug}: ${property.agencyId}`);
  }
});

test("every property has a positive surface or land surface", () => {
  for (const property of properties) {
    assert.ok(
      property.surface > 0 || (property.landSurface ?? 0) > 0,
      `${property.slug} n'a ni surface ni surface de terrain`
    );
  }
});

test("services are numbered sequentially from 01", () => {
  services.forEach((service, index) => {
    assert.equal(service.number, String(index + 1).padStart(2, "0"));
  });
});

test("there are exactly three agencies (Lausanne, Rolle, Lonay)", () => {
  assert.equal(agencies.length, 3);
  const cities = agencies.map((a) => a.city).sort();
  assert.deepEqual(cities, ["Lausanne", "Lonay", "Rolle"]);
});

test("articles expose non-empty content paragraphs", () => {
  for (const article of articles) {
    assert.ok(article.content.length > 0, `${article.slug} n'a pas de contenu`);
    assert.ok(article.content.every((p) => p.length > 20));
  }
});
