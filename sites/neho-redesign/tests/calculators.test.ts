import { test } from "node:test";
import assert from "node:assert/strict";
import { computeTraditionalFee, computeSavings } from "../src/lib/calculators/savings";
import { computeBuyingCapacity } from "../src/lib/calculators/capacity";

test("computeTraditionalFee applies the commission percentage to the sale price", () => {
  assert.equal(computeTraditionalFee(1_000_000, 3), 30_000);
  assert.equal(computeTraditionalFee(2_450_000, 2.5), 61_250);
});

test("computeSavings is the positive difference between traditional and fixed fee", () => {
  assert.equal(computeSavings(30_000, 12_000), 18_000);
});

test("computeSavings never returns a negative amount", () => {
  // Cas où le forfait fixe dépasse la commission traditionnelle (petit bien, commission faible).
  assert.equal(computeSavings(10_000, 25_000), 0);
});

test("computeBuyingCapacity respects the 20% equity rule as an upper bound", () => {
  // Avec CHF 100'000 de fonds propres, le prix maximal ne peut pas dépasser 100'000 / 0.2 = 500'000,
  // même avec un revenu très élevé et un taux très bas.
  const result = computeBuyingCapacity(1_000_000, 100_000, 1);
  assert.ok(result <= 500_000 + 1);
});

test("computeBuyingCapacity respects the 33% income rule as an upper bound", () => {
  // Avec un revenu de CHF 90'000 et un taux théorique de 5%, la charge annuelle
  // maximale est 90'000 * 0.33 = 29'700, finançant au plus 29'700 / 0.05 = 594'000
  // de crédit, plus les fonds propres.
  const result = computeBuyingCapacity(90_000, 2_000_000, 5);
  assert.ok(result <= 594_000 + 2_000_000 + 1);
});

test("computeBuyingCapacity never returns a negative amount", () => {
  assert.equal(computeBuyingCapacity(0, 0, 5), 0);
});

test("computeBuyingCapacity increases with more equity, all else equal", () => {
  const low = computeBuyingCapacity(150_000, 50_000, 5);
  const high = computeBuyingCapacity(150_000, 150_000, 5);
  assert.ok(high > low);
});
