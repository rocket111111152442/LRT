// Couche d'animations de lullin-web.com.
// Volontairement indépendante de React : elle s'accroche au DOM rendu, ne touche
// qu'à des attributs data-fx-* et aux propriétés CSS individuelles (translate,
// rotate, scale) pour ne pas entrer en conflit avec Motion ni avec les classes React.
// Tout est désactivé si l'appareil demande moins d'animations.

const doc = () => document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

type RevealKind = 'up' | 'title' | 'label' | 'image' | 'pop';

const REVEALS: Array<[string, RevealKind]> = [
  ['.section-heading h2, .home-statement h2, .home-faq h2, .contact-band h2', 'title'],
  ['.section-label', 'label'],
  ['.statement-copy > *, .section-heading > p, .price-note', 'up'],
  ['.client-strip span', 'up'],
  ['.project-card', 'up'],
  ['.project-visual', 'image'],
  ['.service-rows > div', 'up'],
  ['.filter-bar .filter', 'pop'],
  ['.steps-grid > div, .price-card, .values-grid > div, .faq-item', 'up'],
  ['.contact-band-bottom > *', 'up'],
  ['.footer-top > *, .footer-nav a, .footer-signature, .footer-bottom > *', 'up'],
];

const TILT = '.price-card, .values-grid > div, .steps-grid > div, .project-card';
const MAGNETIC = '.action, .header-contact, .text-link, .menu-trigger, .footer-top a';
const INTERACTIVE = 'a, button, [role="button"], summary, label, .filter';
const COUNTER = '.price-value';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Le site a son propre interrupteur « Motion on / off » (html[data-motion]).
const motionOff = () => doc().dataset.motion === 'off';

function make(tag: string, className: string, parent: HTMLElement = document.body) {
  const el = document.createElement(tag);
  el.className = className;
  el.setAttribute('aria-hidden', 'true');
  parent.appendChild(el);
  return el;
}

// Motion pose ses propres styles en ligne : on laisse ces éléments tranquilles.
function ownedByMotion(el: HTMLElement) {
  return Boolean(el.style.opacity || el.style.transform);
}

/* ---------- Apparitions au défilement ---------- */

const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target as HTMLElement;
      el.setAttribute('data-fx-in', '');
      revealObserver.unobserve(el);
      if (el.matches(COUNTER) || el.querySelector(COUNTER)) countUp(el);
    }
  },
  { threshold: 0.12 },
);

function scanReveals(root: ParentNode) {
  for (const [selector, kind] of REVEALS) {
    root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      if (el.hasAttribute('data-fx-reveal') || el.closest('.hero') || ownedByMotion(el)) return;
      const siblings = el.parentElement ? Array.from(el.parentElement.children) : [el];
      const index = Math.min(siblings.indexOf(el), 7);
      el.style.setProperty('--fx-d', `${Math.max(index, 0) * 85}ms`);
      el.setAttribute('data-fx-reveal', kind);
      revealObserver.observe(el);
    });
  }
}

/* ---------- Compteurs sur les prix ---------- */

function countUp(scope: HTMLElement) {
  const targets = scope.matches(COUNTER) ? [scope] : Array.from(scope.querySelectorAll<HTMLElement>(COUNTER));
  for (const target of targets) {
    if (target.hasAttribute('data-fx-counted') || motionOff()) continue;
    target.setAttribute('data-fx-counted', '');
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      if (/\d/.test(node.nodeValue ?? '')) nodes.push(node);
    }
    for (const node of nodes) {
      const original = node.nodeValue ?? '';
      const match = original.match(/\d[\d\s  ]*/);
      if (!match) continue;
      const value = Number(match[0].replace(/\D/g, ''));
      if (!Number.isFinite(value) || value < 10) continue;
      const start = performance.now();
      const duration = 1400;
      const tick = (now: number) => {
        // On ne touche plus au texte si React l'a remplacé entre-temps.
        if (!node.isConnected) return;
        const t = clamp((now - start) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        if (t < 1) {
          const current = Math.round(value * eased).toLocaleString('fr-FR');
          node.nodeValue = original.replace(match[0].trimEnd(), current);
          requestAnimationFrame(tick);
        } else {
          node.nodeValue = original;
        }
      };
      requestAnimationFrame(tick);
    }
  }
}

/* ---------- Cartes en 3D au survol ---------- */

function bindTilt(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(TILT).forEach((card) => {
    if (card.hasAttribute('data-fx-tilt')) return;
    card.setAttribute('data-fx-tilt', '');
    const strength = card.matches('.project-card') ? 4 : 8;
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty('--fx-rx', `${((0.5 - y) * strength).toFixed(2)}deg`);
      card.style.setProperty('--fx-ry', `${((x - 0.5) * strength).toFixed(2)}deg`);
      card.style.setProperty('--fx-gx', `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--fx-gy', `${(y * 100).toFixed(1)}%`);
      card.setAttribute('data-fx-hover', '');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--fx-rx', '0deg');
      card.style.setProperty('--fx-ry', '0deg');
      card.removeAttribute('data-fx-hover');
    });
  });
}

/* ---------- Boutons magnétiques ---------- */

function bindMagnetic(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(MAGNETIC).forEach((el) => {
    if (el.hasAttribute('data-fx-magnetic') || el.closest('[data-fx-tilt]')) return;
    el.setAttribute('data-fx-magnetic', '');
    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      el.style.setProperty('--fx-mx', `${(dx * 0.28).toFixed(1)}px`);
      el.style.setProperty('--fx-my', `${(dy * 0.38).toFixed(1)}px`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--fx-mx', '0px');
      el.style.setProperty('--fx-my', '0px');
    });
  });
}

/* ---------- Curseur, halo et éclats au clic ---------- */

function startCursor() {
  doc().classList.add('fx-cursor');
  const dot = make('div', 'fx-cursor-dot');
  const ring = make('div', 'fx-cursor-ring');
  const spot = make('div', 'fx-spot');
  let mx = -100;
  let my = -100;
  let rx = mx;
  let ry = my;
  let running = false;

  const loop = () => {
    rx = lerp(rx, mx, 0.18);
    ry = lerp(ry, my, 0.18);
    ring.style.translate = `${rx.toFixed(1)}px ${ry.toFixed(1)}px`;
    if (Math.abs(rx - mx) + Math.abs(ry - my) > 0.2) {
      requestAnimationFrame(loop);
    } else {
      running = false;
    }
  };

  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      mx = event.clientX;
      my = event.clientY;
      dot.style.translate = `${mx}px ${my}px`;
      spot.style.setProperty('--fx-x', `${mx}px`);
      spot.style.setProperty('--fx-y', `${my}px`);
      doc().classList.add('fx-cursor-live');
      if (!running) {
        running = true;
        requestAnimationFrame(loop);
      }
    },
    { passive: true },
  );

  document.addEventListener('pointerover', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const card = target?.closest('.project-card');
    const interactive = target?.closest(INTERACTIVE);
    ring.toggleAttribute('data-hover', Boolean(interactive));
    ring.toggleAttribute('data-view', Boolean(card));
  });
  document.addEventListener('pointerleave', () => doc().classList.remove('fx-cursor-live'));
  document.addEventListener('pointerdown', () => ring.setAttribute('data-press', ''));
  document.addEventListener('pointerup', () => ring.removeAttribute('data-press'));
}

function burst(x: number, y: number) {
  const count = 12;
  for (let i = 0; i < count; i += 1) {
    const spark = make('span', 'fx-spark');
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const distance = 38 + Math.random() * 46;
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.setProperty('--fx-tx', `${Math.cos(angle) * distance}px`);
    spark.style.setProperty('--fx-ty', `${Math.sin(angle) * distance}px`);
    spark.addEventListener('animationend', () => spark.remove(), { once: true });
  }
}

/* ---------- Défilement : parallaxe et vitesse ---------- */
// La barre de progression existe déjà dans le site (.page-progress).

function startScrollEffects() {
  let lastY = window.scrollY;
  let velocity = 0;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const max = Math.max(doc().scrollHeight - window.innerHeight, 1);
    // Arrivé tout en bas, plus rien ne doit rester caché.
    if (y >= max - 4) {
      document.querySelectorAll('[data-fx-reveal]:not([data-fx-in])').forEach((el) => el.setAttribute('data-fx-in', ''));
    }

    velocity = lerp(velocity, y - lastY, 0.25);
    lastY = y;

    const orbital = document.querySelector<HTMLElement>('.hero-orbital');
    const marquee = document.querySelector<HTMLElement>('.marquee');
    const star = document.querySelector<HTMLElement>('.contact-star');
    if (motionOff()) {
      orbital?.style.removeProperty('translate');
      orbital?.style.removeProperty('scale');
      marquee?.style.removeProperty('--fx-skew');
      star?.style.removeProperty('rotate');
      return;
    }

    if (orbital) {
      const p = clamp(y / window.innerHeight, 0, 1.2);
      orbital.style.translate = `0 ${(p * 90).toFixed(1)}px`;
      orbital.style.scale = `${(1 + p * 0.12).toFixed(3)}`;
    }

    if (marquee) marquee.style.setProperty('--fx-skew', `${clamp(velocity * -0.25, -9, 9).toFixed(2)}deg`);

    if (star) star.style.rotate = `${(y * 0.12).toFixed(1)}deg`;

    const signature = document.querySelector<HTMLElement>('.footer-signature');
    if (signature) {
      const rect = signature.getBoundingClientRect();
      const p = clamp(1 - rect.top / window.innerHeight, 0, 1);
      signature.style.setProperty('--fx-sig', `${((1 - p) * 60).toFixed(1)}px`);
    }

    // On laisse la déformation du bandeau revenir à zéro après un arrêt brusque.
    if (Math.abs(velocity) > 0.3) requestTick();
  };

  const requestTick = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick, { passive: true });
  requestTick();
}

/* ---------- Mise en route ---------- */

function scan(root: ParentNode) {
  scanReveals(root);
  if (finePointer) {
    bindTilt(root);
    bindMagnetic(root);
  }
}

function start() {
  doc().classList.add('fx-on');
  make('div', 'fx-grain');
  startScrollEffects();
  if (finePointer) startCursor();

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!motionOff() && target?.closest('.action, .header-contact, .filter, button')) burst(event.clientX, event.clientY);
  });

  // Les éléments à imprimer doivent tous être visibles.
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('[data-fx-reveal]').forEach((el) => el.setAttribute('data-fx-in', ''));
  });

  const root = document.getElementById('root') ?? document.body;
  let pending = 0;
  new MutationObserver(() => {
    window.clearTimeout(pending);
    pending = window.setTimeout(() => scan(root), 120);
  }).observe(root, { childList: true, subtree: true });
  scan(root);

  console.log(
    '%cLullin Web%c  Design. Code. Impact.  →  contact@lullin-web.com',
    'background:#d2fd79;color:#111211;font:700 14px "Space Grotesk",sans-serif;padding:6px 10px',
    'color:#d2fd79;font:500 12px "DM Sans",sans-serif',
  );
}

if (!reduceMotion && 'IntersectionObserver' in window) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}
