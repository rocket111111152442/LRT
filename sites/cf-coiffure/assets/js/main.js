/* CF Coiffure — animations et contenus dynamiques communs à toutes les pages. */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  /* ---------------------------------------------------------- config */
  let configPromise = null;
  window.CF = window.CF || {};
  CF.config = function () {
    if (!configPromise) {
      configPromise = fetch('/api/config').then((r) => {
        if (!r.ok) throw new Error('config');
        return r.json();
      });
    }
    return configPromise;
  };
  CF.euro = (n) => n.toLocaleString('fr-FR') + ' €';
  CF.dur = (m) => (m >= 60 ? Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + String(m % 60).padStart(2, '0') : '') : m + ' min');

  /* ---------------------------------------------------------- loader */
  const loader = $('.loader');
  if (loader) {
    const hide = () => loader.classList.add('out');
    window.addEventListener('load', () => setTimeout(hide, reduce ? 0 : 650));
    setTimeout(hide, 3000);
  }

  /* --------------------------------------------- header, progression */
  const header = $('.site-header');
  const progress = $('.progress');
  const road = $('.road');
  const car = road && $('.car', road);
  const floats = $$('[data-depth]');

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (!reduce) {
      floats.forEach((el) => { el.style.translate = `0 ${(y * Number(el.dataset.depth)).toFixed(1)}px`; });
      if (car) {
        const r = road.getBoundingClientRect();
        const t = Math.min(Math.max((innerHeight - r.top) / (innerHeight + r.height), 0), 1);
        car.style.setProperty('--car', t.toFixed(3));
      }
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('.burger');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
    });
    $$('.nav a').forEach((a) => a.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
    }));
  }

  /* -------------------------------------------------- texte découpé */
  $$('[data-split]').forEach((el) => {
    const text = el.textContent;
    el.textContent = '';
    el.classList.add('split');
    el.setAttribute('aria-label', text);
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'char';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i);
      s.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(s);
    });
  });

  /* ------------------------------------------------------- reveals */
  function counter(el) {
    const end = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split('.')[1] || '').length;
    const start = performance.now();
    const dur = 1600;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const v = end * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (el.dataset.suffix || '');
      if (p < 1) requestAnimationFrame(step);
    };
    if (reduce) el.textContent = end.toLocaleString('fr-FR', { minimumFractionDigits: dec }) + (el.dataset.suffix || '');
    else requestAnimationFrame(step);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('in');
      if (el.dataset.count) counter(el);
      if (el.dataset.pct) animatePct(el);
      io.unobserve(el);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
  CF.observe = (root = document) => $$('.reveal, .split, [data-count], [data-pct]', root).forEach((el) => io.observe(el));
  CF.observe();

  function animatePct(el) {
    const end = Number(el.dataset.pct);
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1400, 1);
      el.style.setProperty('--pct', (end * (1 - Math.pow(1 - p, 3))).toFixed(2));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* --------------------------------------------------------- tilt 3D */
  if (!reduce && matchMedia('(hover: hover)').matches) {
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.03)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------------------------------------- ampoules du menu */
  $$('.bulbs').forEach((box) => {
    const host = box.parentElement;
    const build = () => {
      box.innerHTML = '';
      const w = host.offsetWidth + 16;
      const h = host.offsetHeight + 16;
      const gap = 34;
      const add = (x, y) => {
        const i = document.createElement('i');
        i.style.left = x - 5 + 'px';
        i.style.top = y - 5 + 'px';
        box.appendChild(i);
      };
      for (let x = 14; x < w - 8; x += gap) { add(x, 0); add(x, h); }
      for (let y = gap; y < h - 8; y += gap) { add(0, y); add(w, y); }
    };
    build();
    new ResizeObserver(build).observe(host);
  });

  /* -------------------------------------------------------- lightbox */
  const lb = $('.lightbox');
  if (lb) {
    const img = $('img', lb);
    $$('[data-zoom]').forEach((fig) => fig.addEventListener('click', () => {
      img.src = fig.dataset.zoom;
      img.alt = $('img', fig).alt;
      lb.classList.add('open');
      $('button', lb).focus();
    }));
    const close = () => lb.classList.remove('open');
    lb.addEventListener('click', (e) => { if (e.target !== img) close(); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* -------------------------------------- menu des prestations (accueil) */
  const menu = $('#menu-list');
  if (menu) {
    CF.config().then((cfg) => {
      const cats = [...new Set(cfg.services.map((s) => s.cat))];
      const tabs = $('#menu-tabs');
      const render = (cat) => {
        menu.innerHTML = cfg.services.filter((s) => s.cat === cat).map((s, i) => `
          <li class="menu-item" style="animation-delay:${i * 70}ms">
            <h3>${s.name}</h3><span class="price">${CF.euro(s.price)}</span>
            <p>${s.desc}</p>
            <div class="meta"><span class="dur">${CF.dur(s.duration)}</span><a class="book-mini" href="reserver.html?s=${s.id}">Réserver</a></div>
          </li>`).join('');
        $$('.tab', tabs).forEach((t) => t.setAttribute('aria-selected', t.dataset.cat === cat));
      };
      tabs.innerHTML = cats.map((c) => `<button class="tab" role="tab" data-cat="${c}">${c}</button>`).join('');
      tabs.addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (t) render(t.dataset.cat); });
      render(cats[0]);
    }).catch(() => { menu.innerHTML = '<li class="menu-item"><p>La carte n’a pas pu être chargée. Appelez-nous ou passez au salon.</p></li>'; });
  }

  /* ---------------------------------------------- horaires + OPEN */
  const hoursTable = $('#hours');
  if (hoursTable) {
    CF.config().then((cfg) => {
      const order = [1, 2, 3, 4, 5, 6, 0];
      const now = new Date(new Date().toLocaleString('en-US', { timeZone: cfg.salon.timezone }));
      const today = now.getDay();
      const fmt = (t) => t.replace(':', 'h');
      hoursTable.innerHTML = order.map((d) => {
        const ranges = cfg.hours[d] || [];
        const txt = ranges.length ? ranges.map(([a, b]) => fmt(a) + ' – ' + fmt(b)).join(' · ') : 'Fermé';
        return `<tr class="${d === today ? 'today' : ''}"><th>${DAYS[d]}</th><td class="${ranges.length ? '' : 'closed'}">${txt}</td></tr>`;
      }).join('');
      const mins = now.getHours() * 60 + now.getMinutes();
      const open = (cfg.hours[today] || []).some(([a, b]) => {
        const [ah, am] = a.split(':').map(Number);
        const [bh, bm] = b.split(':').map(Number);
        return mins >= ah * 60 + am && mins < bh * 60 + bm;
      });
      const badge = $('.open-badge');
      if (badge) {
        badge.textContent = open ? 'OPEN' : 'CLOSED';
        badge.classList.add(open ? 'is-open' : 'is-closed', 'neon');
        if (open) badge.classList.add('flicker');
      }
      $$('[data-phone]').forEach((el) => {
        if (cfg.salon.phone) {
          el.href = 'tel:' + cfg.salon.phone.replace(/\s/g, '');
          $('span', el).textContent = cfg.salon.phone;
        } else el.remove();
      });
    }).catch(() => {});
  }

  /* ----------------------------------------------------- année footer */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();

/* ------------------------------------------- utilitaires rendez-vous */
(function () {
  'use strict';
  const CF = window.CF;
  const pad = (n) => String(n).padStart(2, '0');

  CF.frDate = (date, opts) => new Intl.DateTimeFormat('fr-FR', Object.assign({ weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }, opts))
    .format(new Date(date + 'T12:00:00Z'));
  CF.addDays = (date, n) => {
    const d = new Date(date + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };
  CF.esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const stamp = (date, time) => date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00';

  /** Liens d'ajout à l'agenda pour un rendez-vous { id, date, time, end, services }. */
  CF.calendar = function (b, address) {
    const title = 'CF Coiffure — ' + b.services.map((s) => s.name).join(' + ');
    const details = 'Rendez-vous ' + b.id + '. Pour gérer ou annuler : ' + (b.manageUrl || location.origin);
    const gcal = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
      + '&text=' + encodeURIComponent(title)
      + '&dates=' + stamp(b.date, b.time) + '/' + stamp(b.date, b.end)
      + '&ctz=Europe/Paris'
      + '&details=' + encodeURIComponent(details)
      + '&location=' + encodeURIComponent(address || 'CF Coiffure, Six-Fours-les-Plages');
    const now = new Date();
    const dtstamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + 'T' + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + '00Z';
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CF Coiffure//Reservation//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + b.id + '@cf-coiffure',
      'DTSTAMP:' + dtstamp,
      'DTSTART;TZID=Europe/Paris:' + stamp(b.date, b.time),
      'DTEND;TZID=Europe/Paris:' + stamp(b.date, b.end),
      'SUMMARY:' + title.replace(/[,;]/g, ' '),
      'DESCRIPTION:' + details.replace(/[,;]/g, ' '),
      'LOCATION:' + (address || 'CF Coiffure Six-Fours-les-Plages').replace(/[,;]/g, ' '),
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Rendez-vous CF Coiffure', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    return {
      gcal,
      downloadIcs() {
        const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rdv-cf-coiffure-' + b.date + '.ics';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      },
    };
  };

  /* Rendez-vous mémorisés sur cet appareil (simple confort : le lien e-mail fait foi). */
  const KEY = 'cf-rdv';
  CF.mine = {
    all() {
      try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (_) { return []; }
    },
    save(list) {
      try { localStorage.setItem(KEY, JSON.stringify(list.slice(-20))); } catch (_) { /* stockage indisponible */ }
    },
    add(entry) { this.save(this.all().filter((e) => e.id !== entry.id).concat(entry)); },
    remove(id) { this.save(this.all().filter((e) => e.id !== id)); },
  };

  CF.confetti = function () {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = document.createElement('div');
    box.className = 'confetti';
    const colors = ['#d6262c', '#3d8fd1', '#f2c230', '#f3e6c9', '#0f2f5c', '#7fd1c4'];
    for (let i = 0; i < 120; i++) {
      const c = document.createElement('i');
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = 2 + Math.random() * 2.5 + 's';
      c.style.animationDelay = Math.random() * 0.6 + 's';
      c.style.borderRadius = i % 3 ? '2px' : '50%';
      box.appendChild(c);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 5500);
  };
})();
