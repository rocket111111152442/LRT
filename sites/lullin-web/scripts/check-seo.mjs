// Contrôle rapide après build : chaque page a un JSON-LD valide, un titre unique et un contenu statique.
import { readFileSync } from 'node:fs';
const pages = Object.keys(JSON.parse(readFileSync('src/seo.json', 'utf8'))).map((p) => (p === '/' ? 'index.html' : `${p.slice(1)}/index.html`));
const titles = new Set();
for (const page of pages) {
  const html = readFileSync(`dist/${page}`, 'utf8');
  const json = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  const types = json['@graph'].map((n) => (Array.isArray(n['@type']) ? n['@type'].join('+') : n['@type']));
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  if (titles.has(title)) throw new Error(`Titre dupliqué : ${title}`);
  titles.add(title);
  const fallback = html.match(/<main class="seo-fallback">(.*?)<\/main>/s)[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log(`${page.padEnd(26)} ${title.length.toString().padStart(3)} car. | ${types.join(', ')} | offres: ${(json['@graph'][0].makesOffer || []).length} | texte statique: ${fallback.split(' ').length} mots`);
}
