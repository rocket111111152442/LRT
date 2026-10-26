// Mesure d'audience, chargée sur toutes les pages (site React et pages statiques).
// 1. Vercel Web Analytics : visites et pages vues, sans cookie ni donnée personnelle
//    (identifiant anonyme renouvelé chaque jour) ; chargé sans bandeau de consentement.
// 2. Google Analytics 4, chargé uniquement après accord du visiteur.
// Inactive tant que la variable Vercel GA_MEASUREMENT_ID (G-XXXXXXXXXX) n'est pas définie :
// scripts/build-simulator.mjs remplace le marqueur ci-dessous au build.
// Avant accord, rien n'est envoyé à Google (gtag.js n'est même pas téléchargé) ; les pages
// appellent window.gtag seulement s'il existe (voir simulateur.js et src/fx-simulator.ts).
// Les événements ne contiennent aucune donnée personnelle.

const ID = '__GA_MEASUREMENT_ID__';
const KEY = 'lullin-analytics-consent';
const MAX_AGE = 1000 * 60 * 60 * 24 * 182; // choix redemandé après 6 mois (recommandation CNIL)

function readChoice() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && (saved.value === 'granted' || saved.value === 'denied') && Date.now() - saved.at < MAX_AGE) return saved.value;
  } catch {
    /* stockage indisponible : on redemandera */
  }
  return null;
}

function saveChoice(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ value, at: Date.now() }));
  } catch {
    /* le choix vaut alors pour cette page seulement */
  }
}

let loaded = false;
function load() {
  if (loaded) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ID)}`;
  document.head.appendChild(script);
}

function clearCookies() {
  // Retire les cookies _ga éventuels après un retrait du consentement.
  const host = location.hostname.replace(/^www\./, '');
  document.cookie.split(';').forEach((part) => {
    const name = part.split('=')[0].trim();
    if (!name.startsWith('_ga')) return;
    for (const domain of ['', `; domain=.${host}`, `; domain=${location.hostname}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  });
}

function loadVercelAnalytics() {
  if (document.querySelector('script[src="/_vercel/insights/script.js"]')) return;
  window.va = window.va || function va() {
    (window.vaq = window.vaq || []).push(arguments);
  };
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  document.head.appendChild(script);
}

let banner = null;
function closeBanner() {
  banner?.remove();
  banner = null;
}

function openBanner() {
  if (banner) return;
  banner = document.createElement('div');
  banner.className = 'fx-consent';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-live', 'polite');
  banner.setAttribute('aria-label', 'Mesure d’audience');
  banner.innerHTML =
    '<p><b>Mesure d’audience.</b> Avec votre accord, nous utilisons Google Analytics pour savoir quelles pages sont consultées et comment le simulateur de prix est utilisé. Aucune donnée personnelle n’est transmise. <a href="/confidentialite">En savoir plus</a></p>' +
    '<div><button type="button" data-consent="denied">Refuser</button><button type="button" data-consent="granted">Accepter</button></div>';
  banner.addEventListener('click', (event) => {
    const button = event.target.closest('[data-consent]');
    if (!button) return;
    const value = button.dataset.consent;
    saveChoice(value);
    closeBanner();
    if (value === 'granted') load();
    else if (loaded) {
      clearCookies();
      location.reload();
    } else clearCookies();
  });
  document.body.appendChild(banner);
}

// Lien « Gestion des cookies » en bas de page, pour changer d'avis à tout moment.
function footerLink() {
  const bottom = document.querySelector('.footer-bottom');
  if (!bottom || bottom.querySelector('.fx-consent-link')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'fx-consent-link';
  button.textContent = 'Gestion des cookies';
  button.addEventListener('click', openBanner);
  const legal = bottom.querySelector('a[href="/confidentialite"]');
  if (legal) legal.after(button);
  else bottom.appendChild(button);
}

function start() {
  loadVercelAnalytics();
  if (!/^G-[A-Z0-9]{4,}$/.test(ID)) return;
  const choice = readChoice();
  if (choice === 'granted') load();
  else if (choice === null) openBanner();
  footerLink();
  new MutationObserver(footerLink).observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
