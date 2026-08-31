import { test } from "node:test";
import assert from "node:assert/strict";
import { contactSchema } from "../src/lib/validations/contact";
import { estimationSchema } from "../src/lib/validations/estimation";
import { visitRequestSchema } from "../src/lib/validations/visit-request";
import { looksLikeSpam } from "../src/lib/forms/anti-spam";

test("contactSchema accepts a valid submission", () => {
  const result = contactSchema.safeParse({
    name: "Marie Dupont",
    email: "marie@example.com",
    subject: "Question sur un bien",
    message: "Bonjour, je souhaite plus d'informations sur ce bien.",
  });
  assert.ok(result.success);
});

test("contactSchema rejects an invalid e-mail", () => {
  const result = contactSchema.safeParse({
    name: "Marie Dupont",
    email: "pas-un-email",
    subject: "Question",
    message: "Message suffisamment long pour passer la validation.",
  });
  assert.equal(result.success, false);
});

test("estimationSchema requires a known property type and method", () => {
  const base = {
    locality: "Rolle",
    projectTiming: "moins-3-mois",
    name: "Jean Martin",
    email: "jean@example.com",
  };
  assert.equal(
    estimationSchema.safeParse({ ...base, propertyType: "maison", method: "en-vrai" }).success,
    true
  );
  assert.equal(
    estimationSchema.safeParse({ ...base, propertyType: "chateau", method: "en-vrai" }).success,
    false
  );
});

test("visitRequestSchema requires a property reference", () => {
  const result = visitRequestSchema.safeParse({
    propertySlug: "maison-contemporaine-rolle",
    propertyTitle: "Maison contemporaine avec vue sur le lac",
    name: "Alice Rey",
    email: "alice@example.com",
  });
  assert.ok(result.success);
});

test("looksLikeSpam flags a filled honeypot", () => {
  assert.equal(looksLikeSpam({ website: "http://spam.example" }), true);
});

test("looksLikeSpam flags a submission that is too fast", () => {
  assert.equal(looksLikeSpam({ renderedAt: Date.now() - 100 }), true);
});

test("looksLikeSpam allows a normal, deliberate submission", () => {
  assert.equal(looksLikeSpam({ renderedAt: Date.now() - 5000 }), false);
});
