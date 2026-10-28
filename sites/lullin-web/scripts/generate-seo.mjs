import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { audiences, digitalServices, faqs, launchPriceNote, maintenancePlans, offers, options, packs, partnerBenefits, partnerFaqs, partnerProfiles, partnerServices, partnerSteps, photoPriceFactors, photoRates, projects, seoFocus, seoRates, serviceCatalog, services, socialExclusions, socialPlans, socialRates, spared, steps, videoFormats, videoRates } from '../src/content.ts';

const origin='https://www.lullin-web.com';
const lastModified='2026-09-16';
// Pages créées ou complétées le 20/10/2026 (expertises de communication digitale).
const updated='2026-10-20';
const modifiedOn=path=>['/','/services','/offres','/contact',...digitalServices.map(s=>s.href)].includes(path)?updated:lastModified;
const business={
  name:'Lullin Web',
  email:'contact@lullin-web.com',
  telephone:'+33 7 53 30 54 52',
  // Liens vers les autres profils officiels (fiche Google, réseaux) : à compléter au fur et à mesure.
  sameAs:[],
  areaServed:['France','Suisse romande'],
};
const root=process.cwd();
const seo=JSON.parse(await readFile(join(root,'src','seo.json'),'utf8'));
const template=await readFile(join(root,'dist','index.html'),'utf8');
const escapeHtml=value=>String(value).replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
const labelFor=path=>seo[path]?.heading||'Lullin Web';
const setTag=(html,pattern,replacement)=>pattern.test(html)?html.replace(pattern,replacement):html.replace('</head>',`${replacement}</head>`);
const list=items=>`<ul>${items.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
const price=value=>Number(String(value).replace(/\s/g,''));

// ---------- Contenu statique lisible sans JavaScript (remplacé par l'application au chargement) ----------
// Les moteurs de recherche, les aperçus sociaux et les assistants IA lisent ce HTML : il reprend fidèlement
// les offres, prix, services et réponses publiés sur le site.
const offersHtml=`<section><h2>Nos offres de création de site internet</h2>${offers.map(o=>`<article><h3>${escapeHtml(o.name)} — ${o.kicker==='À PARTIR DE'?'à partir de ':''}${escapeHtml(o.price)} ${escapeHtml(o.suffix)}</h3><p>${escapeHtml(o.text)} ${escapeHtml(o.note)}</p>${list(o.features)}</article>`).join('')}<p>Le prix dépend principalement du nombre de pages, du design et des fonctionnalités nécessaires. La majorité de nos offres de création restent sous les 1 000 €. Nom de domaine inclus pendant la première année.</p></section>`;
const optionsHtml=`<section><h2>Options supplémentaires</h2><dl>${options.map(o=>`<dt>${escapeHtml(o.title)} — ${escapeHtml(o.kicker.toLowerCase())} ${escapeHtml(o.price)}</dt><dd>${escapeHtml(o.text)}</dd>`).join('')}</dl></section>`;
const maintenanceHtml=`<section><h2>Abonnements de maintenance</h2><p>Créer un site est une première étape. Il faut ensuite le surveiller, le maintenir, effectuer les modifications nécessaires et s’assurer qu’il reste rapide et fonctionnel. Nous pouvons nous occuper de tout pour vous.</p>${maintenancePlans.map(m=>`<article><h3>Maintenance ${escapeHtml(m.name)} — ${escapeHtml(m.price)} ${escapeHtml(m.suffix)}</h3><p>${escapeHtml(m.text)}</p>${list(m.features)}</article>`).join('')}<p>La création du site et l’abonnement de maintenance sont deux services différents : vous pouvez simplement acheter votre site ou choisir de nous confier également sa gestion.</p></section>`;
const servicesHtml=`<section><h2>Création, gestion et visibilité</h2>${services.map(s=>`<article><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.tag)} ${escapeHtml(s.text)}</p>${list(s.includes)}</article>`).join('')}</section>`;
const stepsHtml=`<section><h2>Comment ça fonctionne ?</h2><ol>${steps.map(s=>`<li><strong>${escapeHtml(s.title)}</strong> ${escapeHtml(s.text)}</li>`).join('')}</ol></section>`;
const faqHtml=`<section><h2>Questions fréquentes</h2><dl>${faqs.map(f=>`<dt>${escapeHtml(f.q)}</dt><dd>${escapeHtml(f.a)}</dd>`).join('')}</dl></section>`;
const projectsHtml=`<section><h2>Réalisations</h2><ul>${projects.map(p=>`<li><a href="${escapeHtml(p.url)}" rel="noopener">${escapeHtml(p.name)}</a> — ${escapeHtml(p.category)}, ${escapeHtml(p.field)}. ${escapeHtml(p.summary)}</li>`).join('')}</ul></section>`;
const whyHtml=`<section><h2>Pourquoi travailler avec nous ?</h2><ul><li><strong>Des tarifs accessibles.</strong> Un site professionnel ne doit pas forcément coûter plusieurs milliers d’euros.</li><li><strong>Des prix clairs.</strong> Vous connaissez le prix de votre projet avant son lancement.</li><li><strong>Un seul interlocuteur.</strong> De la création à la maintenance, nous pouvons gérer l’ensemble de votre site.</li><li><strong>Des sites modernes.</strong> Rapides, sécurisés et adaptés aux différents appareils.</li><li><strong>Un accompagnement sur le long terme.</strong> Nous pouvons continuer à gérer votre site après sa création.</li></ul></section>`;
const audiencesHtml=`<section><h2>Un site pour chaque métier</h2><p>Nous créons des sites internet pour ${audiences.map(a=>escapeHtml(a.toLowerCase())).join(', ')} : chaque activité a son site, adapté à son image et à son budget.</p></section>`;
const sparedHtml=`<section><h2>Ce qu’on vous épargne</h2><ul>${spared.map(s=>`<li><strong>${escapeHtml(s.title)}</strong> ${escapeHtml(s.text)}</li>`).join('')}</ul></section>`;
const partnersHtml=`<section><h2>Devenir partenaire de Lullin Web</h2><p>Vous accompagnez des entrepreneurs et vous cherchez un partenaire fiable pour la création de leur site internet : recommandez Lullin Web et percevez une commission d’apporteur d’affaires de 10 % à 20 % sur chaque client apporté et signé. Le taux dépend de la taille des projets et du potentiel des clients apportés ; il est convenu avant la première recommandation. La commission est versée après la signature du client et le règlement de la prestation.</p><h3>Les professionnels recherchés</h3>${list(partnerProfiles)}<h3>Vos avantages</h3><ul>${partnerBenefits.map(b=>`<li><strong>${escapeHtml(b.title)}</strong> ${escapeHtml(b.text)}</li>`).join('')}</ul><h3>Ce que reçoivent vos clients</h3>${list(partnerServices.map(s=>`${s.title} — ${s.tag}`))}<h3>Comment ça marche</h3><ol>${partnerSteps.map(s=>`<li><strong>${escapeHtml(s.title)}</strong> ${escapeHtml(s.text)}</li>`).join('')}</ol><p>Partenariat gratuit, sans frais d’entrée, sans exclusivité et sans volume minimum de clients. Un accord écrit d’apporteur d’affaires peut être établi. Contact unique : <a href="mailto:${business.email}">${business.email}</a>.</p><h3>Questions des partenaires</h3><dl>${partnerFaqs.map(f=>`<dt>${escapeHtml(f.q)}</dt><dd>${escapeHtml(f.a)}</dd>`).join('')}</dl></section>`;
// ---------- Expertises de communication digitale (20/10/2026) ----------
const localArea='Six-Fours-les-Plages, Toulon, Sanary-sur-Mer et dans le Var';
const launchHtml=`<p>${escapeHtml(launchPriceNote)}</p>`;
const ratesTable=(caption,rates)=>`<table><caption>${escapeHtml(caption)}</caption><thead><tr><th scope="col">Prestation</th><th scope="col">Tarif de lancement</th></tr></thead><tbody>${rates.map(r=>`<tr><td>${escapeHtml(r.name)}${r.detail?` — ${escapeHtml(r.detail)}`:''}</td><td>${escapeHtml(r.price)}</td></tr>`).join('')}</tbody></table>`;
const plansHtml=(items,prefix)=>items.map(o=>`<article><h3>${escapeHtml(prefix+o.name)} — ${escapeHtml(o.price)} ${escapeHtml(o.suffix)}</h3><p>${escapeHtml(o.text)} ${escapeHtml(o.note)}</p>${list(o.features)}${o.benefits?`<p>Les avantages :</p>${list(o.benefits)}`:''}</article>`).join('');
const communicationHtml=`<section><h2>Au-delà du site internet : réseaux sociaux, photo, vidéo et référencement</h2><ul>${digitalServices.map(s=>`<li><a href="${s.href}">${escapeHtml(s.title)}</a> — ${escapeHtml(s.tag)} ${escapeHtml(s.from)}.</li>`).join('')}</ul></section>`;
const socialHtml=`<section><h2>Abonnements mensuels de gestion des réseaux sociaux</h2>${plansHtml(socialPlans,'Abonnement ')}<p>Non inclus dans les abonnements, sauf devis spécifique : ${escapeHtml(socialExclusions.join(', ').toLowerCase())}.</p><h2>Prestations à l’unité</h2>${ratesTable('Réseaux sociaux : prestations à l’unité',socialRates)}${launchHtml}</section>`;
const photoHtml=`<section><h2>Des séances avec des photographes partenaires</h2><p>Lullin Web organise votre séance avec un photographe partenaire, à ${localArea}. Ses disponibilités et le tarif définitif vous sont confirmés avant toute réservation.</p><h2>Tarifs</h2>${ratesTable('Tarifs de la photographie professionnelle',photoRates)}<p>Le tarif définitif dépend : ${escapeHtml(photoPriceFactors.join(', ').toLowerCase())}.</p>${launchHtml}</section>`;
const videoHtml=`<section><h2>Les vidéos que nous réalisons</h2><dl>${videoFormats.map(f=>`<dt>${escapeHtml(f.title)}</dt><dd>${escapeHtml(f.text)}</dd>`).join('')}</dl><h2>Tarifs</h2>${ratesTable('Tarifs de la création vidéo',videoRates)}${launchHtml}</section>`;
const seoServiceHtml=`<section><h2>Ce sur quoi nous travaillons</h2><dl>${seoFocus.map(f=>`<dt>${escapeHtml(f.title)}</dt><dd>${escapeHtml(f.text)}</dd>`).join('')}</dl><h2>Prestations et tarifs</h2>${ratesTable('Tarifs du référencement SEO',seoRates)}<p>Personne ne peut garantir la première position sur Google ni un nombre de visiteurs : nous travaillons sur les leviers qui favorisent votre visibilité, sans promesse de résultat chiffré.</p>${launchHtml}</section>`;
const packsHtml=`<section><h2>Nos packs de communication digitale</h2>${plansHtml(packs,'Pack ')}<p>Les packs sont des prestations ponctuelles, à prix unique. Les abonnements mensuels (réseaux sociaux, maintenance du site) sont proposés séparément. Les séances photo sont réalisées par des photographes partenaires et confirmées selon leurs disponibilités.</p>${launchHtml}</section>`;
const contactHtml=`<section><h2>Demander un devis</h2><p>Expliquez-nous simplement ce dont vous avez besoin : type de site souhaité (Essentiel, Vitrine, Business, Premium ou projet personnalisé), site existant ou non, budget envisagé, options et abonnement de maintenance souhaités. Devis gratuit, sans engagement. Sites internet à partir de 349 €.</p><p>E-mail : <a href="mailto:${business.email}">${business.email}</a></p></section>`;
const extra={
  '/':[offersHtml,servicesHtml,communicationHtml,audiencesHtml,stepsHtml,sparedHtml,whyHtml,faqHtml],
  '/offres':[offersHtml,optionsHtml,maintenanceHtml,faqHtml],
  '/services':[servicesHtml,communicationHtml,offersHtml],
  '/methode':[stepsHtml,whyHtml],
  '/a-propos':[whyHtml,servicesHtml],
  '/realisations':[projectsHtml],
  '/faq':[faqHtml],
  '/contact':[contactHtml,offersHtml],
  '/partenaires':[partnersHtml],
  '/confidentialite':[],
  '/mentions-legales':[],
  '/cgv':[],
  '/reseaux-sociaux':[socialHtml],
  '/photographie':[photoHtml],
  '/video':[videoHtml],
  '/referencement-seo':[seoServiceHtml],
  '/packs':[packsHtml],
};

// ---------- Données structurées ----------
const localAreas=[{'@type':'City',name:'Six-Fours-les-Plages'},{'@type':'City',name:'Toulon'},{'@type':'City',name:'Sanary-sur-Mer'},{'@type':'AdministrativeArea',name:'Var'}];
// Tarif de lancement → Offer : prix fixe, prix « dès » (minPrice) ou prix mensuel.
function rateOffer(rate,url){
  const amount=price(rate.price.replace(/^Dès /,'').replace(/€.*$/,''));
  const pricing=rate.price.endsWith('/ mois')
    ?{priceSpecification:{'@type':'UnitPriceSpecification',price:amount,priceCurrency:'EUR',unitText:'mois',billingIncrement:1,unitCode:'MON'}}
    :rate.price.startsWith('Dès ')?{priceSpecification:{'@type':'PriceSpecification',minPrice:amount,priceCurrency:'EUR'}}:{price:amount};
  return {'@type':'Offer',name:rate.name,...(rate.detail?{description:rate.detail}:{}),url,priceCurrency:'EUR',...pricing,seller:{'@id':`${origin}/#organization`}};
}
function schema(path,page){
  const url=`${origin}${path==='/'?'/':path}`;
  const offerNodes=offers.map(o=>({'@type':'Offer',name:`Création de site internet — formule ${o.name}`,description:o.text,price:price(o.price),priceCurrency:'EUR',url:`${origin}/offres`,availability:'https://schema.org/InStock',seller:{'@id':`${origin}/#organization`},itemOffered:{'@type':'Service',name:`Site ${o.name}`,serviceType:'Création de site internet'}}));
  const maintenanceNodes=maintenancePlans.map(m=>({'@type':'Offer',name:`Maintenance ${m.name}`,description:m.text,url:`${origin}/offres#maintenance`,priceCurrency:'EUR',priceSpecification:{'@type':'UnitPriceSpecification',price:price(m.price),priceCurrency:'EUR',unitText:'mois',billingIncrement:1,unitCode:'MON'},seller:{'@id':`${origin}/#organization`},itemOffered:{'@type':'Service',name:`Maintenance ${m.name}`,serviceType:'Maintenance de site internet'}}));
  const graph=[
    {'@type':['Organization','ProfessionalService'],'@id':`${origin}/#organization`,name:business.name,url:`${origin}/`,logo:{'@type':'ImageObject',url:`${origin}/images/favicon-512.png`,width:512,height:512},image:`${origin}/images/og-cover.jpg`,email:business.email,telephone:business.telephone,description:seo['/'].description,priceRange:'349 € - 949 €',currenciesAccepted:'EUR',areaServed:business.areaServed,...(business.sameAs.length?{sameAs:business.sameAs}:{}),knowsAbout:['Création de site internet','Site vitrine','Refonte de site internet','Web design','Développement web','Maintenance de site internet','Référencement naturel','Google Business Profile','Gestion des réseaux sociaux','Photographie professionnelle','Création vidéo','Référencement local'],makesOffer:[...offerNodes,...maintenanceNodes],contactPoint:{'@type':'ContactPoint',contactType:'sales',email:business.email,telephone:business.telephone,availableLanguage:'fr',url:`${origin}/contact`}},
    {'@type':'WebSite','@id':`${origin}/#website`,url:`${origin}/`,name:business.name,inLanguage:'fr-FR',publisher:{'@id':`${origin}/#organization`}},
    {'@type':path==='/contact'?'ContactPage':path==='/a-propos'?'AboutPage':path==='/faq'||path==='/partenaires'?'FAQPage':'WebPage','@id':`${url}#webpage`,url,name:page.title,description:page.description,inLanguage:'fr-FR',isPartOf:{'@id':`${origin}/#website`},about:{'@id':`${origin}/#organization`},dateModified:modifiedOn(path),...(path==='/faq'?{mainEntity:faqs.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))}:{}),...(path==='/partenaires'?{mainEntity:partnerFaqs.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))}:{})}
  ];
  if(path!=='/') graph.push({'@type':'BreadcrumbList','@id':`${url}#breadcrumb`,itemListElement:[{'@type':'ListItem',position:1,name:'Accueil',item:`${origin}/`},{'@type':'ListItem',position:2,name:page.heading,item:url}]});
  if(path==='/services') graph.push({'@type':'Service','@id':`${url}#service`,name:'Création, gestion et visibilité de sites internet',description:page.description,provider:{'@id':`${origin}/#organization`},areaServed:business.areaServed,hasOfferCatalog:{'@type':'OfferCatalog',name:'Services web',itemListElement:services.map(s=>({'@type':'Offer',itemOffered:{'@type':'Service',name:s.title,description:s.tag}}))}});
  if(path==='/offres') graph.push({'@type':'OfferCatalog','@id':`${url}#offres`,name:'Offres de création de site internet et abonnements de maintenance',itemListElement:[...offerNodes,...maintenanceNodes]});
  const expertise=digitalServices.find(s=>s.href===path);
  if(expertise) graph.push({'@type':'Service','@id':`${url}#service`,name:expertise.title,serviceType:expertise.title,description:page.description,provider:{'@id':`${origin}/#organization`},areaServed:expertise.service==='Photographie'?localAreas:[...localAreas,'France'],hasOfferCatalog:{'@type':'OfferCatalog',name:`${expertise.title} : tarifs de lancement, confirmés sur devis`,itemListElement:serviceCatalog.find(s=>s.service===expertise.service).rates.map(r=>rateOffer(r,url))}});
  if(path==='/realisations') graph.push({'@type':'ItemList','@id':`${url}#realisations`,name:'Réalisations de Lullin Web',itemListElement:projects.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,url:p.url,description:p.summary}))});
  return {'@context':'https://schema.org','@graph':graph};
}

for(const [path,page] of Object.entries(seo)){
  const canonical=`${origin}${path==='/'?'/':path}`;
  const breadcrumb=path==='/'?'':`<nav aria-label="Fil d’Ariane"><a href="/">Accueil</a> / <span>${escapeHtml(page.heading)}</span></nav>`;
  const fallback=`<main class="seo-fallback">${breadcrumb}<h1>${escapeHtml(page.heading)}</h1><p>${escapeHtml(page.intro)}</p>${(extra[path]||[]).join('')}<nav aria-label="Découvrir Lullin Web">${page.links.map(link=>`<a href="${link}">${escapeHtml(labelFor(link))}</a>`).join(' · ')}</nav><p><a href="mailto:${business.email}">${business.email}</a></p></main>`;
  let html=template.replace('<div id="root"></div>',`<div id="root">${fallback}</div>`);
  // The tags in index.html are formatted over several lines: match them with flexible whitespace.
  html=setTag(html,/<title>.*?<\/title>/,`<title>${escapeHtml(page.title)}</title>`);
  html=setTag(html,/<meta\s+name="description"\s+content="[^"]*"\s*\/>/,`<meta name="description" content="${escapeHtml(page.description)}"/>`);
  html=setTag(html,/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,`<link rel="canonical" href="${canonical}"/>`);
  html=setTag(html,/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,`<meta property="og:title" content="${escapeHtml(page.title)}"/>`);
  html=setTag(html,/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,`<meta property="og:description" content="${escapeHtml(page.description)}"/>`);
  html=setTag(html,/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,`<meta property="og:url" content="${canonical}"/>`);
  html=setTag(html,/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,`<meta name="twitter:title" content="${escapeHtml(page.title)}"/>`);
  html=setTag(html,/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,`<meta name="twitter:description" content="${escapeHtml(page.description)}"/>`);
  html=html.replace('</head>',`<script type="application/ld+json">${JSON.stringify(schema(path,page)).replace(/</g,'\\u003c')}</script></head>`);
  const target=path==='/'?join(root,'dist','index.html'):join(root,'dist',path.slice(1),'index.html');
  await mkdir(dirname(target),{recursive:true});
  await writeFile(target,html,'utf8');
}

const priority={'/partenaires':'0.7','/packs':'0.8','/reseaux-sociaux':'0.7','/photographie':'0.7','/video':'0.7','/referencement-seo':'0.7','/':'1.0','/offres':'0.9','/contact':'0.9','/services':'0.8','/realisations':'0.7','/faq':'0.7','/methode':'0.6','/a-propos':'0.6','/confidentialite':'0.2','/mentions-legales':'0.2','/cgv':'0.3'};
const urls=Object.keys(seo).map(path=>`  <url><loc>${origin}${path==='/'?'/':path}</loc><lastmod>${modifiedOn(path)}</lastmod><changefreq>${['/confidentialite','/mentions-legales','/cgv'].includes(path)?'yearly':'monthly'}</changefreq><priority>${priority[path]||'0.5'}</priority></url>`).join('\n');
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
await writeFile(join(root,'dist','sitemap.xml'),sitemap,'utf8');
await writeFile(join(root,'public','sitemap.xml'),sitemap,'utf8');
