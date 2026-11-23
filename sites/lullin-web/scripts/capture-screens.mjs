// Capture pleine page des réalisations (src/content/projects.ts) avec Playwright.
// Usage : node scripts/capture-screens.mjs   → .captures/raw/<slug>.png + .captures/meta.json
// Puis   : python3 scripts/build-textures.py  → public/screens/{wall,wall-sm,feature,feature-sm}
import { chromium } from "playwright";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(new URL("../src/content/projects.ts", import.meta.url), "utf8");
const sites = [...src.matchAll(/slug: "([^"]+)", name: "([^"]+)", url: "([^"]+)"/g)].map((m) => ({
  slug: m[1],
  name: m[2],
  url: m[3],
}));
const out = new URL("../.captures/", import.meta.url);
mkdirSync(new URL("raw/", out), { recursive: true });

const browser = await chromium.launch();
const meta = [];
for (const s of sites) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  try {
    const res = await page.goto(s.url, { waitUntil: "networkidle", timeout: 45000 });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    // Déclenche le chargement paresseux et les animations d'apparition.
    for (let y = 0; y < Math.min(total, 6000); y += 500) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(220);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(900);
    const info = await page.evaluate(() => ({
      title: document.title,
      h1: (document.querySelector("h1")?.innerText || "").replace(/\s+/g, " ").trim(),
      height: document.documentElement.scrollHeight,
    }));
    await page.screenshot({
      path: new URL(`raw/${s.slug}.png`, out).pathname,
      clip: { x: 0, y: 0, width: 1280, height: Math.min(info.height, 6400) },
      fullPage: true,
    });
    meta.push({ ...s, ...info, status: res?.status(), ok: res?.ok() ?? false });
    console.log(res?.ok() ? "OK  " : "HTTP", res?.status(), s.slug, "|", info.h1);
  } catch (e) {
    meta.push({ ...s, ok: false });
    console.log("FAIL", s.slug, String(e).split("\n")[0]);
  }
  await ctx.close();
}
await browser.close();
writeFileSync(new URL("meta.json", out), JSON.stringify(meta, null, 2));
