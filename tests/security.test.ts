import assert from "node:assert/strict";
import test from "node:test";
import { escapeCsvCell } from "../src/lib/csvSecurity";
import { validateControlSignal } from "../src/lib/controlSignalValidation";
import {
  isAllowedSmtpPort,
  isPrivateOrReservedIp,
  resolvePublicSmtpHost,
} from "../src/lib/networkSecurity";
import {
  createRepairAccessToken,
  verifyRepairAccessToken,
  verifyRepairEmail,
} from "../src/lib/repairAccess";
import {
  isSameOriginRequest,
  normalizedOrigin,
} from "../src/lib/requestSecurity";
import { isFreeAccessCode } from "../src/lib/pro/promoCodes";
import { clientIp } from "../src/lib/rateLimit";
import {
  decryptSecret,
  encryptSecret,
  isEncryptedSecret,
} from "../src/lib/secretEncryption";
import { validateRepairInput } from "../src/lib/repairValidation";

process.env.AUTH_SECRET =
  "security-tests-only-secret-0123456789abcdef0123456789abcdef";

test("les secrets sont chiffres et authentifies", () => {
  const encrypted = encryptSecret("mot-de-passe-application");

  assert.ok(encrypted?.startsWith("enc:v1:"));
  assert.equal(isEncryptedSecret(encrypted), true);
  assert.notEqual(encrypted, "mot-de-passe-application");
  assert.equal(decryptSecret(encrypted), "mot-de-passe-application");

  const tampered = `${encrypted?.slice(0, -1)}A`;
  assert.equal(decryptSecret(tampered), "");
});

test("un lien client est lie a la fiche et a son email", () => {
  const repair = {
    id: "repair-1",
    ticketNumber: "QOR-123456",
    email: "client@example.com",
  };
  const token = createRepairAccessToken(repair);

  assert.equal(verifyRepairAccessToken(repair, token), true);
  assert.equal(
    verifyRepairAccessToken({ ...repair, id: "repair-2" }, token),
    false,
  );
  assert.equal(verifyRepairEmail(repair, " CLIENT@example.com "), true);
  assert.equal(verifyRepairEmail(repair, "autre@example.com"), false);
});

test("le code gratuit est desactive sans secret serveur", () => {
  const previousCode = process.env.FREE_ACCESS_CODE;
  delete process.env.FREE_ACCESS_CODE;
  assert.equal(isFreeAccessCode("REP2026"), false);
  process.env.FREE_ACCESS_CODE = "CODE-SERVEUR-UNIQUE";
  assert.equal(isFreeAccessCode("code-serveur-unique"), true);

  if (previousCode === undefined) {
    delete process.env.FREE_ACCESS_CODE;
  } else {
    process.env.FREE_ACCESS_CODE = previousCode;
  }
});

test("l adresse IP de limitation ignore les prefixes falsifies", () => {
  const request = new Request("https://www.qoravo.fr/api/test", {
    headers: {
      "x-forwarded-for": "198.51.100.10, 203.0.113.20",
      "x-real-ip": "192.0.2.30",
    },
  });

  assert.equal(clientIp(request), "192.0.2.30");
});

test("les requetes cross-site sont refusees", () => {
  assert.equal(normalizedOrigin("HTTPS://WWW.QORAVO.FR/path"), "https://www.qoravo.fr");
  assert.equal(
    isSameOriginRequest({
      origin: "https://www.qoravo.fr",
      requestOrigin: "https://www.qoravo.fr",
      fetchSite: "same-origin",
    }),
    true,
  );
  assert.equal(
    isSameOriginRequest({
      origin: "https://evil.example",
      requestOrigin: "https://www.qoravo.fr",
      fetchSite: "cross-site",
    }),
    false,
  );
});

test("les exports CSV neutralisent les formules", () => {
  assert.equal(escapeCsvCell("=HYPERLINK(\"https://evil\")"), '"\'=HYPERLINK(""https://evil"")"');
  assert.equal(escapeCsvCell("Client normal"), '"Client normal"');
});

test("les endpoints SMTP internes et les ports inhabituels sont bloques", async () => {
  assert.equal(isPrivateOrReservedIp("127.0.0.1"), true);
  assert.equal(isPrivateOrReservedIp("10.0.0.5"), true);
  assert.equal(isPrivateOrReservedIp("169.254.169.254"), true);
  assert.equal(isPrivateOrReservedIp("8.8.8.8"), false);
  assert.equal(isPrivateOrReservedIp("::1"), true);
  assert.equal(isAllowedSmtpPort(587), true);
  assert.equal(isAllowedSmtpPort(8080), false);
  assert.equal(await resolvePublicSmtpHost("localhost", 587), null);
});

test("les photos et champs trop volumineux sont refuses", () => {
  const baseInput = {
    firstName: "Jean",
    lastName: "Dupont",
    phone: "0600000000",
    email: "jean@example.com",
    deviceType: "Telephone",
    brand: "Qoravo",
    model: "Test",
    issueDescription: "Un probleme suffisamment detaille.",
  };

  assert.equal(validateRepairInput(baseInput).ok, true);
  assert.equal(
    validateRepairInput({
      ...baseInput,
      issueDescription: "x".repeat(5_001),
    }).ok,
    false,
  );
  assert.equal(
    validateRepairInput({
      ...baseInput,
      photos: ["data:image/svg+xml;base64,PHN2Zz48L3N2Zz4="],
    }).ok,
    false,
  );
});

test("les signaux de partage d ecran sont limites par role et par taille", () => {
  const offer = validateControlSignal(
    {
      kind: "OFFER",
      payload: JSON.stringify({ type: "offer", sdp: "v=0\r\n" }),
    },
    "CLIENT",
  );

  assert.equal(offer.ok, true);
  assert.equal(
    validateControlSignal(
      {
        kind: "ANSWER",
        payload: JSON.stringify({ type: "answer", sdp: "v=0\r\n" }),
      },
      "CLIENT",
    ).ok,
    false,
  );
  assert.equal(
    validateControlSignal(
      {
        kind: "ICE",
        payload: JSON.stringify({ candidate: "x".repeat(8_001) }),
      },
      "MODERATOR",
    ).ok,
    false,
  );
});
