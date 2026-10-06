/* CF Coiffure — script commun : contenus dynamiques, utilitaires et animations. */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const pad = (n) => String(n).padStart(2, '0');
  const CF = (window.CF = window.CF || {});

  /* ================================================================ utilitaires */

  let configPromise = null;
  CF.config = function () {
    if (!configPromise) configPromise = fetch('/api/config').then((r) => { if (!r.ok) throw new Error('config'); return r.json(); });
    return configPromise;
  };
  CF.esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  CF.h = (t) => t.replace(':', 'h');
  CF.frDate = (date, opts) => new Intl.DateTimeFormat('fr-FR', Object.assign({ weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }, opts))
    .format(new Date(date + 'T12:00:00Z'));
  CF.addDays = (date, n) => {
    const d = new Date(date + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };

  /* Liens « ajouter à mon agenda » pour un rendez-vous */
  const stamp = (date, time) => date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00';
  CF.calendar = function (b, address, manageUrl) {
    const title = 'Coiffeur — CF Coiffure';
    const details = 'Rendez-vous ' + b.id + '. Pour annuler : ' + manageUrl;
    const gcal = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title)
      + '&dates=' + stamp(b.date, b.time) + '/' + stamp(b.date, b.end) + '&ctz=Europe/Paris'
      + '&details=' + encodeURIComponent(details) + '&location=' + encodeURIComponent(address);
    const n = new Date();
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CF Coiffure//RDV//FR', 'BEGIN:VEVENT',
      'UID:' + b.id + '@cf-coiffure',
      'DTSTAMP:' + n.getUTCFullYear() + pad(n.getUTCMonth() + 1) + pad(n.getUTCDate()) + 'T' + pad(n.getUTCHours()) + pad(n.getUTCMinutes()) + '00Z',
      'DTSTART;TZID=Europe/Paris:' + stamp(b.date, b.time), 'DTEND;TZID=Europe/Paris:' + stamp(b.date, b.end),
      'SUMMARY:' + title, 'DESCRIPTION:' + details.replace(/[,;]/g, ' '), 'LOCATION:' + address.replace(/[,;]/g, ' '),
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:' + title, 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return {
      gcal,
      downloadIcs() {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
        a.download = 'rdv-cf-coiffure.ics';
        document.body.appendChild(a);
        a.click();
        a.remove();
      },
    };
  };

  /* Rendez-vous gardés sur cet appareil, pour retrouver le lien d'annulation */
  const KEY = 'cf-rdv';
  CF.mine = {
    all() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (_) { return []; } },
    save(list) { try { localStorage.setItem(KEY, JSON.stringify(list.slice(-10))); } catch (_) { /* indisponible */ } },
    add(e) { this.save(this.all().filter((x) => x.id !== e.id).concat(e)); },
    remove(id) { this.save(this.all().filter((x) => x.id !== id)); },
  };

  /* ============================================================ contenus */

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  const burger = $('.burger');
  if (burger) burger.addEventListener('click', () => {
    burger.setAttribute('aria-expanded', document.body.classList.toggle('menu-open'));
  });
  $$('.nav a').forEach((a) => {
    if (a.getAttribute('href') === location.pathname) a.classList.add('active');
  });

  /* Tarifs */
  const euro = (n) => n.toLocaleString('fr-FR') + ' €';
  const row = (i) => `<div class="price-row"><span>${CF.esc(i.name)}</span><i class="dots"></i><b>${i.from ? '<small>dès</small>' : ''}${euro(i.price)}</b></div>`;
  CF.config().then((cfg) => {
    const groups = $('#prices');
    if (groups) {
      groups.innerHTML = cfg.prices.map((g) => `<div class="price-group" data-reveal><h3>${CF.esc(g.cat)}</h3>${g.note ? `<p class="note">${CF.esc(g.note)}</p>` : ''}${g.items.map(row).join('')}</div>`).join('');
      if (CF.refreshAnimations) CF.refreshAnimations(groups);
    }
    const tabs = $('#menu-tabs');
    const items = $('#menu-items');
    if (tabs && items) {
      const show = (i) => {
        $$('.tab', tabs).forEach((t, j) => t.setAttribute('aria-selected', i === j));
        items.innerHTML = cfg.prices[i].items.map(row).join('');
        if (window.gsap && root.classList.contains('anim')) gsap.from(items.children, { y: 18, opacity: 0, duration: .5, stagger: .06, ease: 'power3.out' });
      };
      tabs.innerHTML = cfg.prices.map((g, i) => `<button class="tab" role="tab" data-i="${i}">${CF.esc(g.cat)}</button>`).join('');
      tabs.addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (t) show(Number(t.dataset.i)); });
      show(0);
    }
  }).catch(() => {
    const groups = $('#prices');
    if (groups) groups.innerHTML = '<p>Les tarifs n’ont pas pu être chargés. Ils sont affichés au salon.</p>';
  });

  /* Horaires, ouvert / fermé, téléphone */
  CF.config().then((cfg) => {
    const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: cfg.salon.timezone }));
    const today = now.getDay();
    const short = $('[data-hours-short]');
    if (short) short.innerHTML = [1, 2, 3, 4, 5, 6, 0].filter((d) => (cfg.hours[d] || []).length)
      .map((d) => `<li>${DAYS[d]} : ${cfg.hours[d].map(([a, b]) => CF.h(a) + '–' + CF.h(b)).join(', ')}</li>`).join('');
    const hours = $('#hours');
    if (hours) hours.innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => {
      const r = cfg.hours[d] || [];
      return `<tr class="${d === today ? 'today' : ''}"><th>${DAYS[d]}</th><td>${r.length ? r.map(([a, b]) => CF.h(a) + ' – ' + CF.h(b)).join(', ') : 'Fermé'}</td></tr>`;
    }).join('');
    const st = $('#open-status');
    if (st) {
      const mins = now.getHours() * 60 + now.getMinutes();
      const open = (cfg.hours[today] || []).some(([a, b]) => mins >= toMin(a) && mins < toMin(b));
      st.hidden = false;
      st.textContent = open ? 'Ouvert en ce moment' : 'Fermé en ce moment';
      st.classList.toggle('closed', !open);
    }
    const phone = $('#phone-line');
    if (phone && cfg.salon.phone) phone.innerHTML = `<br><a href="tel:${CF.esc(cfg.salon.phone.replace(/\s/g, ''))}">${CF.esc(cfg.salon.phone)}</a>`;
  }).catch(() => {});

  /* ============================================================ animations */

  const header = $('.site-header');
  const onScrollHeader = (y) => { if (header) header.classList.toggle('solid', y > 60); };
  addEventListener('scroll', () => onScrollHeader(scrollY), { passive: true });
  onScrollHeader(scrollY);

  if (!root.classList.contains('anim')) return;
  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('anim'); return; }
  root.classList.add('gsap-ok');
  gsap.registerPlugin(ScrollTrigger);
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Défilement fluide */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.11 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ({ scroll }) => onScrollHeader(scroll));
  }
  const velocity = () => (lenis ? lenis.velocity : 0);

  /* Découpe des titres en mots (les éléments enfants restent entiers) */
  function splitWords(el, cls) {
    const out = [];
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement('span');
          w.className = cls;
          w.textContent = part;
          frag.appendChild(w);
          out.push(w);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === 1) {
        node.classList.add(cls);
        out.push(node);
      }
    });
    return out;
  }

  $$('[data-split]').forEach((el) => {
    const words = splitWords(el, 'wi');
    words.forEach((w) => { const inner = document.createElement('span'); while (w.firstChild) inner.appendChild(w.firstChild); w.appendChild(inner); });
    const inners = words.map((w) => w.firstChild);
    gsap.set(inners, { yPercent: 105 });
    gsap.to(inners, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.07, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  /* Apparitions */
  CF.refreshAnimations = (scope = document) => {
    ScrollTrigger.batch($$('[data-reveal]', scope).filter((el) => !el.dataset.done), {
      start: 'top 88%', once: true,
      onEnter: (batch) => { batch.forEach((el) => { el.dataset.done = 1; }); gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12 }); },
    });
    ScrollTrigger.refresh();
  };
  CF.refreshAnimations();

  /* Manifeste : les mots s'allument au fil du défilement */
  $$('[data-words]').forEach((el) => {
    const words = splitWords(el, 'w');
    gsap.to(words, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: true } });
  });

  /* Parallaxe */
  $$('[data-speed]').forEach((el) => {
    const speed = Number(el.dataset.speed);
    const trigger = el.closest('section') || el.parentElement;
    gsap.fromTo(el, { y: () => -speed * 120 }, {
      y: () => speed * 220, ease: 'none',
      scrollTrigger: { trigger, start: trigger.classList.contains('hero') || trigger.classList.contains('page-hero') ? 'top top' : 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  });

  /* Bandes défilantes, accélérées et penchées par la vitesse de défilement */
  $$('[data-marquee]').forEach((m) => {
    const dir = Number(m.dataset.dir || 1);
    const base = [...m.children];
    while (m.scrollWidth < innerWidth * 2.5) base.forEach((c) => m.appendChild(c.cloneNode(true)));
    const half = m.scrollWidth / 2;
    let x = 0;
    const skew = gsap.quickTo(m, 'skewX', { duration: 0.5, ease: 'power3' });
    gsap.ticker.add((t, dt) => {
      const v = velocity();
      x -= dir * (0.06 * dt + Math.abs(v) * 0.4);
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      m.style.transform = `translateX(${x}px)`;
      skew(gsap.utils.clamp(-8, 8, -v * 0.35));
    });
  });

  /* Plaques qui se balancent quand on défile */
  const plates = $$('[data-swing]');
  if (plates.length) {
    const rot = plates.map((p) => gsap.quickTo(p, 'rotation', { duration: 1.4, ease: 'elastic.out(1, 0.25)' }));
    gsap.ticker.add(() => { const v = gsap.utils.clamp(-14, 14, velocity() * 0.8); rot.forEach((r, i) => r(v * (i % 2 ? -0.8 : 1))); });
  }

  /* Galerie horizontale épinglée (ordinateur) */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    $$('[data-hscroll]').forEach((sec) => {
      const track = $('[data-track]', sec);
      const dist = () => track.scrollWidth - innerWidth;
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
      });
    });
  });

  /* Compteurs */
  $$('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split('.')[1] || '').length;
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 2, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = o.v.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec }); },
    });
  });
  $$('.stars-line').forEach((s) => gsap.from(s.children, { scale: 0, rotation: -90, duration: .8, ease: 'back.out(2)', stagger: .1, scrollTrigger: { trigger: s, start: 'top 90%', once: true } }));

  /* Boutons aimantés et curseur */
  if (fine) {
    $$('[data-magnetic]').forEach((b) => {
      const xTo = gsap.quickTo(b, 'x', { duration: .6, ease: 'elastic.out(1, .4)' });
      const yTo = gsap.quickTo(b, 'y', { duration: .6, ease: 'elastic.out(1, .4)' });
      b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .3); yTo((e.clientY - r.top - r.height / 2) * .4); });
      b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
    const dot = $('.cursor');
    const ring = $('.cursor-ring');
    if (dot && ring) {
      const dx = gsap.quickSetter(dot, 'x', 'px');
      const dy = gsap.quickSetter(dot, 'y', 'px');
      const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' });
      const ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
      addEventListener('pointermove', (e) => { root.classList.add('has-cursor'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
      document.addEventListener('pointerleave', () => root.classList.remove('has-cursor'));
      document.addEventListener('pointerover', (e) => {
        const c = e.target.closest('[data-cursor]');
        const l = e.target.closest('a, button, summary, .hcard');
        ring.classList.toggle('big', Boolean(c));
        ring.classList.toggle('link', !c && Boolean(l));
        $('span', ring).textContent = c ? c.dataset.cursor : '';
      });
    }
  }

  /* Rideau Martini à l'arrivée et entre les pages */
  const curtain = $('.curtain');
  const bars = curtain ? $$('i', curtain) : [];
  const logo = curtain && $('.curtain-logo', curtain);
  const intro = gsap.timeline();
  if (curtain) {
    intro.to(logo, { opacity: 0, scale: .9, duration: .35, ease: 'power2.in' }, 0.15)
      .to(bars, { xPercent: 101, duration: .8, ease: 'power4.inOut', stagger: .08 }, 0.3)
      .set(curtain, { visibility: 'hidden' });
  }
  const heroLines = $$('.hero-title .line > span');
  if (heroLines.length) {
    intro.from(heroLines, { yPercent: 110, duration: 1.2, ease: 'power4.out', stagger: .12 }, curtain ? 0.75 : 0)
      .from('[data-hero]', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', stagger: .1 }, '-=0.8')
      .from('.hero-media img', { scale: 1.3, duration: 2.6, ease: 'power2.out' }, 0.4);
  }
  const pageTitle = $('.page-hero .display');
  if (pageTitle) {
    const words = splitWords(pageTitle, 'wi');
    words.forEach((w) => { const inner = document.createElement('span'); while (w.firstChild) inner.appendChild(w.firstChild); w.appendChild(inner); });
    intro.fromTo(words.map((w) => w.firstChild), { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: .08 }, curtain ? 0.7 : 0)
      .from('.page-hero [data-hero]', { y: 24, opacity: 0, duration: .9, ease: 'power3.out', stagger: .1 }, '-=0.7');
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || !curtain || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const url = new URL(a.href, location.href);
    if (a.target === '_blank' || url.origin !== location.origin || a.hasAttribute('download')) return;
    if (url.pathname === location.pathname && url.hash) return;
    if (/\.(ics|csv|pdf)$/.test(url.pathname)) return;
    e.preventDefault();
    document.body.classList.remove('menu-open');
    gsap.set(curtain, { visibility: 'visible' });
    gsap.set(logo, { opacity: 0 });
    gsap.fromTo(bars, { xPercent: -101 }, { xPercent: 0, duration: .55, ease: 'power4.inOut', stagger: .07, onComplete: () => { location.href = url.href; } });
  });
  addEventListener('pageshow', (e) => { if (e.persisted && curtain) gsap.set(curtain, { visibility: 'hidden' }); });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
