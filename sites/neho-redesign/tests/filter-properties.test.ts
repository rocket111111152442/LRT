import { test } from "node:test";
import assert from "node:assert/strict";
import {
  filterProperties,
  filtersToSearchParams,
  parseFiltersFromSearchParams,
} from "../src/lib/search/filter-properties";
import { properties } from "../src/lib/data/properties";

test("filterProperties returns everything when no filter is applied", () => {
  const result = filterProperties(properties, {});
  assert.equal(result.length, properties.length);
});

test("filterProperties filters by property type", () => {
  const result = filterProperties(properties, { type: "terrain" });
  assert.ok(result.length > 0);
  assert.ok(result.every((p) => p.type === "terrain"));
});

test("filterProperties filters by price range", () => {
  const result = filterProperties(properties, { priceMin: 1_000_000, priceMax: 2_000_000 });
  assert.ok(result.every((p) => p.price >= 1_000_000 && p.price <= 2_000_000));
});

test("filterProperties filters by minimum rooms", () => {
  const result = filterProperties(properties, { roomsMin: 5 });
  assert.ok(result.every((p) => p.rooms >= 5));
});

test("filterProperties land-only filter excludes properties without land", () => {
  const result = filterProperties(properties, { landOnly: true });
  assert.ok(result.every((p) => (p.landSurface ?? 0) > 0));
});

test("filterProperties sorts by ascending price", () => {
  const result = filterProperties(properties, { sort: "prix-asc" });
  for (let i = 1; i < result.length; i++) {
    assert.ok(result[i]!.price >= result[i - 1]!.price);
  }
});

test("filterProperties matches a location by commune name substring", () => {
  const result = filterProperties(properties, { location: "Nyon" });
  assert.ok(result.length > 0);
  assert.ok(result.every((p) => p.commune === "nyon"));
});

test("filtersToSearchParams and parseFiltersFromSearchParams round-trip", () => {
  const filters = { type: "villa" as const, priceMin: 500000, sort: "prix-desc" as const };
  const params = filtersToSearchParams(filters);
  const asRecord: Record<string, string> = Object.fromEntries(params.entries());
  const parsed = parseFiltersFromSearchParams(asRecord);
  assert.equal(parsed.type, "villa");
  assert.equal(parsed.priceMin, 500000);
  assert.equal(parsed.sort, "prix-desc");
});

test("filtersToSearchParams omits the default sort value", () => {
  const params = filtersToSearchParams({ sort: "pertinence" });
  assert.equal(params.has("tri"), false);
});
