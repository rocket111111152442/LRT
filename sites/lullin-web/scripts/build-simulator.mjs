// Génère dist/simulateur-prix-site-internet/index.html (simulateur de prix).
// Lancé en dernier dans « npm run build » : reprend l'en-tête, le menu mobile, le pied
// de page et la feuille de style hashée de dist/blog/index.html, ajoute la page au
// sitemap, des encarts vers le simulateur dans les articles du blog, les boutons d'accès au
// simulateur (navigation, menu mobile, pied de page, bouton flottant) et la mesure d'audience
// sur les pages statiques. Le site React reçoit les mêmes boutons de src/fx-simulator.ts,
// avec les styles de src/fx-simulator.css et src/fx-consent.css.
// Les tarifs viennent de public/simulateur/tarifs.js (même fichier que le navigateur).

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const { FORMULES, PAGE, MAIL, OPTIONS, PRIORITY, MAINTENANCE, LIMITS } = await import('../public/simulateur/tarifs.js');
const { DEFAULT_STATE, estimate, renderSummary, contactHref, euro } = await import('../public/simulateur/simulateur.js');

const SITE = 'https://www.lullin-web.com';
const PATH = '/simulateur-prix-site-internet';
const PAGE_URL = `${SITE}${PATH}`;
const TITLE = 'Simulateur prix site internet : estimez votre site | Lullin Web';
const DESCRIPTION =
  'Combien coûte votre site internet ? Estimez gratuitement son prix selon le type de site, le nombre de pages, les options et la maintenance. Tarifs Lullin Web dès 349 €.';
const TODAY = new Date().toISOString().slice(0, 10);

const fail = (message) => {
  console.error(`build-simulator : ${message}`);
  process.exit(1);
};
const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
const version = (file) => createHash('sha1').update(readFileSync(join(root, 'public', file))).digest('hex').slice(0, 10);
const ARROW =
  '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>';

/* ---------- Boutons d'accès (mêmes classes que src/fx-simulator.ts) ---------- */

function addEntryButtons(html, current = false) {
  if (html.includes('fx-simu-nav')) return html;
  const here = current ? ' aria-current="page"' : '';
  return html
    .replace('<a href="/offres">Offres<span></span></a>', (m) => `${m}<a href="${PATH}" class="fx-simu-nav"${here}><i aria-hidden="true">€</i>Simulateur de prix</a>`)
    .replace('<nav aria-label="Navigation mobile">', (m) => `${m}<a href="${PATH}" class="fx-simu-menu"${here}><small>Gratuit</small>Simulateur de prix</a>`)
    .replace(/<nav class="footer-nav"[^>]*>[\s\S]*?<a href="\/offres">Offres<\/a>/, (m) => `${m}<a href="${PATH}"${here}>Simulateur de prix</a>`);
}

// Mesure d'audience soumise au consentement, inactive sans identifiant GA4 (voir plus bas).
const CONSENT = '<script type="module" src="/analytics/consent.js"></script>\n';

// Bouton flottant sur mobile (pas sur le simulateur, qui a sa propre barre d'estimation).
const FLOAT = `<a href="${PATH}" class="fx-simu-float" aria-label="Simulateur de prix"><i aria-hidden="true">€</i>Estimer mon prix</a>\n`;

/* ---------- Gabarit ---------- */

const templatePath = join(dist, 'blog', 'index.html');
if (!existsSync(templatePath)) fail('dist/blog/index.html introuvable (build-blog doit passer avant).');
const template = readFileSync(templatePath, 'utf8');
const iconsStart = template.indexOf('<link rel="icon"');
const cssMatch = template.match(/<link rel="stylesheet"[^>]*href="\/assets\/[^"]+\.css"[^>]*>/);
const bodyStart = template.indexOf('<body>');
const mainStart = template.indexOf('<main id="main">');
const mainEnd = template.indexOf('</main>');
const bodyEnd = template.lastIndexOf('</body>');
if ([iconsStart, bodyStart, mainStart, mainEnd, bodyEnd].includes(-1) || !cssMatch) fail('structure de dist/blog/index.html inattendue.');
const headAssets = template.slice(iconsStart, cssMatch.index + cssMatch[0].length);
// Le gabarit peut déjà contenir les ajouts d'un build précédent (dist réutilisé) : on les retire.
const strip = (part) =>
  part.replace(FLOAT, '').replace(CONSENT, '').replace(new RegExp(`<a href="${PATH}"[^>]*>.*?</a>`, 'g'), '');
const top = strip(template.slice(bodyStart, mainStart)).replace(/ aria-current="page"/g, '');
const bottom = strip(template.slice(mainEnd, bodyEnd));

/* ---------- Contenu ---------- */

const initial = estimate(DEFAULT_STATE);

const FAQ = [
  {
    q: 'Combien coûte un site internet chez Lullin Web ?',
    a: `La création d’un site coûte de ${euro(349)} (formule Essentiel, à partir de) à ${euro(949)} (formule Premium), selon le nombre de pages et le niveau de personnalisation. Les options (blog, réservation, langue supplémentaire…) s’ajoutent selon vos besoins, et la maintenance est facultative : de ${euro(39)} à ${euro(119)} par mois.`,
  },
  {
    q: 'L’estimation du simulateur est-elle un devis ?',
    a: 'Non. Elle applique nos tarifs publics, mais certaines options sont « à partir de » : leur prix exact dépend de votre projet. Ce sont des tarifs de lancement, confirmés par un devis gratuit et sans engagement. Aucune prestation n’est lancée sans devis accepté.',
  },
  {
    q: 'Combien coûte une page supplémentaire ?',
    a: `${euro(PAGE.price)} par page au-delà des pages incluses dans votre formule (1 page en Essentiel, jusqu’à 5 en Vitrine, 8 en Business et 12 en Premium). Quand les pages supplémentaires coûtent presque autant que la formule supérieure, le simulateur vous le signale.`,
  },
  {
    q: 'Quels frais prévoir après la mise en ligne ?',
    a: `Le nom de domaine est inclus la première année. Ensuite, son renouvellement et l’hébergement sont compris dans les abonnements de maintenance (Essentielle ${euro(39)}, Business ${euro(69)}, Visibilité ${euro(119)} par mois). Chaque adresse mail professionnelle supplémentaire coûte ${euro(MAIL.price)} par an.`,
  },
  {
    q: 'Suis-je obligé de prendre un abonnement de maintenance ?',
    a: 'Non. La création du site et la maintenance sont deux services différents : vous pouvez simplement acheter votre site, ou nous confier aussi sa gestion.',
  },
  {
    q: 'Combien coûte une boutique en ligne ?',
    a: 'Elle est proposée sur devis : le prix dépend fortement du nombre de produits, des moyens de paiement et de la livraison. Choisissez « Boutique en ligne » dans le simulateur pour nous transmettre vos besoins.',
  },
  {
    q: 'Pourquoi les prix varient-ils autant d’un prestataire à l’autre ?',
    a: 'Un site fait soi-même, un freelance, une agence à forfaits ou une agence sur mesure n’incluent ni le même travail, ni le même suivi. Notre guide <a href="/blog/combien-coute-un-site-internet">Combien coûte un site internet professionnel</a> compare ces solutions avec des prix publics.',
    html: true,
  },
  {
    q: 'Que se passe-t-il quand je clique sur « Recevoir mon devis personnalisé » ?',
    a: 'Vous arrivez sur notre formulaire de contact avec vos choix déjà remplis. Vous les vérifiez, ajoutez vos coordonnées et votre message : rien n’est envoyé tant que vous ne validez pas. Nous répondons sous 48 h ouvrées.',
  },
  {
    q: 'Le simulateur enregistre-t-il mes informations ?',
    a: 'Le simulateur ne demande aucune donnée personnelle. Vos choix restent dans votre navigateur, le temps de préremplir le formulaire de contact, et seules des statistiques anonymes d’utilisation peuvent être mesurées.',
  },
];

function formuleField() {
  return FORMULES.map((f) => {
    const checked = f.id === DEFAULT_STATE.formule ? ' checked' : '';
    const price = f.quote ? 'Sur devis' : `${f.from ? 'dès ' : ''}${euro(f.price)}`;
    return `<label class="simu-card${checked ? ' selected' : ''}" data-simu-choice><input type="radio" name="formule" value="${f.id}"${checked}><span class="simu-card-top"><b>${esc(f.name)}</b><em>${price}</em></span><small>${esc(f.pitch)}</small></label>`;
  }).join('');
}

function optionsField() {
  return OPTIONS.map(
    (o) =>
      `<label class="simu-check" data-simu-choice><input type="checkbox" name="options" value="${o.id}"><span>${esc(o.title)}</span><em>${o.from ? 'dès ' : '+'}${euro(o.price)}</em></label>`,
  ).join('');
}

function maintenanceField() {
  return MAINTENANCE.map((m) => {
    const checked = m.id === DEFAULT_STATE.maintenance ? ' checked' : '';
    const price = m.price ? `${euro(m.price)} / mois` : 'Création seule';
    return `<label class="simu-card simu-card-small${checked ? ' selected' : ''}" data-simu-choice><input type="radio" name="maintenance" value="${m.id}"${checked}><span class="simu-card-top"><b>${esc(m.name)}</b>${m.recommended ? '<i>Recommandée</i>' : ''}</span><small>${price}</small></label>`;
  }).join('');
}

function stepper(name, label, value, min, max, unit) {
  return `<div class="simu-stepper"><button type="button" data-simu-step="-1" data-simu-field="${name}" aria-label="${esc(label)} : moins">−</button><output data-simu-${name}>${value}</output><button type="button" data-simu-step="1" data-simu-field="${name}" aria-label="${esc(label)} : plus">+</button><span>${unit}</span></div>`;
}

const formulesTable = FORMULES.filter((f) => !f.quote)
  .map(
    (f) =>
      `<tr><th scope="row">${esc(f.name)}</th><td>${f.from ? 'à partir de ' : ''}${euro(f.price)}</td><td>${f.pages > 1 ? `jusqu’à ${f.pages}` : '1'}</td><td>${f.mails || '—'}</td></tr>`,
  )
  .join('');
const optionsTable = [
  { title: PAGE.title, price: `+${euro(PAGE.price)}` },
  { title: MAIL.title, price: `+${euro(MAIL.price)} / an` },
  ...OPTIONS.map((o) => ({ title: o.title, price: `${o.from ? 'à partir de ' : '+'}${euro(o.price)}` })),
  { title: PRIORITY.title, price: '+25 % du prix du projet' },
]
  .map((o) => `<tr><th scope="row">${esc(o.title)}</th><td>${esc(o.price)}</td></tr>`)
  .join('');
const maintenanceTable = MAINTENANCE.filter((m) => m.price)
  .map((m) => `<tr><th scope="row">${esc(m.value)}</th><td>${euro(m.price)} / mois</td></tr>`)
  .join('');

const faqHtml = FAQ.map(
  (item, i) =>
    `<details class="simu-faq-item"${i === 0 ? ' open' : ''}><summary><h3>${esc(item.q)}</h3></summary><p>${item.html ? item.a : esc(item.a)}</p></details>`,
).join('');

const LINKS = [
  ['/offres', 'Nos offres en détail', 'Le contenu de chaque formule, des options et des abonnements.'],
  ['/blog/combien-coute-un-site-internet', 'Combien coûte un site internet ?', 'Notre guide des prix du marché, du site fait soi-même à l’agence.'],
  ['/services', 'Création, gestion et visibilité', 'Ce que nous faisons avant, pendant et après la mise en ligne.'],
  ['/referencement-seo', 'Référencement SEO', 'Être trouvé sur Google : référencement local et contenus optimisés.'],
  ['/realisations', 'Nos réalisations', 'Des exemples de sites créés pour des indépendants et des TPE.'],
  ['/faq', 'Questions fréquentes', 'Délais, contenus, nom de domaine, modifications…'],
];

const main = `<main id="main" class="simu-page">
<nav class="simu-breadcrumb wrap" aria-label="Fil d’Ariane"><ol><li><a href="/">Accueil</a></li><li><a href="/offres">Offres</a></li><li><span aria-current="page">Simulateur de prix</span></li></ol></nav>
<section class="page-heading wrap simu-heading"><p class="section-label"><span>Simulateur /</span>Gratuit · sans inscription</p><h1>Combien coûte <em>votre site internet ?</em></h1><p>Choisissez le type de site, le nombre de pages et les fonctionnalités : le simulateur calcule instantanément le prix de création et les coûts mensuels, à partir des tarifs affichés sur notre page <a href="/offres">Offres</a>. Aucune donnée personnelle demandée.</p></section>
<section class="wrap simu" aria-labelledby="simu-title">
<h2 id="simu-title" class="sr-only">Simulateur de prix de création de site internet</h2>
<form class="simu-form" data-simu-form novalidate>
<fieldset class="simu-step"><legend><span>01</span>Quel type de site ?</legend><div class="simu-cards">${formuleField()}</div></fieldset>
<fieldset class="simu-step"><legend><span>02</span>Combien de pages ?</legend><p class="simu-help">Accueil, services, à propos, contact… Chaque formule inclut un nombre de pages ; au-delà, ${euro(PAGE.price)} par page.</p><div class="simu-pages"><input type="range" name="pages" id="simu-pages" min="${LIMITS.pagesMin}" max="${LIMITS.pagesMax}" step="1" value="${DEFAULT_STATE.pages}" aria-label="Nombre de pages">${stepper('pages', 'Nombre de pages', DEFAULT_STATE.pages, LIMITS.pagesMin, LIMITS.pagesMax, 'pages')}</div></fieldset>
<fieldset class="simu-step"><legend><span>03</span>Quelles fonctionnalités en plus ?</legend><p class="simu-help">Facultatif. Les prix « dès » dépendent de votre projet et sont précisés dans le devis.</p><div class="simu-checks">${optionsField()}</div>
<div class="simu-extra"><div><b>Adresses mail supplémentaires</b><small>${euro(MAIL.price)} par an et par adresse, en plus de celles incluses.</small></div><input type="number" name="mails" min="0" max="${LIMITS.mailsMax}" value="0" hidden>${stepper('mails', 'Adresses mail supplémentaires', 0, 0, LIMITS.mailsMax, '')}</div>
<label class="simu-check simu-priority" data-simu-choice><input type="checkbox" name="priority"><span>${esc(PRIORITY.title)}<small>Votre projet passe en priorité dans notre planning.</small></span><em>+25 %</em></label></fieldset>
<fieldset class="simu-step"><legend><span>04</span>Une maintenance après la mise en ligne ?</legend><p class="simu-help">Facultatif : hébergement, sécurité, sauvegardes, modifications et suivi. Sans engagement de votre part au moment du devis.</p><div class="simu-cards simu-cards-4">${maintenanceField()}</div></fieldset>
</form>
<aside class="simu-panel" aria-labelledby="simu-panel-title"><div class="simu-panel-inner"><p class="section-label" id="simu-panel-title"><span>Estimation /</span>mise à jour en direct</p><div data-simu-summary aria-live="polite">${renderSummary(initial)}</div><a href="${esc(contactHref(initial))}" class="action simu-cta" data-simu-cta><span>Recevoir mon devis personnalisé</span><i>${ARROW}</i></a><p class="simu-fine">Gratuit et sans engagement. Vos choix sont repris dans le formulaire, vous n’avez plus qu’à les vérifier. Tarifs de lancement, confirmés par un devis gratuit.</p></div></aside>
</section>
<div class="simu-bar" data-simu-bar aria-hidden="true"><div><small>Estimation</small><b data-simu-bar-total>${initial.from ? 'dès ' : ''}${euro(initial.creation)}</b><span data-simu-bar-monthly>sans abonnement</span></div><a href="#simu-panel-title" tabindex="-1">Voir le détail</a></div>
<section class="section wrap simu-explain" aria-labelledby="simu-tarifs"><div class="section-heading"><div><p class="section-label"><span>Tarifs /</span>Ce qu’utilise le simulateur</p><h2 id="simu-tarifs">Des prix publics, <em>sans surprise.</em></h2></div><p>Le simulateur additionne exactement les tarifs de notre page <a href="/offres">Offres</a>. Le prix d’un site dépend surtout du nombre de pages, du design et des fonctionnalités : la majorité de nos créations restent sous 1 000 €.</p></div>
<div class="simu-tables"><div class="simu-table"><table><caption>Formules de création</caption><thead><tr><th scope="col">Formule</th><th scope="col">Prix</th><th scope="col">Pages</th><th scope="col">Mails pro</th></tr></thead><tbody>${formulesTable}<tr><th scope="row">Boutique en ligne</th><td colspan="3">sur devis</td></tr></tbody></table></div>
<div class="simu-table"><table><caption>Options</caption><tbody>${optionsTable}</tbody></table></div>
<div class="simu-table"><table><caption>Maintenance (facultative)</caption><tbody>${maintenanceTable}</tbody></table><p>Toutes les formules incluent le nom de domaine pendant 1 an, le certificat SSL, l’adaptation au mobile et la mise en ligne.</p></div></div>
<ol class="simu-howto"><li><b>Formule</b>Le prix de départ correspond à la formule choisie et aux pages qu’elle inclut.</li><li><b>Pages et options</b>Chaque page au-delà est facturée ${euro(PAGE.price)} ; les options s’ajoutent à leur tarif affiché.</li><li><b>Livraison prioritaire</b>Elle ajoute 25 % au prix de création, options comprises.</li><li><b>Coûts récurrents</b>La maintenance et les adresses mail supplémentaires sont présentées à part, avec un budget sur la première année.</li></ol></section>
<section class="section wrap simu-faq" aria-labelledby="simu-faq-title"><div class="section-heading"><div><p class="section-label"><span>FAQ /</span>Prix d’un site internet</p><h2 id="simu-faq-title">Vos questions <em>sur le prix.</em></h2></div></div><div class="simu-faq-list">${faqHtml}</div></section>
<section class="section wrap simu-links" aria-labelledby="simu-links-title"><p class="section-label"><span>Pour aller plus loin /</span>Avant de vous décider</p><h2 id="simu-links-title" class="sr-only">Pour aller plus loin</h2><div class="simu-link-grid">${LINKS.map(([href, title, text]) => `<a href="${href}"><b>${esc(title)}</b><span>${esc(text)}</span>${ARROW}</a>`).join('')}</div></section>
`;

/* ---------- Page ---------- */

const head = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#111211" />
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
    <title>${esc(TITLE)}</title>
    <meta name="description" content="${esc(DESCRIPTION)}" />
    <link rel="canonical" href="${PAGE_URL}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Lullin Web" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:title" content="${esc(TITLE)}" />
    <meta property="og:description" content="${esc(DESCRIPTION)}" />
    <meta property="og:url" content="${PAGE_URL}" />
    <meta property="og:image" content="${SITE}/images/og-cover.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Lullin Web, création de sites internet sur mesure" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(TITLE)}" />
    <meta name="twitter:description" content="${esc(DESCRIPTION)}" />
    <meta name="twitter:image" content="${SITE}/images/og-cover.jpg" />
    ${headAssets}
    <link rel="stylesheet" href="/simulateur/simulateur.css?v=${version('simulateur/simulateur.css')}" />
    <link rel="modulepreload" href="/simulateur/tarifs.js" />
    <style>[hidden]{display:none !important}</style>
    ${jsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: 'fr-FR',
      dateModified: TODAY,
      isPartOf: { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'Lullin Web' },
      publisher: { '@type': 'Organization', '@id': `${SITE}/#organization`, name: 'Lullin Web', url: `${SITE}/` },
      about: { '@type': 'Service', name: 'Création de site internet', provider: { '@id': `${SITE}/#organization` } },
    })}
    ${jsonLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Offres', item: `${SITE}/offres` },
        { '@type': 'ListItem', position: 3, name: 'Simulateur de prix', item: PAGE_URL },
      ],
    })}
    ${jsonLd({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a.replace(/<[^>]+>/g, '') },
      })),
    })}
  </head>
  `;

const script = `<script type="module" src="/simulateur/simulateur.js?v=${version('simulateur/simulateur.js')}"></script>\n  `;
const html = addEntryButtons(`${head}${top}${main}${bottom}${CONSENT}${script}</body>\n</html>\n`, true);
const outDir = join(dist, PATH.slice(1));
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'index.html'), html);

/* ---------- Sitemap ---------- */

const sitemapPath = join(dist, 'sitemap.xml');
const sitemap = readFileSync(sitemapPath, 'utf8');
if (!sitemap.includes(`<loc>${PAGE_URL}</loc>`)) {
  const entry = `  <url><loc>${PAGE_URL}</loc><lastmod>${TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n`;
  if (!sitemap.includes('</urlset>')) fail('dist/sitemap.xml inattendu.');
  writeFileSync(sitemapPath, sitemap.replace('</urlset>', `${entry}</urlset>`));
}

/* ---------- Liens contextuels depuis les articles du blog ---------- */

// Encart placé juste avant l'intertitre indiqué. Un intertitre renommé n'interrompt pas le
// build : l'encart est simplement omis, avec un avertissement.
const ARTICLE_LINKS = [
  {
    slug: 'combien-coute-un-site-internet',
    before: '<h2 id="trois-exemples-de-budget-sur-un-an">',
    text: 'Envie d’un chiffre pour votre propre projet ? Notre simulateur gratuit calcule le prix de votre site selon le nombre de pages, les options et la maintenance, à partir de nos tarifs publics.',
  },
  {
    slug: 'site-internet-artisan',
    before: '<h2 id="etre-trouve-sur-google-quand-on-est-artisan">',
    text: 'Combien coûterait votre site d’artisan ? Choisissez un site vitrine, le nombre de pages et les options utiles (réservation, fiche Google…) : le simulateur gratuit affiche le prix tout de suite.',
  },
];

for (const { slug, before, text } of ARTICLE_LINKS) {
  const articlePath = join(dist, 'blog', slug, 'index.html');
  if (!existsSync(articlePath)) continue;
  const article = readFileSync(articlePath, 'utf8');
  if (article.includes('aria-label="Simulateur de prix"><p>')) continue;
  if (!article.includes(before)) {
    console.warn(`build-simulator : intertitre introuvable dans ${slug}, encart non ajouté.`);
    continue;
  }
  const aside = `<aside class="blog-cta" aria-label="Simulateur de prix"><p>${esc(text)}</p><a href="${PATH}" class="action"><span>Estimer gratuitement mon site</span><i>${ARROW}</i></a></aside>\n`;
  writeFileSync(articlePath, article.replace(before, `${aside}${before}`));
}

/* ---------- Identifiant Google Analytics 4 ---------- */

// Défini dans les variables d'environnement Vercel (GA_MEASUREMENT_ID=G-XXXXXXXXXX).
// Sans lui, public/analytics/consent.js ne fait rien : ni bandeau, ni mesure.
const gaId = (process.env.GA_MEASUREMENT_ID ?? '').trim();
const consentPath = join(dist, 'analytics', 'consent.js');
if (gaId && existsSync(consentPath)) {
  if (!/^G-[A-Z0-9]{4,}$/.test(gaId)) fail(`GA_MEASUREMENT_ID invalide : « ${gaId} » (format attendu G-XXXXXXXXXX).`);
  writeFileSync(consentPath, readFileSync(consentPath, 'utf8').replace('__GA_MEASUREMENT_ID__', gaId));
}

/* ---------- Boutons d'accès sur les pages statiques du blog ---------- */

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : entry.name.endsWith('.html') ? [join(dir, entry.name)] : [],
  );
let patched = 0;
for (const file of walk(join(dist, 'blog'))) {
  const page = readFileSync(file, 'utf8');
  const next = page.includes('fx-simu-float') ? page : addEntryButtons(page).replace('</body>', `${FLOAT}${CONSENT}</body>`);
  if (next !== page) {
    writeFileSync(file, next);
    patched += 1;
  }
}

console.log(`build-simulator : ${PATH} généré (${(html.length / 1024).toFixed(1)} Ko), estimation initiale ${euro(initial.creation)}, boutons ajoutés sur ${patched} page(s) du blog, Google Analytics ${gaId ? `actif (${gaId}, après consentement)` : 'non configuré'}.`);
