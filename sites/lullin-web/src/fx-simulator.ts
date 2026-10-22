// Liens entre le simulateur de prix (/simulateur-prix-site-internet, page statique)
// et l'application React :
// - /contact : reprend les options et le résumé choisis dans le simulateur (étape 2 du
//   formulaire). Formule et maintenance arrivent déjà par l'adresse (?offre=…&type=…).
// - /offres et /services : encart vers le simulateur.
// - /contact : événement de demande de devis (generate_lead), en précisant si la demande
//   vient du simulateur.
// - partout : boutons d'accès (barre de navigation, bouton flottant sur mobile, menu mobile,
//   accueil).
//   Les pages statiques reçoivent les mêmes boutons au build (scripts/build-simulator.mjs).
// Aucune donnée personnelle : seuls les choix du simulateur passent par sessionStorage.

import './fx-simulator.css';
import './fx-consent.css';

const HANDOFF_KEY = 'lullin-simulateur';
const MAX_AGE = 60 * 60 * 1000;
const SIMULATOR = '/simulateur-prix-site-internet';
const LEAD_KEY = 'lullin-simulateur-lead';

type Handoff = { v: 1; at: number; options: string[]; description: string };

function track(event: string, params: Record<string, unknown> = {}) {
  try {
    const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...params });
    if (typeof w.gtag === 'function') w.gtag('event', event, params);
  } catch {
    /* le suivi ne doit jamais bloquer la page */
  }
}

function readHandoff(): Handoff | null {
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Handoff;
    if (data.v !== 1 || Date.now() - data.at > MAX_AGE || !Array.isArray(data.options)) {
      sessionStorage.removeItem(HANDOFF_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

// React suit la valeur des champs contrôlés : on passe par le setter natif puis un
// événement « input » pour que l'état du formulaire soit bien mis à jour.
function setNativeValue(field: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  setter?.call(field, value);
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

function applyHandoff(data: Handoff) {
  const checkboxes = Array.from(document.querySelectorAll<HTMLInputElement>('main input[type="checkbox"][name="options"]'));
  const description = document.querySelector<HTMLTextAreaElement>('main textarea[name="description"]');
  if (!checkboxes.length && !description) return false;

  for (const box of checkboxes) {
    if (data.options.includes(box.value) && !box.checked) box.click();
  }
  if (description && !description.value.trim()) setNativeValue(description, data.description);
  try {
    sessionStorage.removeItem(HANDOFF_KEY);
  } catch {
    /* rien à faire */
  }
  try {
    sessionStorage.setItem(LEAD_KEY, '1');
  } catch {
    /* rien à faire */
  }
  track('simulator_prefill', { simulator_options: data.options.length });
  return true;
}

const BAND_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"></rect><path d="M8 6h8"></path><path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path></svg>';
const ARROW =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>';

// Encart au style des bandeaux « assurance-band » du site, placé après une section.
const BANDS = [
  {
    path: '/offres',
    after: 'main .offers-page',
    text: 'Combien coûtera votre site ?<span>Choisissez la formule, le nombre de pages, les options et la maintenance : notre simulateur gratuit calcule le prix instantanément, avec ces mêmes tarifs.</span>',
  },
  {
    path: '/services',
    after: 'main .services-detail',
    text: 'Quel budget pour votre site ?<span>Estimez gratuitement le prix de création et de maintenance de votre site en une minute, à partir des tarifs affichés sur notre page Offres.</span>',
  },
];

function bands() {
  const band = BANDS.find((b) => b.path === location.pathname);
  if (!band) return;
  const section = document.querySelector(band.after);
  if (!section || document.querySelector('.fx-simu-band')) return;
  const node = document.createElement('div');
  node.className = 'assurance-band wrap fx-simu-band';
  node.innerHTML = `${BAND_ICON}<p>${band.text}</p>`;
  const a = link('', `Estimer gratuitement mon site ${ARROW}`);
  a.removeAttribute('class');
  a.addEventListener('click', () => track('simulator_entry_click', { simulator_entry: `band${band.path.replace('/', '_')}` }));
  node.append(a);
  section.after(node);
}

// Demande de devis envoyée : le formulaire annonce « Votre demande a été envoyée ».
let leadSent = false;
function leadTracking() {
  if (location.pathname !== '/contact') {
    leadSent = false;
    return;
  }
  if (leadSent) return;
  const status = document.querySelector('main .brief-form [role="status"]');
  if (!status || !/demande a été envoyée/.test(status.textContent ?? '')) return;
  leadSent = true;
  let fromSimulator = false;
  try {
    fromSimulator = sessionStorage.getItem(LEAD_KEY) === '1';
    sessionStorage.removeItem(LEAD_KEY);
  } catch {
    /* rien à faire */
  }
  track('generate_lead', { lead_source: fromSimulator ? 'simulateur' : 'formulaire' });
}

function link(className: string, html: string, label?: string) {
  const a = document.createElement('a');
  a.href = SIMULATOR;
  a.className = className;
  a.innerHTML = html;
  if (label) a.setAttribute('aria-label', label);
  if (className) a.addEventListener('click', () => track('simulator_entry_click', { simulator_entry: className }));
  return a;
}

// React ne recrée pas ces conteneurs entre les pages : chaque bouton n'est ajouté qu'une fois,
// et remis en place si un rendu l'a retiré.
function entryButtons() {
  const nav = document.querySelector('.header .desktop-nav');
  if (nav && !nav.querySelector('.fx-simu-nav')) {
    const offres = nav.querySelector('a[href="/offres"]');
    const button = link('fx-simu-nav', '<i aria-hidden="true">€</i>Simulateur de prix');
    if (offres) offres.after(button);
    else nav.append(button);
  }

  let float = document.querySelector<HTMLAnchorElement>('.fx-simu-float');
  if (!float) {
    float = link('fx-simu-float', '<i aria-hidden="true">€</i>Estimer mon prix', 'Simulateur de prix');
    document.body.append(float);
  }
  // Inutile sur le formulaire de contact, où il masquerait le bouton d'envoi.
  float.hidden = location.pathname === '/contact';

  const menu = document.querySelector('.mobile-menu nav');
  if (menu && !menu.querySelector('.fx-simu-menu')) {
    menu.prepend(link('fx-simu-menu', '<small>Gratuit</small>Simulateur de prix'));
  }

  const hero = document.querySelector('main .hero .hero-under');
  if (hero && !hero.querySelector('.fx-simu-hero')) {
    hero.append(link('fx-simu-hero', '<i aria-hidden="true">€</i>Estimer gratuitement mon site'));
  }

  const footer = document.querySelector('.footer .footer-nav');
  if (footer && !footer.querySelector(`a[href="${SIMULATOR}"]`)) {
    const offres = footer.querySelector('a[href="/offres"]');
    const a = link('', 'Simulateur de prix');
    a.removeAttribute('class');
    if (offres) offres.after(a);
    else footer.append(a);
  }
}

function start() {
  let pending = location.pathname === '/contact' ? readHandoff() : null;
  const check = () => {
    if (pending && location.pathname === '/contact' && applyHandoff(pending)) pending = null;
    bands();
    entryButtons();
    leadTracking();
  };
  check();
  // Le menu mobile est rendu hors de #root (portail) : on observe tout le document.
  new MutationObserver(check).observe(document.body, { childList: true, subtree: true, characterData: true });

  // Mesure d'audience soumise au consentement (inactive sans identifiant GA4).
  const consent = document.createElement('script');
  consent.type = 'module';
  consent.src = '/analytics/consent.js';
  document.head.appendChild(consent);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}

export {};
