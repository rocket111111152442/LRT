import { test } from "node:test";
import assert from "node:assert/strict";
import { filterProperties } from "../src/lib/search/filter-properties";
import { properties } from "../src/lib/data/properties";

test("filterProperties splits by transaction type", () => {
  const forSale = filterProperties(properties, { transaction: "vente" });
  const forRent = filterProperties(properties, { transaction: "location" });
  assert.ok(forSale.every((p) => p.transaction === "vente"));
  assert.ok(forRent.every((p) => p.transaction === "location"));
  assert.equal(forSale.length + forRent.length, properties.length);
});

test("filterProperties filters by category", () => {
  const result = filterProperties(properties, { transaction: "vente", category: "Maison" });
  assert.ok(result.length > 0);
  assert.ok(result.every((p) => p.category === "Maison"));
});

test("filterProperties 'Tous' category does not filter", () => {
  const withAll = filterProperties(properties, { transaction: "vente", category: "Tous" });
  const withoutCategory = filterProperties(properties, { transaction: "vente" });
  assert.equal(withAll.length, withoutCategory.length);
});

test("filterProperties filters by locality substring, case-insensitive", () => {
  const result = filterProperties(properties, { transaction: "vente", locality: "rolle" });
  assert.ok(result.length > 0);
  assert.ok(result.every((p) => p.locality.toLowerCase().includes("rolle")));
});

test("filterProperties filters by minimum rooms", () => {
  const result = filterProperties(properties, { transaction: "vente", minRooms: 5 });
  assert.ok(result.every((p) => p.rooms >= 5));
});

test("filterProperties filters by maximum price, keeping price-on-request items", () => {
  const result = filterProperties(properties, { transaction: "vente", maxPrice: 2_000_000 });
  assert.ok(result.every((p) => p.price === null || p.price <= 2_000_000));
});
