// Liens entre le simulateur de prix (/simulateur-prix-site-internet, page statique)
// et l'application React :
// - /contact : reprend les options et le résumé choisis dans le simulateur (étape 2 du
//   formulaire). Formule et maintenance arrivent déjà par l'adresse (?offre=…&type=…).
// - /offres : encart vers le simulateur sous les formules.
// Aucune donnée personnelle : seuls les choix du simulateur passent par sessionStorage.

const HANDOFF_KEY = 'lullin-simulateur';
const MAX_AGE = 60 * 60 * 1000;
const SIMULATOR = '/simulateur-prix-site-internet';

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
  track('simulator_prefill', { simulator_options: data.options.length });
  return true;
}

function offresBand() {
  if (location.pathname !== '/offres') return;
  const offers = document.querySelector('main .offers-page');
  if (!offers || document.querySelector('.fx-simu-band')) return;
  const band = document.createElement('div');
  band.className = 'assurance-band wrap fx-simu-band';
  band.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"></rect><path d="M8 6h8"></path><path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path></svg>' +
    '<p>Combien coûtera votre site ?<span>Choisissez la formule, le nombre de pages, les options et la maintenance : notre simulateur gratuit calcule le prix instantanément, avec ces mêmes tarifs.</span></p>' +
    `<a href="${SIMULATOR}">Estimer mon site <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg></a>`;
  offers.after(band);
}

function start() {
  let pending = location.pathname === '/contact' ? readHandoff() : null;
  const check = () => {
    if (pending && location.pathname === '/contact' && applyHandoff(pending)) pending = null;
    offresBand();
  };
  check();
  const root = document.getElementById('root') ?? document.body;
  new MutationObserver(check).observe(root, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}

export {};
