// Couche d'animations de lullin-web.com.
// Volontairement indépendante de React : elle s'accroche au DOM rendu, ne touche
// qu'à des attributs data-fx-*, à des variables CSS et aux propriétés individuelles
// (translate, rotate, scale) pour ne pas entrer en conflit avec Motion ni avec React.
// Tout est désactivé si l'appareil demande moins d'animations, ou via le bouton
// « Motion on / off » du site.

const doc = () => document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

type RevealKind = 'up' | 'title' | 'zoom' | 'label' | 'image' | 'flip' | 'swing' | 'scatter';

const REVEALS: Array<[string, RevealKind]> = [
  ['.contact-band h2', 'zoom'],
  ['.section-heading h2, .home-statement h2, .home-faq h2', 'title'],
  ['.section-label', 'label'],
  ['.statement-copy > *, .section-heading > p, .price-note, .section-heading > a', 'up'],
  ['.client-strip span', 'up'],
  ['.project-card', 'up'],
  ['.project-visual', 'image'],
  ['.service-rows > div', 'swing'],
  ['.filter-bar .filter', 'scatter'],
  ['.price-card, .steps-grid > div', 'flip'],
  ['.values-grid > div', 'swing'],
  ['.faq-item', 'up'],
  ['.contact-band-bottom > *', 'up'],
  ['.footer-signature', 'zoom'],
  ['.footer-top > *, .footer-nav a, .footer-bottom > *', 'up'],
];

const TILT = '.price-card, .values-grid > div, .steps-grid > div, .project-card';
const MAGNETIC = '.action, .header-contact, .text-link, .menu-trigger, .footer-top a';
const INTERACTIVE = 'a, button, [role="button"], summary, label, .filter';
const COUNTER = '.price-value';
// Amplitude des grands mouvements : réduite sur petit écran pour ne rien pousser hors cadre.
const amp = () => clamp(window.innerWidth / 1440, 0.3, 1);
const KINETIC_TEXT = 'LULLIN WEB — DESIGN — CODE — IMPACT — ';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rand = (min: number, max: number) => min + Math.random() * (max - min);

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
  { threshold: 0.1 },
);

function scanReveals(root: ParentNode) {
  for (const [selector, kind] of REVEALS) {
    root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      if (el.hasAttribute('data-fx-reveal') || el.closest('.hero') || ownedByMotion(el)) return;
      const siblings = el.parentElement ? Array.from(el.parentElement.children) : [el];
      const index = Math.max(siblings.indexOf(el), 0);
      const step = kind === 'scatter' ? 45 : 110;
      el.style.setProperty('--fx-d', `${Math.min(index, 8) * step}ms`);
      if (kind === 'swing') {
        const side = index % 2 === 0 ? -1 : 1;
        el.style.setProperty('--fx-side', `${(side * 220 * amp()).toFixed(0)}px`);
        el.style.setProperty('--fx-rot', `${side * 9}deg`);
      }
      if (kind === 'scatter') {
        el.style.setProperty('--fx-sx', `${(rand(-420, 420) * amp()).toFixed(0)}px`);
        el.style.setProperty('--fx-sy', `${(rand(-260, 260) * amp()).toFixed(0)}px`);
        el.style.setProperty('--fx-sr', `${rand(-180, 180).toFixed(0)}deg`);
      }
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
      const duration = 1600;
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

/* ---------- Grands textes qui défilent en fond ---------- */

function addKinetic(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('.contact-band, .method-home').forEach((section) => {
    if (section.querySelector(':scope > .fx-kinetic')) return;
    const band = document.createElement('div');
    band.className = 'fx-kinetic';
    band.setAttribute('aria-hidden', 'true');
    for (let row = 0; row < 2; row += 1) {
      const line = document.createElement('div');
      line.className = 'fx-kinetic-row';
      line.textContent = KINETIC_TEXT.repeat(4);
      band.appendChild(line);
    }
    section.prepend(band);
  });
}

/* ---------- Cartes en 3D au survol (léger) ---------- */

function bindTilt(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(TILT).forEach((card) => {
    if (card.hasAttribute('data-fx-tilt')) return;
    card.setAttribute('data-fx-tilt', '');
    const strength = card.matches('.project-card') ? 2 : 4;
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

/* ---------- Boutons magnétiques (léger) ---------- */

function bindMagnetic(root: ParentNode) {
  root.querySelectorAll<HTMLElement>(MAGNETIC).forEach((el) => {
    if (el.hasAttribute('data-fx-magnetic') || el.closest('[data-fx-tilt]')) return;
    el.setAttribute('data-fx-magnetic', '');
    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      el.style.setProperty('--fx-mx', `${(dx * 0.12).toFixed(1)}px`);
      el.style.setProperty('--fx-my', `${(dy * 0.16).toFixed(1)}px`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--fx-mx', '0px');
      el.style.setProperty('--fx-my', '0px');
    });
  });
}

/* ---------- Souris : un simple anneau discret autour du curseur normal ---------- */

function startCursor() {
  const ring = make('div', 'fx-cursor-ring');
  let mx = -100;
  let my = -100;
  let rx = mx;
  let ry = my;
  let running = false;

  const loop = () => {
    rx = lerp(rx, mx, 0.22);
    ry = lerp(ry, my, 0.22);
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
    ring.toggleAttribute('data-hover', Boolean(target?.closest(INTERACTIVE)));
  });
  document.addEventListener('pointerleave', () => doc().classList.remove('fx-cursor-live'));
}

/* ---------- Clic : onde de choc et éclats ---------- */

function burst(x: number, y: number) {
  const wave = make('span', 'fx-wave');
  wave.style.left = `${x}px`;
  wave.style.top = `${y}px`;
  wave.addEventListener('animationend', () => wave.remove(), { once: true });

  const count = 18;
  for (let i = 0; i < count; i += 1) {
    const spark = make('span', 'fx-spark');
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const distance = rand(60, 140);
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.setProperty('--fx-tx', `${(Math.cos(angle) * distance).toFixed(1)}px`);
    spark.style.setProperty('--fx-ty', `${(Math.sin(angle) * distance).toFixed(1)}px`);
    spark.addEventListener('animationend', () => spark.remove(), { once: true });
  }
}

/* ---------- Défilement : parallaxe, vitesse, textes géants ---------- */
// La barre de progression existe déjà dans le site (.page-progress).

// Position d'un élément par rapport au centre de l'écran : -1 (en dessous) → 1 (au-dessus).
function viewProgress(el: Element) {
  const rect = el.getBoundingClientRect();
  const center = rect.top + rect.height / 2;
  return clamp((window.innerHeight / 2 - center) / (window.innerHeight / 2 + rect.height / 2), -1, 1);
}

const SCROLL_STYLED = '.hero-heading, .hero-orbital, .contact-star, .section-heading > div:first-child';

function clearScrollStyles() {
  document.querySelectorAll<HTMLElement>(SCROLL_STYLED).forEach((el) => {
    el.style.removeProperty('translate');
    el.style.removeProperty('scale');
    el.style.removeProperty('rotate');
    el.style.removeProperty('filter');
  });
  doc().style.removeProperty('--fx-skew');
}

function startScrollEffects() {
  let lastY = window.scrollY;
  let velocity = 0;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = Math.max(doc().scrollHeight - vh, 1);
    // Arrivé tout en bas, plus rien ne doit rester caché.
    if (y >= max - 4) {
      document.querySelectorAll('[data-fx-reveal]:not([data-fx-in])').forEach((el) => el.setAttribute('data-fx-in', ''));
    }

    velocity = lerp(velocity, y - lastY, 0.25);
    lastY = y;

    if (motionOff()) {
      clearScrollStyles();
      return;
    }

    // Le héros s'éloigne : il recule, se floute et s'efface vers le haut.
    const heroP = clamp(y / vh, 0, 1.2);
    const heading = document.querySelector<HTMLElement>('.hero-heading');
    if (heading) {
      heading.style.translate = `0 ${(heroP * -140).toFixed(1)}px`;
      heading.style.scale = `${(1 - heroP * 0.18).toFixed(3)}`;
      heading.style.filter = heroP > 0.02 ? `blur(${(heroP * 10).toFixed(1)}px)` : '';
    }
    const orbital = document.querySelector<HTMLElement>('.hero-orbital');
    if (orbital) {
      orbital.style.translate = `0 ${(heroP * 220).toFixed(1)}px`;
      orbital.style.scale = `${(1 + heroP * 0.45).toFixed(3)}`;
      orbital.style.rotate = `${(heroP * 25).toFixed(1)}deg`;
    }

    // Déformation liée à la vitesse : bandeau défilant et visuels des projets.
    doc().style.setProperty('--fx-skew', `${clamp(velocity * -0.3, -12, 12).toFixed(2)}deg`);

    const star = document.querySelector<HTMLElement>('.contact-star');
    if (star) {
      star.style.rotate = `${(y * 0.35).toFixed(1)}deg`;
      star.style.scale = `${(1 + clamp(viewProgress(star) + 1, 0, 2) * 0.25).toFixed(3)}`;
    }

    // Les grands titres de section glissent latéralement.
    const slide = window.innerWidth < 760 ? 0 : 70;
    document.querySelectorAll<HTMLElement>('.section-heading > div:first-child').forEach((el, i) => {
      const p = viewProgress(el);
      if (slide) el.style.translate = `${(p * (i % 2 === 0 ? -slide : slide)).toFixed(1)}px 0`;
      else el.style.removeProperty('translate');
    });

    // Textes géants en fond, en sens opposés.
    document.querySelectorAll<HTMLElement>('.fx-kinetic').forEach((band) => {
      const p = viewProgress(band);
      band.querySelectorAll<HTMLElement>('.fx-kinetic-row').forEach((row, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        row.style.translate = `${(-25 + dir * p * 25).toFixed(2)}% 0`;
      });
    });

    // On laisse les déformations revenir à zéro après un arrêt brusque.
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
  addKinetic(root);
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

/* ---------- Logo à la place de la vidéo du trou noir ----------
   Actif même quand les animations sont réduites : le logo reste alors immobile. */

const HERO_LOGO = '/images/lullin-logo-spin.svg';

function swapHeroMedia() {
  document.querySelectorAll<HTMLElement>('.hero-orbital').forEach((orbital) => {
    // On coupe la vidéo pour ne pas la télécharger pour rien.
    orbital.querySelectorAll<HTMLVideoElement>('video.hero-video').forEach((video) => {
      if (!video.getAttribute('src') && !video.hasAttribute('data-fx-muted')) return;
      video.setAttribute('data-fx-muted', '');
      if (video.getAttribute('src')) {
        video.pause();
        video.removeAttribute('src');
        video.removeAttribute('poster');
        video.load();
      }
    });
    if (orbital.querySelector(':scope > .fx-hero-logo')) return;
    const logo = document.createElement('img');
    logo.className = 'fx-hero-logo';
    logo.src = HERO_LOGO;
    logo.alt = '';
    logo.width = 520;
    logo.height = 520;
    logo.decoding = 'async';
    logo.setAttribute('aria-hidden', 'true');
    orbital.prepend(logo);
  });
}

function startHeroLogo() {
  doc().classList.add('fx-logo');
  swapHeroMedia();
  // Synchrone (pas de délai) pour couper la vidéo avant qu'elle ne se charge.
  new MutationObserver(swapHeroMedia).observe(document.getElementById('root') ?? document.body, {
    childList: true,
    subtree: true,
  });
  window.addEventListener('resize', swapHeroMedia, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startHeroLogo, { once: true });
} else {
  startHeroLogo();
}

if (!reduceMotion && 'IntersectionObserver' in window) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}
