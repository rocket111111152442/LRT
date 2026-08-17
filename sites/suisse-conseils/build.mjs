/* Générateur du site — assemble les pages à partir d'un gabarit commun.
   `node build.mjs` réécrit les fichiers .html à la racine.
   Le site livré reste 100 % statique : aucun outil n'est nécessaire pour le servir. */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));

const SITE = {
  nom: "Suisse-Conseils Management",
  tel: "+41 76 206 05 91",
  telHref: "+41762060591",
  mail: "contact@suisse-conseilsm.ch",
  rue: "Route de Saint-Julien 129",
  ville: "1228 Plan-les-Ouates, Genève",
  url: "https://suisse-conseilsm.ch",
};

/* ------------------------------------------------------------------ icônes */
const I = {
  fleche: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h12M9.5 3.5 14 8l-4.5 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  check: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5" opacity=".28"/><path d="m6 10.3 2.7 2.7L14 7.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  bouclier: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2.6 20.4 6v6.6c0 4.9-3.6 8.4-8.4 9.8-4.8-1.4-8.4-4.9-8.4-9.8V6L12 2.6Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m8.4 12.2 2.4 2.4 4.8-4.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  balance: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5v17M5 6.5h14M7.5 20.5h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M5 6.5 2.5 13h5L5 6.5ZM19 6.5 16.5 13h5L19 6.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  frontiere: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M3.2 9.8h17.6M3.2 14.2h17.6" stroke="currentColor" stroke-width="1.4"/><path d="M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9s1.3-6.4 3.9-9Z" stroke="currentColor" stroke-width="1.4"/></svg>`,
  epargne: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 19.5h17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><rect x="5.5" y="12" width="3.6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="10.2" y="8.5" width="3.6" height="9.5" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="14.9" y="5" width="3.6" height="13" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>`,
  sante: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6.2" width="18" height="13" rx="2.2" stroke="currentColor" stroke-width="1.6"/><path d="M12 10v5.4M9.3 12.7h5.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M9 6.2V5a1.6 1.6 0 0 1 1.6-1.6h2.8A1.6 1.6 0 0 1 15 5v1.2" stroke="currentColor" stroke-width="1.6"/></svg>`,
  personnes: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9.2" cy="8.4" r="3.4" stroke="currentColor" stroke-width="1.6"/><path d="M2.8 19.4c.7-3.6 3.2-5.6 6.4-5.6s5.7 2 6.4 5.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M16.2 5.6a3.4 3.4 0 0 1 .6 6.6M17.6 13.9c2.2.5 3.5 2.3 4 5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  entreprise: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 20.5h17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M5.5 20.5V5.2a1.6 1.6 0 0 1 1.6-1.6h6.3a1.6 1.6 0 0 1 1.6 1.6v15.3" stroke="currentColor" stroke-width="1.6"/><path d="M15 9.5h2.9a1.6 1.6 0 0 1 1.6 1.6v9.4" stroke="currentColor" stroke-width="1.6"/><path d="M8.6 7.4h3.2M8.6 11h3.2M8.6 14.6h3.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  tel: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6.6 3.2 8.2 6 6.8 7.8c.9 1.9 2.5 3.5 4.4 4.4l1.8-1.4 2.8 1.6v2.4c0 .8-.7 1.5-1.5 1.4C8.1 15.7 4.3 11.9 3.4 5.7c-.1-.8.6-1.5 1.4-1.5h1.8Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  mail: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2.4" y="4.4" width="15.2" height="11.2" rx="1.8" stroke="currentColor" stroke-width="1.5"/><path d="m3.2 5.6 6.8 5 6.8-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  pin: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 17.5s5.5-4.6 5.5-9a5.5 5.5 0 1 0-11 0c0 4.4 5.5 9 5.5 9Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="10" cy="8.3" r="2.1" stroke="currentColor" stroke-width="1.5"/></svg>`,
  horloge: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7.4" stroke="currentColor" stroke-width="1.5"/><path d="M10 5.8V10l2.9 1.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

const marque = (fond = "var(--brand)", croix = "#fff") => `
<svg class="brand__mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
  <path d="M20 3.2 34.8 9v11.4c0 8.3-6.2 14.3-14.8 17-8.6-2.7-14.8-8.7-14.8-17V9L20 3.2Z" fill="${fond}"/>
  <path d="M12.6 19.4h5.1V14h4.6v5.4h5.1V24h-5.1v5.4h-4.6V24h-5.1v-4.6Z" fill="${croix}"/>
</svg>`;

/* ------------------------------------------------------------- mise en page */
function layout({ slug, titre, description, contenu, actif }) {
  const lien = (href, texte, cle) =>
    `<a href="${href}"${actif === cle ? ' aria-current="page"' : ""}>${texte}</a>`;

  return `<!doctype html>
<html lang="fr-CH">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titre}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${SITE.url}/${slug}">
<meta name="theme-color" content="#c8102e">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_CH">
<meta property="og:site_name" content="${SITE.nom}">
<meta property="og:title" content="${titre}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${SITE.url}/${slug}">
<meta property="og:image" content="${SITE.url}/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&display=swap">
<link rel="stylesheet" href="/assets/css/site.css">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"InsuranceAgency","name":"${SITE.nom}","url":"${SITE.url}/","email":"${SITE.mail}","telephone":"${SITE.telHref}","address":{"@type":"PostalAddress","streetAddress":"${SITE.rue}","postalCode":"1228","addressLocality":"Plan-les-Ouates","addressRegion":"Genève","addressCountry":"CH"},"areaServed":"Suisse romande","slogan":"Votre confiance, notre responsabilité"}
</script>
</head>
<body>

<a class="skip" href="#main">Aller au contenu</a>

<div class="topbar">
  <div class="wrap topbar__inner">
    <div class="topbar__set topbar__set--left">
      <span class="topbar__badge">${I.bouclier} Conseillers certifiés FINMA</span>
      <span>Genève &amp; Suisse romande</span>
    </div>
    <div class="topbar__set">
      <a href="tel:${SITE.telHref}">${SITE.tel}</a>
      <a href="mailto:${SITE.mail}">${SITE.mail}</a>
    </div>
  </div>
</div>

<header class="header">
  <div class="wrap header__inner">
    <a class="brand" href="/">
      ${marque()}
      <span>
        <span class="brand__name">Suisse-Conseils</span>
        <span class="brand__sub">Management</span>
      </span>
    </a>

    <nav class="nav" data-nav data-open="false" aria-label="Navigation principale">
      ${lien("/frontaliers.html", "Frontaliers", "frontaliers")}
      ${lien("/prevoyance.html", "3<sup>e</sup> pilier", "prevoyance")}
      ${lien("/assurance-maladie.html", "Assurance maladie", "maladie")}
      ${lien("/cabinet.html", "Le cabinet", "cabinet")}
      ${lien("/contact.html", "Contact", "contact")}
      <a class="btn" href="/contact.html">Être rappelé ${I.fleche}</a>
    </nav>

    <div class="header__side">
      <a class="btn header__cta" href="/contact.html">Être rappelé ${I.fleche}</a>
      <button class="burger" type="button" data-burger aria-expanded="false" aria-label="Ouvrir le menu">
        <i></i><i></i><i></i>
      </button>
    </div>
  </div>
</header>

<main id="main">
${contenu}
</main>

<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div>
        <a class="brand" href="/">
          ${marque("#fff", "#14171c")}
          <span>
            <span class="brand__name">Suisse-Conseils</span>
            <span class="brand__sub">Management</span>
          </span>
        </a>
        <p style="margin-top:1.25rem;font-size:.9375rem;max-width:26rem">
          Courtier en assurances et prévoyance. Nous accompagnons résidents,
          frontaliers et entreprises dans toute la Suisse romande.
        </p>
      </div>
      <div>
        <h4>Prestations</h4>
        <ul>
          <li><a href="/frontaliers.html">Frontaliers</a></li>
          <li><a href="/prevoyance.html">3<sup>e</sup> pilier</a></li>
          <li><a href="/assurance-maladie.html">Assurance maladie</a></li>
          <li><a href="/prevoyance.html#lpp">LPP · 2<sup>e</sup> pilier</a></li>
        </ul>
      </div>
      <div>
        <h4>Le cabinet</h4>
        <ul>
          <li><a href="/cabinet.html">Qui sommes-nous</a></li>
          <li><a href="/cabinet.html#methode">Notre méthode</a></li>
          <li><a href="/contact.html">Contact</a></li>
          <li><a href="/mentions-legales.html">Mentions légales</a></li>
        </ul>
      </div>
      <div>
        <h4>Nous joindre</h4>
        <ul>
          <li><a href="tel:${SITE.telHref}">${SITE.tel}</a></li>
          <li><a href="mailto:${SITE.mail}">${SITE.mail}</a></li>
          <li>${SITE.rue}<br>${SITE.ville}</li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <span>© <span data-year>2026</span> ${SITE.nom}. Tous droits réservés.</span>
      <span><a href="/mentions-legales.html">Mentions légales</a> · <a href="/mentions-legales.html#donnees">Protection des données</a></span>
    </div>
  </div>
</footer>

<script src="/assets/js/site.js" defer></script>
</body>
</html>
`;
}

/* --------------------------------------------------------- blocs réutilisés */
const heroArt = `
<svg viewBox="0 0 640 520" role="img" aria-label="Illustration : relief suisse stylisé">
  <rect width="640" height="520" fill="#14171c"/>
  <g opacity=".16" stroke="#fff" stroke-width="1">
    <path d="M0 90h640M0 180h640M0 270h640M0 360h640M0 450h640"/>
    <path d="M107 0v520M213 0v520M320 0v520M427 0v520M533 0v520"/>
  </g>
  <path d="M0 520V352l104-92 78 66 96-140 92 122 74-58 90 96 106-64v238Z" fill="#1d2229"/>
  <path d="M286 214 372 330H200l86-116Z" fill="#c8102e"/>
  <path d="m286 214 37 50-43 66-37-50 43-66Z" fill="#e0264a" opacity=".5"/>
  <path d="M0 520V404l122-78 96 62 84-96 106 104 88-56 144 84v96Z" fill="#262d36"/>
  <g fill="none" stroke="#c8102e" stroke-width="1.5" opacity=".5">
    <path d="M0 448h640M0 470h640M0 492h640"/>
  </g>
  <circle cx="516" cy="104" r="46" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.5"/>
  <circle cx="516" cy="104" r="76" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="1.5"/>
</svg>`;

const bandeCta = (titre, texte) => `
<section class="section section--tight">
  <div class="wrap">
    <div class="band rise">
      <h2 class="d2">${titre}</h2>
      <p class="lead">${texte}</p>
      <div class="band__actions">
        <a class="btn btn--light btn--lg" href="/contact.html">Demander une analyse gratuite ${I.fleche}</a>
        <a class="btn btn--outline-light btn--lg" href="tel:${SITE.telHref}">${SITE.tel}</a>
      </div>
    </div>
  </div>
</section>`;

const formulaire = `
<form class="formcard" data-form data-to="${SITE.mail}" novalidate>
  <div class="duo">
    <div class="field" data-required>
      <label for="nom">Nom et prénom</label>
      <input id="nom" name="nom" type="text" autocomplete="name">
      <span class="err">Merci d’indiquer votre nom.</span>
    </div>
    <div class="field" data-required>
      <label for="email">E-mail</label>
      <input id="email" name="email" type="email" autocomplete="email">
      <span class="err">Adresse e-mail incomplète.</span>
    </div>
  </div>
  <div class="duo">
    <div class="field">
      <label for="telephone">Téléphone</label>
      <input id="telephone" name="telephone" type="tel" autocomplete="tel">
    </div>
    <div class="field">
      <label for="situation">Votre situation</label>
      <select id="situation" name="situation">
        <option>Résident en Suisse</option>
        <option>Frontalier</option>
        <option>Nouvel arrivant</option>
        <option>Indépendant</option>
        <option>Entreprise</option>
      </select>
    </div>
  </div>
  <div class="field">
    <label for="sujet">Sujet</label>
    <select id="sujet" name="sujet">
      <option>Assurance maladie</option>
      <option>3e pilier</option>
      <option>LPP / 2e pilier</option>
      <option>Assurances de personnes</option>
      <option>Assurance entreprise</option>
      <option>Autre demande</option>
    </select>
  </div>
  <div class="field" data-required>
    <label for="message">Votre message</label>
    <textarea id="message" name="message" placeholder="Décrivez brièvement votre situation."></textarea>
    <span class="err">Merci d’écrire quelques mots.</span>
  </div>
  <button class="btn btn--lg" type="submit">Envoyer ma demande ${I.fleche}</button>
  <p class="note">Réponse sous 24 h ouvrées. Vos données ne sont ni vendues ni cédées à des tiers.</p>
</form>`;

const coordonnees = `
<ul class="coord">
  <li>${I.tel}<div><b>Téléphone</b><a href="tel:${SITE.telHref}">${SITE.tel}</a></div></li>
  <li>${I.mail}<div><b>E-mail</b><a href="mailto:${SITE.mail}">${SITE.mail}</a></div></li>
  <li>${I.pin}<div><b>Adresse</b>${SITE.rue}<br>${SITE.ville}</div></li>
  <li>${I.horloge}<div><b>Rendez-vous</b>En agence, à votre domicile ou en visioconférence</div></li>
</ul>`;

/* --------------------------------------------------------------- pages */
const pages = [];

/* ============================== ACCUEIL ============================== */
pages.push({
  fichier: "index.html",
  slug: "",
  actif: "accueil",
  titre: "Suisse-Conseils Management — Courtier en assurances et prévoyance à Genève",
  description:
    "Courtier en assurances et prévoyance à Plan-les-Ouates. Conseillers certifiés FINMA pour résidents, frontaliers et entreprises de Suisse romande. Comparatifs, 3e pilier, assurance maladie.",
  contenu: `
  <section class="hero">
    <div class="wrap split">
      <div class="rise">
        <span class="eyebrow">Courtier en assurances · Genève</span>
        <h1 class="d1">Votre confiance,<br>notre responsabilité</h1>
        <p class="lead">
          Nos conseillers certifiés FINMA vous accompagnent dans toute la Suisse romande.
          Nous comparons les offres de nos partenaires — établissements bancaires et
          compagnies d’assurance — et vous apportons une réponse personnalisée, pour faire
          les meilleurs choix pour votre avenir.
        </p>
        <div class="hero__actions">
          <a class="btn btn--lg" href="/contact.html">Demander une analyse gratuite ${I.fleche}</a>
          <a class="btn btn--ghost btn--lg" href="tel:${SITE.telHref}">${SITE.tel}</a>
        </div>
      </div>
      <div class="hero__art rise">
        ${heroArt}
        <div class="hero__chip">
          ${I.bouclier}
          <div>
            <b>Conseillers certifiés FINMA</b>
            <span>Enregistrés auprès de l’autorité fédérale de surveillance des marchés financiers</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="trust">
    <div class="wrap">
      <div class="trust__grid">
        <div class="trust__item">${I.balance}<div><b>Comparaison transparente</b><span>Les offres de nos partenaires, mises côte à côte</span></div></div>
        <div class="trust__item">${I.check}<div><b>Liberté de choix</b><span>Nous conseillons, la décision vous revient</span></div></div>
        <div class="trust__item">${I.bouclier}<div><b>Sans frais pour vous</b><span>L’analyse et le suivi ne vous sont pas facturés</span></div></div>
        <div class="trust__item">${I.frontiere}<div><b>Résidents et frontaliers</b><span>Deux situations, deux façons de vous couvrir</span></div></div>
      </div>
    </div>
  </div>

  <section class="section">
    <div class="wrap">
      <div class="head rise">
        <span class="eyebrow">Nos domaines</span>
        <h2 class="d2">Un interlocuteur unique pour vos assurances et votre prévoyance</h2>
        <p class="lead">Chaque dossier commence par la même chose : comprendre votre situation
          et relire ce que vous avez déjà signé.</p>
      </div>

      <div class="cards">
        <article class="card rise">
          <div class="card__icon">${I.frontiere}</div>
          <span class="card__n tnum">01</span>
          <h3 class="d3">Frontaliers</h3>
          <p>Assurance maladie, fiscalité et juridiction : les questions propres au statut de
            frontalier, traitées ensemble plutôt qu’une par une.</p>
          <a class="arrowlink" href="/frontaliers.html">Espace frontaliers ${I.fleche}</a>
        </article>

        <article class="card rise">
          <div class="card__icon">${I.epargne}</div>
          <span class="card__n tnum">02</span>
          <h3 class="d3">3<sup>e</sup> pilier</h3>
          <p>Épargner pour la retraite et se couvrir en cas de coup dur, avec la comparaison
            des compagnies et la transparence sur ce que vous signez.</p>
          <a class="arrowlink" href="/prevoyance.html">Prévoyance et 3<sup>e</sup> pilier ${I.fleche}</a>
        </article>

        <article class="card rise">
          <div class="card__icon">${I.sante}</div>
          <span class="card__n tnum">03</span>
          <h3 class="d3">Assurance maladie</h3>
          <p>Comparatif des caisses pour trouver la couverture la moins chère dans votre
            canton de résidence, sans perdre de garanties.</p>
          <a class="arrowlink" href="/assurance-maladie.html">Comparer mes primes ${I.fleche}</a>
        </article>

        <article class="card rise">
          <div class="card__icon">${I.personnes}</div>
          <span class="card__n tnum">04</span>
          <h3 class="d3">Assurances de personnes</h3>
          <p>Vie, invalidité, décès et perte de gain : ce qui protège vos revenus et vos
            proches si la vie ne suit plus le plan prévu.</p>
        </article>

        <article class="card rise">
          <div class="card__icon">${I.bouclier}</div>
          <span class="card__n tnum">05</span>
          <h3 class="d3">Ménage, RC et véhicule</h3>
          <p>Les contrats du quotidien, revus pour supprimer les doublons et ajuster les
            sommes d’assurance à la réalité.</p>
        </article>

        <article class="card rise">
          <div class="card__icon">${I.entreprise}</div>
          <span class="card__n tnum">06</span>
          <h3 class="d3">Entreprises et indépendants</h3>
          <p>LAA, perte de gain maladie, RC professionnelle et prévoyance du dirigeant,
            réunies dans un dossier unique.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="wrap split">
      <div class="rise">
        <span class="eyebrow">Pourquoi nous</span>
        <h2 class="d2">Le conseil d’abord, le contrat ensuite</h2>
        <p class="lead" style="margin-top:1rem">
          Nous travaillons avec de nombreux partenaires : établissements bancaires et
          compagnies d’assurance. Cette pluralité est ce qui permet de vous présenter un
          vrai comparatif, et non une seule offre.
        </p>
        <ul class="checks" style="margin-top:1.75rem">
          <li>${I.check}<span><strong>Une réponse personnalisée</strong> à votre situation, pas un contrat standard.</span></li>
          <li>${I.check}<span><strong>Des conseillers certifiés</strong> et enregistrés auprès de la FINMA.</span></li>
          <li>${I.check}<span><strong>Un accompagnement dans la durée</strong>, y compris le jour du sinistre.</span></li>
          <li>${I.check}<span><strong>Aucun honoraire à votre charge</strong> : nous sommes rémunérés par les compagnies.</span></li>
        </ul>
        <p style="margin-top:2rem"><a class="btn" href="/cabinet.html">Découvrir le cabinet ${I.fleche}</a></p>
      </div>

      <div class="rise">
        <div class="figures">
          <div class="figure"><b>3</b><span>Les trois piliers du système suisse, lus ensemble et jamais isolément.</span></div>
          <div class="figure"><b>1</b><span>Un seul interlocuteur, de la première analyse à la déclaration de sinistre.</span></div>
          <div class="figure"><b>0 CHF</b><span>Aucun frais de dossier : l’analyse et la comparaison sont offertes.</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="head rise">
        <span class="eyebrow">Notre méthode</span>
        <h2 class="d2">Trois étapes, aucune surprise</h2>
      </div>
      <div class="steps">
        <div class="step rise">
          <span class="step__n tnum">ÉTAPE 01</span>
          <h3 class="d3">Analyse de votre situation</h3>
          <p>Nous faisons le point sur votre statut, vos contrats en cours et vos projets.
            Rien n’est résilié avant d’avoir été relu.</p>
        </div>
        <div class="step rise">
          <span class="step__n tnum">ÉTAPE 02</span>
          <h3 class="d3">Comparatif écrit</h3>
          <p>Nous mettons les offres de nos partenaires côte à côte : primes, garanties et
            exclusions, sans zone d’ombre.</p>
        </div>
        <div class="step rise">
          <span class="step__n tnum">ÉTAPE 03</span>
          <h3 class="d3">Décision et suivi</h3>
          <p>Vous choisissez en connaissance de cause. Nous restons votre interlocuteur pour
            les années qui suivent.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="wrap split split--top">
      <div class="rise">
        <span class="eyebrow">Questions fréquentes</span>
        <h2 class="d2">Ce qu’on nous demande le plus souvent</h2>
        <p class="lead" style="margin-top:1rem">Une question qui n’est pas ici ? Appelez-nous,
          la réponse prend rarement plus de cinq minutes.</p>
      </div>
      <div class="faq rise" data-faq>
        <div class="faq__item">
          <button class="faq__btn" type="button" aria-expanded="false" aria-controls="q1">Combien coûte votre accompagnement ?<span class="faq__sign"></span></button>
          <div class="faq__panel" id="q1" data-open="false"><div><p>Rien pour vous. L’analyse de votre situation, la comparaison des offres et le suivi de vos contrats ne vous sont pas facturés : nous sommes rémunérés par la compagnie auprès de laquelle le contrat est conclu.</p></div></div>
        </div>
        <div class="faq__item">
          <button class="faq__btn" type="button" aria-expanded="false" aria-controls="q2">Travaillez-vous avec une seule compagnie ?<span class="faq__sign"></span></button>
          <div class="faq__panel" id="q2" data-open="false"><div><p>Non. Nous travaillons avec de nombreux partenaires, établissements bancaires comme compagnies d’assurance. C’est ce qui nous permet de comparer et de vous laisser le choix final.</p></div></div>
        </div>
        <div class="faq__item">
          <button class="faq__btn" type="button" aria-expanded="false" aria-controls="q3">Suivez-vous les frontaliers ?<span class="faq__sign"></span></button>
          <div class="faq__panel" id="q3" data-open="false"><div><p>Oui. Le statut de frontalier soulève des questions particulières d’assurance maladie, de fiscalité et de juridiction. Nous les traitons ensemble, car elles se répondent.</p></div></div>
        </div>
        <div class="faq__item">
          <button class="faq__btn" type="button" aria-expanded="false" aria-controls="q4">Où intervenez-vous ?<span class="faq__sign"></span></button>
          <div class="faq__panel" id="q4" data-open="false"><div><p>Dans toute la Suisse romande. Les rendez-vous se tiennent à notre bureau de Plan-les-Ouates, chez vous, ou à distance en visioconférence.</p></div></div>
        </div>
        <div class="faq__item">
          <button class="faq__btn" type="button" aria-expanded="false" aria-controls="q5">Que se passe-t-il en cas de sinistre ?<span class="faq__sign"></span></button>
          <div class="faq__panel" id="q5" data-open="false"><div><p>Vous nous appelez. Nous montons le dossier avec vous, le transmettons à la compagnie et suivons son traitement jusqu’au règlement.</p></div></div>
        </div>
      </div>
    </div>
  </section>

  ${bandeCta(
    "Faisons le point sur vos contrats",
    "Un premier échange sans engagement. Dites-nous où vous en êtes, nous vous disons ce qui est bien calibré, ce qui manque et ce que vous payez pour rien."
  )}
`,
});

/* ============================== FRONTALIERS ============================== */
pages.push({
  fichier: "frontaliers.html",
  slug: "frontaliers.html",
  actif: "frontaliers",
  titre: "Frontaliers — assurance maladie, fiscalité et juridiction | Suisse-Conseils Management",
  description:
    "Conseil aux frontaliers : droit d’option pour l’assurance maladie, fiscalité, juridiction compétente et 3e pilier. Conseillers certifiés FINMA à Genève.",
  contenu: `
  <section class="pagehead">
    <div class="wrap">
      <p class="crumb"><a href="/">Accueil</a> · Frontaliers</p>
      <span class="eyebrow">Espace frontaliers</span>
      <h1 class="d1" style="margin-top:1rem">Travailler en Suisse,<br>vivre en France</h1>
      <p class="lead">Le statut de frontalier ouvre des choix qui engagent pour longtemps :
        assurance maladie, fiscalité, juridiction compétente. Nous vous apportons une réponse
        adaptée à votre situation.</p>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="cards">
        <article class="card rise">
          <div class="card__icon">${I.sante}</div>
          <h3 class="d3">Assurance maladie</h3>
          <p>Le droit d’option se choisit une fois. Nous comparons les solutions possibles et
            leurs conséquences pour vous et votre famille, avant que la décision ne soit
            définitive.</p>
        </article>
        <article class="card rise">
          <div class="card__icon">${I.balance}</div>
          <h3 class="d3">Fiscalité</h3>
          <p>Imposition à la source, déclaration côté français, incidence des versements de
            prévoyance : ce qui est déductible et à quelles conditions.</p>
        </article>
        <article class="card rise">
          <div class="card__icon">${I.frontiere}</div>
          <h3 class="d3">Juridiction</h3>
          <p>Quel droit s’applique, quel tribunal est compétent, quelles règles suivent votre
            contrat de travail et vos assurances.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section section--alt">
    <div class="wrap split">
      <div class="rise">
        <span class="eyebrow">Prévoyance</span>
        <h2 class="d2">Le 3<sup>e</sup> pilier quand on est frontalier</h2>
        <p class="lead" style="margin-top:1rem">
          La question revient à chaque rendez-vous : est-ce intéressant dans ma situation ?
          La réponse dépend de votre mode d’imposition et de vos projets. Nous la posons à
          plat, chiffres à l’appui, avant toute souscription.
        </p>
        <ul class="checks" style="margin-top:1.75rem">
          <li>${I.check}<span>Ce que le 3<sup>e</sup> pilier apporte réellement dans votre cas</span></li>
          <li>${I.check}<span>Les conditions de déductibilité selon votre imposition</span></li>
          <li>${I.check}<span>La comparaison entre solution bancaire et solution d’assurance</span></li>
          <li>${I.check}<span>Les conséquences d’un retour en France ou d’un changement d’emploi</span></li>
        </ul>
        <p style="margin-top:2rem"><a class="btn" href="/prevoyance.html">Voir la page prévoyance ${I.fleche}</a></p>
      </div>
      <div class="rise">
        <div class="hero__art">${heroArt}</div>
      </div>
    </div>
  </section>

  ${bandeCta(
    "Une question de frontalier ?",
    "Droit d’option, fiscalité, prévoyance : posez-la simplement, nous vous répondons sans jargon et sans engagement."
  )}
`,
});

/* ============================== PRÉVOYANCE ============================== */
pages.push({
  fichier: "prevoyance.html",
  slug: "prevoyance.html",
  actif: "prevoyance",
  titre: "3e pilier et prévoyance LPP — Suisse-Conseils Management",
  description:
    "Pilier 3a et 3b, solution bancaire ou assurance, lecture du certificat LPP, rachats et lacunes de prévoyance. Comparatif transparent entre compagnies.",
  contenu: `
  <section class="pagehead">
    <div class="wrap">
      <p class="crumb"><a href="/">Accueil</a> · Prévoyance</p>
      <span class="eyebrow">Prévoyance</span>
      <h1 class="d1" style="margin-top:1rem">Préparer la suite,<br>sans se tromper de contrat</h1>
      <p class="lead">Le 3<sup>e</sup> pilier engage souvent pour des décennies. Autant comprendre
        ce que l’on signe : nous comparons les compagnies et vous expliquons les différences
        qui comptent vraiment.</p>
    </div>
  </section>

  <section class="section">
    <div class="wrap split split--top">
      <div class="rise">
        <h2 class="d2">Pilier 3a et pilier 3b</h2>
        <p class="lead" style="margin-top:1rem">
          Le pilier 3a est lié à la retraite et déductible fiscalement dans les limites
          prévues par la loi. Le pilier 3b reste libre : ni plafond, ni blocage jusqu’à la
          retraite. Le bon choix dépend de vos projets, pas d’une règle générale.
        </p>
        <ul class="checks" style="margin-top:1.75rem">
          <li>${I.check}<span>Solution bancaire ou solution d’assurance : souplesse contre couverture</span></li>
          <li>${I.check}<span>Libération du paiement des primes en cas d’incapacité de gain</span></li>
          <li>${I.check}<span>Utilisation pour un projet immobilier</span></li>
          <li>${I.check}<span>Ce que vous récupérez en cas de résiliation anticipée</span></li>
        </ul>
      </div>
      <div class="rise">
        <div class="figures" style="grid-template-columns:1fr">
          <div class="figure"><b>3a</b><span>Prévoyance liée : déduction fiscale annuelle, capital disponible à la retraite ou pour un projet immobilier.</span></div>
          <div class="figure"><b>3b</b><span>Prévoyance libre : aucun plafond de versement, capital disponible selon les termes du contrat.</span></div>
          <div class="figure"><b>LPP</b><span>2<sup>e</sup> pilier : ce que votre employeur cotise, et ce qu’il vous restera réellement.</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--alt" id="lpp">
    <div class="wrap">
      <div class="head rise">
        <span class="eyebrow">2<sup>e</sup> pilier</span>
        <h2 class="d2">Votre certificat LPP, traduit en français courant</h2>
        <p class="lead">Avoir accumulé, rentes projetées, prestations en cas d’invalidité ou de
          décès, possibilités de rachat : tout y figure, rarement de façon lisible.</p>
      </div>
      <div class="cards">
        <article class="card rise">
          <h3 class="d4">Lecture du certificat</h3>
          <p>Ce que vous avez accumulé, ce que vous toucherez, et l’écart avec votre dernier salaire.</p>
        </article>
        <article class="card rise">
          <h3 class="d4">Rachats</h3>
          <p>Quand un rachat est intéressant, quel montant, et à quelles conditions il reste déductible.</p>
        </article>
        <article class="card rise">
          <h3 class="d4">Lacunes de prévoyance</h3>
          <p>Interruptions de carrière, temps partiel, arrivée tardive en Suisse : elles se comblent d’autant mieux qu’on les repère tôt.</p>
        </article>
        <article class="card rise">
          <h3 class="d4">Plans d’entreprise</h3>
          <p>Comparaison des caisses de pension, taux de couverture, frais de gestion et service aux collaborateurs.</p>
        </article>
      </div>
    </div>
  </section>

  ${bandeCta(
    "Faites relire votre prévoyance",
    "Envoyez-nous votre certificat LPP et vos contrats de 3e pilier : nous vous disons ce qu’ils valent, noir sur blanc."
  )}
`,
});

/* ============================== ASSURANCE MALADIE ============================== */
pages.push({
  fichier: "assurance-maladie.html",
  slug: "assurance-maladie.html",
  actif: "maladie",
  titre: "Assurance maladie — comparatif LAMal et complémentaires | Suisse-Conseils Management",
  description:
    "Comparatif des caisses maladie pour trouver la couverture la moins chère de votre canton : franchise, modèle, complémentaires LCA et hospitalisation.",
  contenu: `
  <section class="pagehead">
    <div class="wrap">
      <p class="crumb"><a href="/">Accueil</a> · Assurance maladie</p>
      <span class="eyebrow">Assurance maladie</span>
      <h1 class="d1" style="margin-top:1rem">Payer le juste prix,<br>sans perdre de garanties</h1>
      <p class="lead">L’assurance de base est identique partout ; son prix, non. Nous comparons
        les caisses pour trouver la couverture la moins chère dans votre canton de résidence,
        à garanties équivalentes.</p>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="cards">
        <article class="card rise">
          <div class="card__icon">${I.balance}</div>
          <h3 class="d3">Assurance de base (LAMal)</h3>
          <p>Choix de la caisse, du modèle et de la franchise, calibrés sur votre consommation
            réelle de soins plutôt que sur une moyenne.</p>
        </article>
        <article class="card rise">
          <div class="card__icon">${I.sante}</div>
          <h3 class="d3">Complémentaires (LCA)</h3>
          <p>Ambulatoire, dentaire, médecines alternatives, lunettes : ce qui vaut la peine
            dans votre cas, et ce que vous pouvez laisser tomber.</p>
        </article>
        <article class="card rise">
          <div class="card__icon">${I.bouclier}</div>
          <h3 class="d3">Hospitalisation</h3>
          <p>Division commune, mi-privée ou privée — avec les questions de santé à anticiper
            avant de déposer une demande.</p>
        </article>
      </div>

      <div class="split rise" style="margin-top:clamp(3rem,6vw,4.5rem)">
        <div>
          <h2 class="d2">Ce que nous vérifions avant de proposer quoi que ce soit</h2>
        </div>
        <ul class="checks">
          <li>${I.check}<span>La franchise réellement adaptée à vos frais des trois dernières années</span></li>
          <li>${I.check}<span>Les garanties payées deux fois entre base et complémentaires</span></li>
          <li>${I.check}<span>Les couvertures acquises qu’une résiliation ferait perdre</span></li>
          <li>${I.check}<span>Les délais légaux de résiliation, pour ne pas manquer l’échéance</span></li>
        </ul>
      </div>
    </div>
  </section>

  ${bandeCta(
    "Comparons vos primes",
    "Envoyez-nous votre police actuelle : nous revenons vers vous avec un comparatif clair, sans engagement."
  )}
`,
});

/* ============================== CABINET ============================== */
pages.push({
  fichier: "cabinet.html",
  slug: "cabinet.html",
  actif: "cabinet",
  titre: "Le cabinet — Suisse-Conseils Management, Plan-les-Ouates",
  description:
    "Cabinet de courtage en assurances et prévoyance à Plan-les-Ouates, Genève. Conseillers certifiés FINMA, partenaires bancaires et compagnies d’assurance.",
  contenu: `
  <section class="pagehead">
    <div class="wrap">
      <p class="crumb"><a href="/">Accueil</a> · Le cabinet</p>
      <span class="eyebrow">Le cabinet</span>
      <h1 class="d1" style="margin-top:1rem">Votre confiance,<br>notre responsabilité</h1>
      <p class="lead">Ce n’est pas qu’une formule : c’est la seule façon de travailler qui tienne
        dans un métier où l’on signe pour des années.</p>
    </div>
  </section>

  <section class="section">
    <div class="wrap split split--top">
      <div class="prose rise">
        <p class="lead">
          Suisse-Conseils Management est un cabinet de courtage en assurances et en prévoyance
          établi à Plan-les-Ouates, aux portes de Genève.
        </p>
        <p style="margin-top:1.25rem">
          Nos conseillers, certifiés et enregistrés auprès de la FINMA, accompagnent des
          résidents, des frontaliers, des indépendants et des entreprises dans toute la
          Suisse romande. Nous nous appuyons sur de nombreux partenaires — établissements
          bancaires et compagnies d’assurance — pour apporter à chacun une réponse
          personnalisée et l’aider à faire les meilleurs choix pour son avenir.
        </p>
        <p>
          Notre travail consiste à comparer, à expliquer et à assumer le conseil donné.
          La décision, elle, vous revient toujours.
        </p>
      </div>
      <div class="rise">${coordonnees}</div>
    </div>
  </section>

  <section class="section section--alt" id="methode">
    <div class="wrap">
      <div class="head rise">
        <span class="eyebrow">Nos engagements</span>
        <h2 class="d2">Quatre règles que nous ne négocions pas</h2>
      </div>
      <div class="cards">
        <article class="card rise">
          <span class="card__n tnum">01</span>
          <h3 class="d3">Transparence</h3>
          <p>Vous recevez le comparatif : primes, garanties et exclusions. Aucune recommandation sans chiffres à l’appui.</p>
        </article>
        <article class="card rise">
          <span class="card__n tnum">02</span>
          <h3 class="d3">Liberté de choix</h3>
          <p>Nous conseillons, vous décidez. Aucun contrat n’est signé le jour même sous prétexte d’une offre qui expire.</p>
        </article>
        <article class="card rise">
          <span class="card__n tnum">03</span>
          <h3 class="d3">Continuité</h3>
          <p>Le conseiller qui ouvre votre dossier est celui qui le suit, y compris le jour où il faut déclarer un sinistre.</p>
        </article>
        <article class="card rise">
          <span class="card__n tnum">04</span>
          <h3 class="d3">Discrétion</h3>
          <p>Vos données restent chez nous et ne servent qu’au traitement de votre dossier.</p>
        </article>
      </div>
    </div>
  </section>

  ${bandeCta(
    "Rencontrons-nous",
    "Un premier rendez-vous dure environ une heure et ne vous engage à rien. Venez avec vos contrats actuels, nous faisons le reste."
  )}
`,
});

/* ============================== CONTACT ============================== */
pages.push({
  fichier: "contact.html",
  slug: "contact.html",
  actif: "contact",
  titre: "Contact — Suisse-Conseils Management, Plan-les-Ouates",
  description:
    "Route de Saint-Julien 129, 1228 Plan-les-Ouates. Téléphone +41 76 206 05 91, contact@suisse-conseilsm.ch. Rendez-vous en agence, à domicile ou en visioconférence.",
  contenu: `
  <section class="pagehead">
    <div class="wrap">
      <p class="crumb"><a href="/">Accueil</a> · Contact</p>
      <span class="eyebrow">Contact</span>
      <h1 class="d1" style="margin-top:1rem">Parlons de votre situation</h1>
      <p class="lead">Par téléphone, par e-mail ou via le formulaire : le premier échange est
        gratuit et sans engagement.</p>
    </div>
  </section>

  <section class="section">
    <div class="wrap split split--top">
      <div class="rise">
        ${coordonnees}
        <p style="margin-top:1.5rem">
          <a class="arrowlink" href="https://www.google.com/maps/search/?api=1&amp;query=Route+de+Saint-Julien+129,+1228+Plan-les-Ouates" target="_blank" rel="noopener">Ouvrir l’adresse dans Google Maps ${I.fleche}</a>
        </p>
      </div>
      <div class="rise">${formulaire}</div>
    </div>
  </section>
`,
});

/* ============================== MENTIONS ============================== */
pages.push({
  fichier: "mentions-legales.html",
  slug: "mentions-legales.html",
  actif: "",
  titre: "Mentions légales et protection des données — Suisse-Conseils Management",
  description: "Mentions légales, éditeur du site et politique de protection des données.",
  contenu: `
  <section class="pagehead">
    <div class="wrap">
      <p class="crumb"><a href="/">Accueil</a> · Mentions légales</p>
      <h1 class="d2">Mentions légales et protection des données</h1>
    </div>
  </section>

  <section class="section">
    <div class="wrap prose">
      <h2>Éditeur du site</h2>
      <p>${SITE.nom}<br>${SITE.rue}<br>${SITE.ville}<br>
        <a href="tel:${SITE.telHref}">${SITE.tel}</a> — <a href="mailto:${SITE.mail}">${SITE.mail}</a></p>
      <p>Raison sociale complète, forme juridique, numéro IDE et numéro d’inscription au
        registre des intermédiaires d’assurance de la FINMA : à compléter avant la mise en
        ligne définitive.</p>

      <h2>Activité</h2>
      <p>${SITE.nom} exerce une activité d’intermédiaire en assurance. Les conseillers du
        cabinet sont certifiés et enregistrés auprès de la FINMA, l’Autorité fédérale de
        surveillance des marchés financiers.</p>

      <h2>Responsabilité</h2>
      <p>Les informations publiées sur ce site ont un caractère général et ne constituent ni
        une offre contractuelle, ni un conseil personnalisé. Seuls les documents contractuels
        remis par la compagnie concernée font foi.</p>

      <h2>Propriété intellectuelle</h2>
      <p>Les contenus de ce site sont protégés. Toute reproduction, même partielle, nécessite
        l’accord écrit préalable de l’éditeur.</p>

      <h2 id="donnees">Protection des données</h2>
      <p>Le traitement des données personnelles est effectué conformément à la loi fédérale
        suisse sur la protection des données (LPD).</p>
      <ul>
        <li>Seules les données que vous transmettez volontairement sont collectées.</li>
        <li>Elles servent uniquement à traiter votre demande et à suivre votre dossier.</li>
        <li>Aucune donnée n’est vendue ni cédée à des tiers à des fins publicitaires.</li>
        <li>Vous pouvez demander l’accès, la rectification ou la suppression de vos données en
          écrivant à <a href="mailto:${SITE.mail}">${SITE.mail}</a>.</li>
      </ul>

      <h2>Cookies</h2>
      <p>Ce site ne dépose aucun cookie et n’utilise aucun traceur. Le formulaire de contact
        n’enregistre rien côté serveur : il ouvre votre messagerie avec le message pré-rempli.</p>

      <h2>Droit applicable</h2>
      <p>Le présent site est soumis au droit suisse. Le for juridique est à Genève, sous
        réserve des dispositions impératives contraires.</p>

      <p style="margin-top:2rem">Dernière mise à jour : <span data-year>2026</span>.</p>
    </div>
  </section>
`,
});

/* --------------------------------------------------------------- écriture */
for (const page of pages) {
  writeFileSync(join(ROOT, page.fichier), layout(page));
}
console.log(pages.length + " pages générées");
