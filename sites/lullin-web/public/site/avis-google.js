// Liens vers la fiche Google de Lullin Web (avis clients), sur toutes les pages :
// - « Nos avis Google » dans le pied de page ;
// - sur l'accueil, un encart juste avant la FAQ, retiré dès que la section « Avis Google »
//   alimentée par l'API (src/fx-reviews.ts) est affichée.
// Chargé par public/analytics/consent.js, présent sur le site React et les pages statiques.

// Lien de partage de la fiche Google, fourni par Lullin Web (ouvre la fiche et ses avis).
const REVIEWS_URL = 'https://share.google/DelVcvwDF6kFhm8Ue';
const ARROW =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>';
const STAR =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>';

function external(text, className) {
  const a = document.createElement('a');
  a.href = REVIEWS_URL;
  a.target = '_blank';
  a.rel = 'noopener';
  if (className) a.className = className;
  a.innerHTML = text;
  a.addEventListener('click', () => {
    if (typeof window.gtag === 'function') window.gtag('event', 'google_reviews_click', { link_location: className || 'footer' });
  });
  return a;
}

function footerLink() {
  const nav = document.querySelector('.footer .footer-nav');
  if (!nav || nav.querySelector(`a[href="${REVIEWS_URL}"]`)) return;
  nav.append(external('Nos avis Google', ''));
}

function homeBand() {
  const faq = document.querySelector('main .home-faq');
  const band = document.querySelector('.fx-avis-band');
  // La section complète des avis (API Google) remplace l'encart quand elle existe.
  if (!faq || document.querySelector('main .fx-reviews')) {
    band?.remove();
    return;
  }
  if (band) return;
  const node = document.createElement('div');
  node.className = 'assurance-band wrap fx-avis-band';
  node.innerHTML = `${STAR}<p>Ce que disent nos clients<span>Lisez les avis laissés sur notre fiche Google, ou laissez le vôtre si nous avons travaillé ensemble.</span></p>`;
  node.append(external(`Voir nos avis Google ${ARROW}`, 'fx-avis-link'));
  faq.before(node);
}

function check() {
  footerLink();
  homeBand();
}

check();
new MutationObserver(check).observe(document.body, { childList: true, subtree: true });
