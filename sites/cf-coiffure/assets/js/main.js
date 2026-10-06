/* CF Coiffure — script commun : configuration, horaires, apparitions, utilitaires. */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const pad = (n) => String(n).padStart(2, '0');
  const CF = (window.CF = window.CF || {});

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

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* Prestations (accueil) */
  const services = $('#services');
  if (services) CF.config().then((cfg) => {
    services.innerHTML = cfg.services.map((g) => `<div class="service"><h3>${CF.esc(g.cat)}</h3><ul>${g.items.map((i) => `<li>${CF.esc(i)}</li>`).join('')}</ul></div>`).join('');
  }).catch(() => {});

  /* Horaires, ouvert / fermé, téléphone */
  const hours = $('#hours');
  if (hours) CF.config().then((cfg) => {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: cfg.salon.timezone }));
    const today = now.getDay();
    hours.innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => {
      const r = cfg.hours[d] || [];
      return `<tr class="${d === today ? 'today' : ''}"><th>${DAYS[d]}</th><td>${r.length ? r.map(([a, b]) => CF.h(a) + ' – ' + CF.h(b)).join(', ') : 'Fermé'}</td></tr>`;
    }).join('');
    const mins = now.getHours() * 60 + now.getMinutes();
    const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
    const open = (cfg.hours[today] || []).some(([a, b]) => mins >= toMin(a) && mins < toMin(b));
    const st = $('#open-status');
    st.hidden = false;
    st.textContent = open ? 'Ouvert en ce moment' : 'Fermé en ce moment';
    st.classList.toggle('closed', !open);
    if (cfg.salon.phone) {
      $('#phone-line').innerHTML = `<br><a href="tel:${CF.esc(cfg.salon.phone.replace(/\s/g, ''))}">${CF.esc(cfg.salon.phone)}</a>`;
    }
  }).catch(() => {});

  /* Lien « ajouter à mon agenda » (Google) et fichier .ics pour un rendez-vous */
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
})();
