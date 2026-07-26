import assert from "node:assert/strict";
import test from "node:test";
import {
  BASE_PLAN,
  GB,
  evaluateUsage,
  resolveAccountLimits,
} from "../src/lib/plans";

test("le stockage acheté augmente la capacité effective", () => {
  const limits = resolveAccountLimits({
    plan: "basic",
    storageAddonGb: 25,
  });

  assert.equal(limits.storageBytes, BASE_PLAN.storageBytes + 25 * GB);
});

test("les anciens achats enregistrés comme plan restent pris en compte", () => {
  const limits = resolveAccountLimits({
    plan: "extra_storage_10gb",
    storageAddonGb: 0,
  });

  assert.equal(limits.storageBytes, BASE_PLAN.storageBytes + 10 * GB);
});

test("l'évaluation expose précisément l'espace restant", () => {
  const evaluation = evaluateUsage({
    limits: {
      ...BASE_PLAN,
      storageBytes: 10 * GB,
    },
    storageUsedBytes: 3 * GB,
    repairsThisMonth: 12,
  });

  assert.equal(evaluation.storageRemainingBytes, 7 * GB);
  assert.equal(evaluation.storagePercent, 30);
  assert.equal(evaluation.storageFreePercent, 70);
  assert.equal(evaluation.storageState, "ok");
});
