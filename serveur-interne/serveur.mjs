#!/usr/bin/env node
/**
 * Serveur interne Body Studio
 * ---------------------------
 * Sert le dossier public/ (dont body-studio.html) sur le PC et sur le
 * réseau local (Wi-Fi). Aucune dépendance : Node.js suffit.
 *
 * - Avec cert.pem + key.pem présents  -> HTTPS (caméra OK depuis un téléphone)
 * - Sans certificats                  -> HTTP (caméra OK uniquement via localhost)
 *
 * Lancement : double-clique sur demarrer-serveur.bat
 *             ou : node serveur-interne/serveur.mjs
 */
import { createServer as createHttpsServer } from "node:https";
import { createServer as createHttpServer } from "node:http";
import { readFileSync, existsSync, statSync, createReadStream } from "node:fs";
import { networkInterfaces } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, "..", "public");
const PORT = Number(process.env.PORT || 8443);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

function handler(req, res) {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, "http://interne").pathname);
    if (urlPath === "/") {
      res.writeHead(302, { Location: "/body-studio.html" });
      return res.end();
    }
    const fichier = path.resolve(path.join(RACINE, urlPath));
    if (!fichier.startsWith(RACINE)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Interdit");
    }
    if (!existsSync(fichier) || !statSync(fichier).isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Introuvable : " + urlPath);
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(fichier).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    createReadStream(fichier).pipe(res);
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Erreur serveur");
  }
}

const certPath = path.join(__dirname, "cert.pem");
const keyPath = path.join(__dirname, "key.pem");
const modeHttps = existsSync(certPath) && existsSync(keyPath);

const server = modeHttps
  ? createHttpsServer({ cert: readFileSync(certPath), key: readFileSync(keyPath) }, handler)
  : createHttpServer(handler);

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error(`\n❌ Le port ${PORT} est déjà utilisé (le serveur tourne peut-être déjà ?).`);
    console.error(`   Ferme l'autre fenêtre, ou lance avec un autre port : PORT=9443 node serveur.mjs\n`);
  } else {
    console.error("\n❌ Erreur serveur :", e.message, "\n");
  }
  process.exit(1);
});

server.listen(PORT, "0.0.0.0", () => {
  const proto = modeHttps ? "https" : "http";
  const ips = [];
  for (const addrs of Object.values(networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.family === "IPv4" && !a.internal) ips.push(a.address);
    }
  }
  console.log("");
  console.log("==============================================");
  console.log("   🕺 SERVEUR INTERNE BODY STUDIO démarré !");
  console.log("==============================================");
  console.log("");
  console.log(`   Sur CE PC       :  ${proto}://localhost:${PORT}/`);
  for (const ip of ips) {
    console.log(`   Sur le réseau   :  ${proto}://${ip}:${PORT}/   (téléphone/tablette sur le même Wi-Fi)`);
  }
  console.log("");
  if (modeHttps) {
    console.log("   ⚠️  Certificat auto-signé : le navigateur affichera un");
    console.log("      avertissement de sécurité la première fois.");
    console.log("      → Clique « Paramètres avancés » puis « Continuer vers le site ».");
  } else {
    console.log("   ⚠️  Mode HTTP (pas de certificat trouvé) : la caméra ne");
    console.log("      fonctionnera que sur ce PC via localhost.");
    console.log("      Pour le réseau, lance demarrer-serveur.bat (il génère le certificat).");
  }
  console.log("");
  console.log("   💡 Si Windows demande une autorisation pare-feu : « Autoriser l'accès ».");
  console.log("   Appuie sur Ctrl+C pour arrêter le serveur.");
  console.log("");
});
