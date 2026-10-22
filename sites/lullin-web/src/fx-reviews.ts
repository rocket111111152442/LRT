// Section « Avis Google » de la page d'accueil, alimentée par /api/google-reviews.
// Rien n'est affiché si l'API ne répond pas ou s'il n'y a aucun avis à montrer.
// Tout le texte venant de Google est inséré avec textContent (jamais en HTML).

import './fx-reviews.css';

type Review = {
  author: string;
  authorUrl: string | null;
  photo: string | null;
  rating: number;
  text: string;
  time: string;
};

type ReviewsData = {
  ok: true;
  rating: number | null;
  total: number;
  url: string | null;
  writeUrl: string | null;
  reviews: Review[];
};

const MAX_CARDS = 5;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function safeUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function stars(rating: number) {
  const wrap = el('span', 'fx-reviews-stars');
  wrap.setAttribute('aria-label', `${String(rating).replace('.', ',')} sur 5`);
  wrap.setAttribute('role', 'img');
  const full = Math.round(rating);
  for (let i = 0; i < 5; i += 1) {
    const star = el('i', i < full ? 'is-on' : '');
    star.setAttribute('aria-hidden', 'true');
    wrap.appendChild(star);
  }
  return wrap;
}

function link(href: string, className: string, label: string) {
  const a = el('a', className, label);
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
}

function build(data: ReviewsData) {
  const section = el('section', 'section wrap fx-reviews');
  section.setAttribute('aria-labelledby', 'fx-reviews-title');

  const heading = el('div', 'section-heading');
  const left = el('div');
  const label = el('p', 'section-label');
  label.append(el('span', '', 'AVIS / '), document.createTextNode('CE QUE DISENT NOS CLIENTS'));
  const title = el('h2');
  title.id = 'fx-reviews-title';
  const rating = data.rating !== null ? data.rating.toFixed(1).replace('.', ',') : null;
  if (rating) {
    title.append(document.createTextNode('Noté '), el('em', '', `${rating}/5`), document.createElement('br'), document.createTextNode('sur Google.'));
  } else {
    title.textContent = 'Ils nous ont fait confiance.';
  }
  left.append(label, title);

  const summary = el('p');
  const plural = data.total > 1 ? 's' : '';
  summary.textContent = `${data.total} avis publié${plural} sur notre fiche Google, affiché${plural} tel${plural} quel${plural}.`;
  heading.append(left, summary);

  const grid = el('div', 'fx-reviews-grid');
  data.reviews.slice(0, MAX_CARDS).forEach((review) => {
    const card = el('figure', 'fx-review');
    const top = el('div', 'fx-review-top');
    top.append(stars(review.rating), el('span', 'fx-review-time', review.time));
    const quote = el('blockquote', 'fx-review-text', review.text);

    const author = el('figcaption', 'fx-review-author');
    const photo = safeUrl(review.photo);
    if (photo) {
      const img = el('img');
      img.src = photo;
      img.alt = '';
      img.width = 36;
      img.height = 36;
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      author.appendChild(img);
    } else {
      author.appendChild(el('span', 'fx-review-initial', (review.author[0] ?? 'C').toUpperCase()));
    }
    const authorUrl = safeUrl(review.authorUrl);
    author.appendChild(authorUrl ? link(authorUrl, 'fx-review-name', review.author) : el('span', 'fx-review-name', review.author));

    card.append(top, quote, author);
    grid.appendChild(card);
  });

  const foot = el('div', 'fx-reviews-foot');
  const badge = el('span', 'fx-reviews-google');
  badge.append(el('b', '', 'Google'), document.createTextNode(' · avis vérifiés par Google, non modifiés'));
  foot.appendChild(badge);
  const actions = el('div', 'fx-reviews-actions');
  const url = safeUrl(data.url);
  const writeUrl = safeUrl(data.writeUrl);
  if (url) actions.appendChild(link(url, 'text-link', 'Voir tous les avis'));
  if (writeUrl) actions.appendChild(link(writeUrl, 'action', 'Laisser un avis'));
  foot.appendChild(actions);

  section.append(heading, grid, foot);
  return section;
}

// Apparition des cartes avec les animations de fx.css (voir fx.ts).
function animate(section: HTMLElement) {
  if (!('IntersectionObserver' in window)) return;
  const cards = Array.from(section.querySelectorAll<HTMLElement>('.fx-review, .fx-reviews-foot'));
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-fx-in', '');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.1 },
  );
  cards.forEach((card, index) => {
    card.style.setProperty('--fx-d', `${Math.min(index, 6) * 110}ms`);
    card.setAttribute('data-fx-reveal', 'up');
    observer.observe(card);
  });
}

function mount(section: HTMLElement) {
  // Uniquement sur la page d'accueil, juste avant la FAQ ; retirée ailleurs.
  const anchor = document.querySelector('main .home-faq');
  if (!anchor) {
    section.remove();
    return;
  }
  if (section.nextElementSibling !== anchor) anchor.before(section);
}

async function start() {
  let data: ReviewsData;
  try {
    const res = await fetch('/api/google-reviews', { headers: { Accept: 'application/json' } });
    if (!res.ok) return;
    data = (await res.json()) as ReviewsData;
  } catch {
    return;
  }
  if (!data.ok || data.total < 1 || data.reviews.length === 0) return;

  const section = build(data);
  animate(section);
  mount(section);
  const root = document.getElementById('root') ?? document.body;
  new MutationObserver(() => mount(section)).observe(root, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void start(), { once: true });
} else {
  void start();
}
