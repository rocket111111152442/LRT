// Simulateur de prix de lullin-web.com (/simulateur-prix-site-internet).
// Le calcul et le résumé sont aussi utilisés au build (scripts/build-simulator.mjs)
// pour que la page contienne déjà une estimation sans JavaScript.
// Suivi : événements anonymes poussés dans window.dataLayer (et gtag s'il existe) ;
// aucune donnée personnelle n'est saisie ni transmise.

import { FORMULES, PAGE, MAIL, OPTIONS, PRIORITY, MAINTENANCE, LIMITS } from './tarifs.js';

export const HANDOFF_KEY = 'lullin-simulateur';
export const DEFAULT_STATE = { formule: 'vitrine', pages: 5, options: [], mails: 0, priority: false, maintenance: 'aucune' };

const euroFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
export const euro = (value) => `${euroFormat.format(value)} €`;

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function normalize(state) {
  const formule = FORMULES.find((f) => f.id === state.formule) ?? FORMULES[1];
  const maintenance = MAINTENANCE.find((m) => m.id === state.maintenance) ?? MAINTENANCE[0];
  return {
    formule: formule.id,
    pages: clamp(Math.round(Number(state.pages) || formule.pages), LIMITS.pagesMin, LIMITS.pagesMax),
    options: OPTIONS.filter((o) => (state.options ?? []).includes(o.id)).map((o) => o.id),
    mails: clamp(Math.round(Number(state.mails) || 0), 0, LIMITS.mailsMax),
    priority: Boolean(state.priority),
    maintenance: maintenance.id,
  };
}

function baseCost(formule, pages) {
  return formule.price + Math.max(0, pages - formule.pages) * PAGE.price;
}

export function estimate(input) {
  const state = normalize(input);
  const formule = FORMULES.find((f) => f.id === state.formule);
  const maintenance = MAINTENANCE.find((m) => m.id === state.maintenance);
  const options = OPTIONS.filter((o) => state.options.includes(o.id));
  const extraPages = formule.quote ? 0 : Math.max(0, state.pages - formule.pages);

  const lines = [];
  if (!formule.quote) {
    const included = formule.pages > 1 ? `jusqu’à ${formule.pages} pages` : '1 page';
    lines.push({ label: `Formule ${formule.name} (${included})`, amount: formule.price, from: Boolean(formule.from) });
    if (extraPages > 0) {
      lines.push({ label: `${extraPages} ${extraPages > 1 ? 'pages supplémentaires' : 'page supplémentaire'} × ${euro(PAGE.price)}`, amount: extraPages * PAGE.price });
    }
    for (const option of options) lines.push({ label: option.title, amount: option.price, from: Boolean(option.from) });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const from = lines.some((line) => line.from);
  const priority = state.priority && !formule.quote ? Math.round(subtotal * PRIORITY.rate) : 0;
  if (priority) lines.push({ label: `${PRIORITY.title} (+25 %)`, amount: priority, from });
  const creation = subtotal + priority;

  const mailsPerYear = state.mails * MAIL.price;
  const monthly = maintenance.price;
  const firstYear = creation + monthly * 12 + mailsPerYear;

  // Formule supérieure qui couvre les pages demandées pour à peine plus (ou moins) cher.
  let suggestion = null;
  if (!formule.quote && extraPages > 0) {
    const current = baseCost(formule, state.pages);
    for (const other of FORMULES) {
      if (other.quote || other.price <= formule.price) continue;
      const diff = baseCost(other, state.pages) - current;
      if (diff <= 60) {
        suggestion = { formule: other.id, name: other.name, pages: other.pages, diff };
        break;
      }
    }
  }

  return { state, formule, maintenance, options, extraPages, lines, creation, from, priority, monthly, mailsPerYear, firstYear, suggestion };
}

function includedText(formule) {
  if (formule.quote) return 'Catalogue, paiement en ligne et livraison sont chiffrés selon votre projet.';
  const mails = formule.mails === 0 ? null : `${formule.mails} adresse${formule.mails > 1 ? 's' : ''} mail professionnelle${formule.mails > 1 ? 's' : ''}`;
  return ['Nom de domaine pendant 1 an', 'certificat SSL', 'adaptation mobile', mails, 'mise en ligne'].filter(Boolean).join(', ') + '.';
}

export function renderSummary(est) {
  const out = [];
  out.push('<p class="simu-total-label">Création du site <span>· paiement unique</span></p>');
  if (est.formule.quote) {
    out.push('<p class="simu-total"><strong>Sur devis</strong></p>');
    out.push('<p class="simu-note">Une boutique en ligne dépend du nombre de produits et des moyens de paiement : nous la chiffrons après un premier échange, gratuitement.</p>');
  } else {
    out.push(`<p class="simu-total">${est.from ? '<small>à partir de</small> ' : ''}<strong data-simu-amount="${est.creation}">${euro(est.creation)}</strong></p>`);
    out.push('<ul class="simu-lines">');
    for (const line of est.lines) {
      out.push(`<li><span>${escapeHtml(line.label)}</span><b>${line.from ? 'dès ' : ''}${euro(line.amount)}</b></li>`);
    }
    out.push('</ul>');
  }
  out.push(`<p class="simu-included"><b>Inclus :</b> ${escapeHtml(includedText(est.formule))}</p>`);

  const recurring = [];
  if (est.monthly) recurring.push(`<li><span>Maintenance ${escapeHtml(est.maintenance.name)}</span><b>${euro(est.monthly)} / mois</b></li>`);
  if (est.mailsPerYear) {
    const n = est.state.mails;
    recurring.push(`<li><span>${n} adresse${n > 1 ? 's' : ''} mail supplémentaire${n > 1 ? 's' : ''}</span><b>${euro(est.mailsPerYear)} / an</b></li>`);
  }
  out.push('<div class="simu-recurring"><p class="simu-total-label">Ensuite <span>· coûts récurrents</span></p>');
  if (recurring.length) out.push(`<ul class="simu-lines">${recurring.join('')}</ul>`);
  else out.push('<p class="simu-note">Aucun abonnement choisi. Sans maintenance, l’hébergement et le renouvellement du nom de domaine après la première année ne sont pas compris : les modalités sont précisées dans le devis.</p>');
  out.push('</div>');

  if (!est.formule.quote && (est.monthly || est.mailsPerYear)) {
    out.push(`<p class="simu-year"><span>Budget première année</span><b>${est.from ? 'dès ' : ''}${euro(est.firstYear)}</b></p>`);
  }
  if (est.suggestion) {
    const s = est.suggestion;
    const price = s.diff <= 0 ? 'pour le même prix ou moins' : `pour ${euro(s.diff)} de plus`;
    out.push(`<p class="simu-hint">Avec ${est.state.pages} pages, la formule <b>${escapeHtml(s.name)}</b> (jusqu’à ${s.pages} pages) revient ${price}. <button type="button" data-simu-switch="${s.formule}">Passer en ${escapeHtml(s.name)}</button></p>`);
  }
  return out.join('');
}

export function contactHref(est) {
  const params = new URLSearchParams();
  if (!est.formule.quote) params.set('offre', est.formule.name);
  params.set('type', est.formule.type);
  params.set('maintenance', est.maintenance.value);
  return `/contact?${params.toString()}`;
}

// Choix repris dans le formulaire de contact (étape 2) par src/fx-simulator.ts.
export function handoff(est) {
  const options = est.options.map((o) => o.title);
  if (est.extraPages > 0) options.unshift(PAGE.title);
  if (est.state.mails > 0) options.push(MAIL.title);
  if (est.state.priority && !est.formule.quote) options.push(PRIORITY.title);

  const parts = [`${est.formule.quote ? 'Boutique en ligne' : `Formule ${est.formule.name}`}, ${est.state.pages} page${est.state.pages > 1 ? 's' : ''}`];
  if (est.options.length) parts.push(`options : ${est.options.map((o) => o.title).join(', ')}`);
  if (est.state.mails) parts.push(`${est.state.mails} adresse${est.state.mails > 1 ? 's' : ''} mail supplémentaire${est.state.mails > 1 ? 's' : ''}`);
  if (est.state.priority && !est.formule.quote) parts.push('livraison prioritaire');
  parts.push(est.monthly ? `maintenance ${est.maintenance.name}` : 'sans maintenance');
  const price = est.formule.quote ? 'boutique sur devis' : `${est.from ? 'à partir de ' : ''}${euro(est.creation)} de création`;
  const monthly = est.monthly ? ` + ${euro(est.monthly)} / mois` : '';
  const description = `Estimation faite avec le simulateur : ${parts.join(' ; ')}. Estimation : ${price}${monthly}.\n\nMon activité et mon projet : `;
  return { v: 1, at: Date.now(), options, description };
}

/* ---------- Navigateur ---------- */

function track(event, params) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
    if (typeof window.gtag === 'function') window.gtag('event', event, params);
  } catch {
    /* le suivi ne doit jamais bloquer le simulateur */
  }
}

function analyticsParams(est) {
  return {
    simulator_formule: est.formule.id,
    simulator_pages: est.state.pages,
    simulator_options: est.options.length,
    simulator_mails: est.state.mails,
    simulator_priority: est.state.priority,
    simulator_maintenance: est.maintenance.id,
    value: est.formule.quote ? 0 : est.creation,
    currency: 'EUR',
  };
}

function init() {
  const form = document.querySelector('[data-simu-form]');
  const summary = document.querySelector('[data-simu-summary]');
  if (!form || !summary) return;
  const cta = document.querySelector('[data-simu-cta]');
  const bar = document.querySelector('[data-simu-bar]');
  const pagesRange = form.querySelector('input[name="pages"]');
  const pagesOut = form.querySelector('[data-simu-pages]');
  const mailsInput = form.querySelector('input[name="mails"]');
  const mailsOut = form.querySelector('[data-simu-mails]');
  let pagesTouched = false;
  let shown = null;

  const read = () => {
    const data = new FormData(form);
    return normalize({
      formule: data.get('formule'),
      pages: data.get('pages'),
      options: data.getAll('options'),
      mails: data.get('mails'),
      priority: data.get('priority') === 'on',
      maintenance: data.get('maintenance'),
    });
  };

  // Compteur animé du total (désactivé si l'appareil demande moins d'animations).
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animateAmount = (node, from, to) => {
    if (reduce || from === null || from === to) {
      node.textContent = euro(to);
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 420);
      const eased = 1 - Math.pow(1 - t, 3);
      node.textContent = euro(Math.round(from + (to - from) * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  let changeTimer = 0;
  const update = (reason) => {
    const state = read();
    const est = estimate(state);
    pagesOut.textContent = String(state.pages);
    pagesRange.setAttribute('aria-valuetext', `${state.pages} page${state.pages > 1 ? 's' : ''}`);
    pagesRange.style.setProperty('--fill', `${((state.pages - LIMITS.pagesMin) / (LIMITS.pagesMax - LIMITS.pagesMin)) * 100}%`);
    mailsOut.textContent = String(state.mails);
    form.querySelectorAll('label[data-simu-choice]').forEach((label) => {
      label.classList.toggle('selected', Boolean(label.querySelector('input:checked')));
    });

    summary.innerHTML = renderSummary(est);
    const amount = summary.querySelector('[data-simu-amount]');
    if (amount) animateAmount(amount, shown, est.creation);
    shown = est.formule.quote ? null : est.creation;

    if (bar) {
      bar.querySelector('[data-simu-bar-total]').textContent = est.formule.quote ? 'Sur devis' : `${est.from ? 'dès ' : ''}${euro(est.creation)}`;
      bar.querySelector('[data-simu-bar-monthly]').textContent = est.monthly ? `+ ${euro(est.monthly)} / mois` : 'sans abonnement';
    }
    if (cta) cta.href = contactHref(est);

    if (reason !== 'init') {
      clearTimeout(changeTimer);
      changeTimer = window.setTimeout(() => track('simulator_change', { ...analyticsParams(est), simulator_field: reason }), 1200);
    }
    return est;
  };

  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', (event) => {
    const target = event.target;
    if (target.name === 'pages') pagesTouched = true;
    if (target.name === 'formule' && !pagesTouched) {
      const formule = FORMULES.find((f) => f.id === target.value);
      if (formule) pagesRange.value = String(formule.pages);
    }
    update(target.name || 'form');
  });

  form.addEventListener('click', (event) => {
    const stepper = event.target.closest('[data-simu-step]');
    if (!stepper) return;
    const input = form.querySelector(`input[name="${stepper.dataset.simuField}"]`);
    const next = clamp(Number(input.value) + Number(stepper.dataset.simuStep), Number(input.min), Number(input.max));
    if (next === Number(input.value)) return;
    input.value = String(next);
    if (input.name === 'pages') pagesTouched = true;
    update(input.name);
  });

  summary.addEventListener('click', (event) => {
    const button = event.target.closest('[data-simu-switch]');
    if (!button) return;
    const radio = form.querySelector(`input[name="formule"][value="${button.dataset.simuSwitch}"]`);
    if (!radio) return;
    radio.checked = true;
    track('simulator_suggestion_click', { simulator_formule: button.dataset.simuSwitch });
    update('suggestion');
  });

  if (cta) {
    cta.addEventListener('click', () => {
      const est = estimate(read());
      cta.href = contactHref(est);
      try {
        sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(handoff(est)));
      } catch {
        /* navigation privée : les paramètres d'adresse suffisent */
      }
      track('simulator_cta_click', analyticsParams(est));
    });
  }

  // Barre mobile : visible tant que le résumé n'est pas à l'écran.
  if (bar && 'IntersectionObserver' in window) {
    const panel = document.querySelector('.simu-panel');
    new IntersectionObserver(([entry]) => bar.classList.toggle('is-hidden', entry.isIntersecting), { threshold: 0.15 }).observe(panel);
  }

  // Préréglage possible par l'adresse, par exemple /simulateur-prix-site-internet?formule=business.
  const params = new URLSearchParams(location.search);
  if (params.has('formule')) {
    const s = normalize({
      formule: params.get('formule'),
      pages: params.get('pages') ?? FORMULES.find((f) => f.id === params.get('formule'))?.pages,
      options: (params.get('options') ?? '').split(',').filter(Boolean),
      mails: params.get('mails') ?? 0,
      priority: params.get('prioritaire') === '1',
      maintenance: params.get('maintenance') ?? DEFAULT_STATE.maintenance,
    });
    form.querySelector(`input[name="formule"][value="${s.formule}"]`).checked = true;
    form.querySelector(`input[name="maintenance"][value="${s.maintenance}"]`).checked = true;
    form.querySelectorAll('input[name="options"]').forEach((input) => (input.checked = s.options.includes(input.value)));
    form.querySelector('input[name="priority"]').checked = s.priority;
    mailsInput.value = String(s.mails);
    pagesRange.value = String(s.pages);
    pagesTouched = params.has('pages');
  }

  document.documentElement.classList.add('simu-ready');
  const est = update('init');
  track('simulator_view', analyticsParams(est));
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}
