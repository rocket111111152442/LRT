import { test } from "node:test";
import assert from "node:assert/strict";
import { contactSchema } from "../src/lib/validations/contact";
import { estimationSchema, estimationStepSchemas } from "../src/lib/validations/estimation";
import { searchAlertSchema, visitRequestSchema } from "../src/lib/validations/search-alert";
import { looksLikeSpam } from "../src/lib/forms/anti-spam";

test("contactSchema accepts a valid payload", () => {
  const result = contactSchema.safeParse({
    name: "Jeanne Dupont",
    email: "jeanne@example.ch",
    phone: "",
    subject: "Vendre un bien",
    message: "Bonjour, je souhaite être recontactée pour vendre mon appartement.",
  });
  assert.equal(result.success, true);
});

test("contactSchema rejects an invalid email", () => {
  const result = contactSchema.safeParse({
    name: "Jeanne Dupont",
    email: "pas-un-email",
    subject: "Vendre un bien",
    message: "Message assez long pour passer la validation.",
  });
  assert.equal(result.success, false);
});

test("contactSchema rejects a too-short message", () => {
  const result = contactSchema.safeParse({
    name: "Jeanne Dupont",
    email: "jeanne@example.ch",
    subject: "Vendre un bien",
    message: "Court", // 5 caractères, sous le minimum de 10
  });
  assert.equal(result.success, false);
});

test("estimationSchema accepts a complete valid payload", () => {
  const result = estimationSchema.safeParse({
    address: "Lausanne, Vaud",
    propertyType: "appartement",
    surface: 90,
    rooms: 4.5,
    yearBuilt: 2015,
    condition: "bon",
    parkingSpaces: 1,
    fullName: "Jean Martin",
    email: "jean@example.ch",
    phone: "+41 79 000 00 00",
    appointmentPreference: "matin",
  });
  assert.equal(result.success, true);
});

test("estimationSchema rejects an out-of-range surface", () => {
  const result = estimationSchema.safeParse({
    address: "Lausanne, Vaud",
    propertyType: "appartement",
    surface: 5, // sous le minimum de 10
    rooms: 4.5,
    yearBuilt: 2015,
    condition: "bon",
    parkingSpaces: 1,
    fullName: "Jean Martin",
    email: "jean@example.ch",
    phone: "+41 79 000 00 00",
    appointmentPreference: "matin",
  });
  assert.equal(result.success, false);
});

test("estimationStepSchemas has one schema per step declared in the wizard", () => {
  // 9 étapes annoncées dans le dictionnaire i18n (voir estimation.stepLabels)
  assert.equal(estimationStepSchemas.length, 9);
});

test("estimationStepSchemas validates the address step in isolation", () => {
  const schema = estimationStepSchemas[0];
  assert.ok(schema);
  assert.equal(schema.safeParse({ address: "" }).success, false);
  assert.equal(schema.safeParse({ address: "Sion" }).success, true);
});

test("searchAlertSchema requires a valid email", () => {
  assert.equal(searchAlertSchema.safeParse({ email: "not-an-email" }).success, false);
  assert.equal(searchAlertSchema.safeParse({ email: "buyer@example.ch" }).success, true);
});

test("visitRequestSchema requires a property slug", () => {
  const result = visitRequestSchema.safeParse({
    name: "Ana",
    email: "ana@example.ch",
    phone: "0791234567",
    propertySlug: "",
  });
  assert.equal(result.success, false);
});

test("looksLikeSpam flags a filled honeypot field", () => {
  assert.equal(looksLikeSpam({ website: "http://spam.example" }), true);
});

test("looksLikeSpam flags a form submitted too quickly", () => {
  assert.equal(looksLikeSpam({ renderedAt: Date.now() - 100 }), true);
});

test("looksLikeSpam accepts a normal, human-paced submission", () => {
  assert.equal(looksLikeSpam({ website: "", renderedAt: Date.now() - 5000 }), false);
});
