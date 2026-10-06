/* CF Coiffure — réservation : jour, heure, nom, téléphone. */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CF = window.CF;
  const esc = CF.esc;
  const state = { date: null, time: null, month: null };
  let cfg = null;

  CF.config().then((c) => {
    cfg = c;
    state.month = cfg.today.slice(0, 7);
    renderCalendar();
    renderMine();
  }).catch(() => {
    $('#book').innerHTML = '<div class="alert">La réservation en ligne est momentanément indisponible. Merci de contacter le salon.</div>';
  });

  /* ------------------------------------------------------- calendrier */

  function dayOpen(date) {
    const wd = new Date(date + 'T12:00:00Z').getUTCDay();
    return date >= cfg.today && date <= CF.addDays(cfg.today, cfg.rules.maxDaysAhead) && (cfg.hours[wd] || []).length > 0;
  }

  function renderCalendar() {
    const [y, m] = state.month.split('-').map(Number);
    const first = state.month + '-01';
    const offset = (new Date(first + 'T12:00:00Z').getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const label = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(first + 'T12:00:00Z'));
    const maxMonth = CF.addDays(cfg.today, cfg.rules.maxDaysAhead).slice(0, 7);
    let cells = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => `<span class="dow">${d}</span>`).join('');
    cells += '<span></span>'.repeat(offset);
    for (let d = 1; d <= days; d++) {
      const date = `${state.month}-${String(d).padStart(2, '0')}`;
      const open = dayOpen(date);
      cells += `<button type="button" data-date="${date}" ${open ? '' : 'disabled'} class="${date === cfg.today ? 'today' : ''}" aria-pressed="${state.date === date}" aria-label="${CF.frDate(date)}">${d}</button>`;
    }
    $('#calendar').innerHTML = `
      <div class="cal-head">
        <button type="button" data-month="-1" aria-label="Mois précédent" ${state.month <= cfg.today.slice(0, 7) ? 'disabled' : ''}>‹</button>
        <strong>${label}</strong>
        <button type="button" data-month="1" aria-label="Mois suivant" ${state.month >= maxMonth ? 'disabled' : ''}>›</button>
      </div>
      <div class="cal-grid">${cells}</div>`;
  }

  $('#calendar').addEventListener('click', (e) => {
    const mb = e.target.closest('[data-month]');
    if (mb) {
      const [y, m] = state.month.split('-').map(Number);
      state.month = new Date(Date.UTC(y, m - 1 + Number(mb.dataset.month), 1)).toISOString().slice(0, 7);
      return renderCalendar();
    }
    const db = e.target.closest('[data-date]');
    if (!db || db.disabled) return;
    state.date = db.dataset.date;
    state.time = null;
    renderCalendar();
    loadSlots();
    update();
  });

  /* ---------------------------------------------------------- horaires */

  async function loadSlots() {
    const date = state.date;
    const box = $('#slots');
    box.innerHTML = '<p class="muted" style="margin:0">Chargement…</p>';
    try {
      const r = await fetch('/api/availability?date=' + date);
      if (!r.ok) throw new Error();
      const { slots } = await r.json();
      if (state.date !== date) return;
      box.innerHTML = slots.length
        ? `<p class="muted" style="margin:0 0 10px">${esc(CF.frDate(date))}</p><div class="slots">${slots.map((t) =>
          `<button type="button" class="slot" data-time="${t}" aria-pressed="false">${CF.h(t)}</button>`).join('')}</div>`
        : `<div class="empty">Plus de place le ${esc(CF.frDate(date))}. Essayez un autre jour.</div>`;
    } catch (_) {
      box.innerHTML = '<div class="alert">Impossible de charger les horaires. Réessayez.</div>';
    }
  }

  $('#slots').addEventListener('click', (e) => {
    const b = e.target.closest('.slot');
    if (!b) return;
    state.time = b.dataset.time;
    $$('.slot').forEach((s) => s.setAttribute('aria-pressed', s === b));
    update();
    if (matchMedia('(max-width: 800px)').matches) $('#form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function update() {
    $('#recap').textContent = state.date && state.time
      ? `${CF.frDate(state.date)} à ${CF.h(state.time)}`.replace(/^./, (c) => c.toUpperCase())
      : 'Aucun créneau choisi.';
    $('#submit').disabled = !(state.date && state.time);
  }

  /* ------------------------------------------------------- formulaire */

  const form = $('#form');
  try {
    const saved = JSON.parse(localStorage.getItem('cf-contact') || 'null');
    if (saved) { form.elements.name.value = saved.name || ''; form.elements.phone.value = saved.phone || ''; }
  } catch (_) { /* rien */ }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('#error');
    err.innerHTML = '';
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    const fail = (msg) => { err.innerHTML = `<div class="alert">${esc(msg)}</div>`; };
    if (!state.date || !state.time) return fail('Choisissez un jour et une heure.');
    if (name.length < 2) return fail('Indiquez votre nom.');
    if (phone.replace(/\D/g, '').length < 9) return fail('Indiquez un numéro de téléphone valide.');

    const btn = $('#submit');
    btn.disabled = true;
    btn.textContent = 'Réservation…';
    try {
      const r = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: state.date, time: state.time, name, phone, website: form.elements.website.value }),
      });
      const res = await r.json().catch(() => ({}));
      if (r.status === 409) {
        state.time = null;
        await loadSlots();
        update();
        return fail(res.error);
      }
      if (!r.ok) return fail(res.error || 'La réservation a échoué.');
      try { localStorage.setItem('cf-contact', JSON.stringify({ name, phone })); } catch (_) { /* rien */ }
      showDone(res.booking, res.token);
    } catch (_) {
      fail('Connexion impossible. Vérifiez votre réseau et réessayez.');
    } finally {
      btn.textContent = 'Réserver';
      update();
    }
  });

  /* ---------------------------------------------------- confirmation */

  function showDone(b, token) {
    const manageUrl = `${location.origin}/rdv.html?id=${encodeURIComponent(b.id)}&t=${encodeURIComponent(token)}`;
    CF.mine.add({ id: b.id, token, date: b.date, time: b.time });
    $('#book').hidden = true;
    $('#mine').hidden = true;
    $('#band').hidden = true;
    const done = $('#done');
    done.hidden = false;
    done.innerHTML = `
      <h1>C'est réservé, merci&nbsp;!</h1>
      <p class="muted">À bientôt au salon.</p>
      <div class="ticket">
        <p class="when">${esc(CF.frDate(b.date))}<br>à ${CF.h(b.time)}</p>
        <dl>
          <dt>Nom</dt><dd>${esc(b.name)}</dd>
          <dt>Téléphone</dt><dd>${esc(b.phone)}</dd>
          <dt>Adresse</dt><dd>${esc(cfg.salon.address)}</dd>
          <dt>Code</dt><dd>${esc(b.id)}</dd>
        </dl>
      </div>
      <div class="actions">
        <a class="btn outline small" id="gcal" target="_blank" rel="noopener">Ajouter à Google Agenda</a>
        <button class="btn outline small" id="ics">Ajouter à mon calendrier</button>
        <a class="btn outline small" href="${esc(manageUrl)}">Annuler ce rendez-vous</a>
      </div>
      <p class="small-print">Un empêchement&nbsp;? Ce lien reste disponible sur cette page tant que vous utilisez le même téléphone.</p>`;
    const cal = CF.calendar(b, cfg.salon.address, manageUrl);
    $('#gcal').href = cal.gcal;
    $('#ics').onclick = cal.downloadIcs;
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* Rendez-vous déjà pris depuis ce téléphone */
  function renderMine() {
    const list = CF.mine.all().filter((e) => e.date >= cfg.today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    if (!list.length) return;
    $('#mine').innerHTML = `<div class="alert info">Vous avez déjà ${list.length > 1 ? 'des rendez-vous' : 'un rendez-vous'} : ${list.map((e) =>
      `<a href="/rdv.html?id=${encodeURIComponent(e.id)}&t=${encodeURIComponent(e.token)}">${esc(CF.frDate(e.date))} à ${CF.h(e.time)}</a>`).join(', ')}.</div>`;
  }
})();
