/* CF Coiffure — assistant de réservation (reserver.html). */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CF = window.CF;
  const esc = CF.esc;
  const params = new URLSearchParams(location.search);

  const state = {
    step: 0,
    services: new Set(),
    staff: 'any',
    date: null,
    time: null,
    month: null, // 'YYYY-MM'
    replace: null,
  };
  let cfg = null;
  const slotCache = new Map();

  /* -------------------------------------------------------------- init */

  CF.config().then(async (c) => {
    cfg = c;
    state.month = cfg.today.slice(0, 7);
    (params.get('s') || '').split(',').forEach((id) => { if (cfg.services.some((s) => s.id === id)) state.services.add(id); });
    if (cfg.staff.some((s) => s.id === params.get('staff'))) state.staff = params.get('staff');

    if (params.get('replace') && params.get('t')) await loadReplace(params.get('replace'), params.get('t'));

    renderServices();
    renderStaff();
    renderCalendar();
    renderTicket();
    renderMine();
    go(state.replace ? 2 : 0);
    if (location.hash === '#mes-rdv') setTimeout(() => $('#mes-rdv').scrollIntoView(), 300);
  }).catch(() => {
    $('#wizard').innerHTML = '<div class="alert">Le module de réservation est momentanément indisponible. Merci d’appeler le salon.</div>';
  });

  async function loadReplace(id, token) {
    try {
      const r = await fetch(`/api/booking?id=${encodeURIComponent(id)}&t=${encodeURIComponent(token)}`);
      if (!r.ok) return;
      const { booking } = await r.json();
      if (booking.status !== 'confirmed') return;
      state.replace = { id, token, booking };
      booking.services.forEach((s) => state.services.add(s.id));
      state.staff = booking.staff;
      const banner = $('#replace-banner');
      banner.hidden = false;
      banner.innerHTML = `🔁 Vous déplacez le rendez-vous <strong>${esc(id)}</strong> du ${esc(CF.frDate(booking.date))} à ${esc(booking.time)}. L’ancien créneau sera libéré dès la confirmation du nouveau.`;
    } catch (_) { /* on continue en réservation normale */ }
  }

  /* ------------------------------------------------------------ steps */

  function canGo(step) {
    if (step >= 1 && !state.services.size) return false;
    if (step >= 3 && !(state.date && state.time)) return false;
    return true;
  }

  function go(step) {
    if (!canGo(step)) return;
    state.step = step;
    $$('.panel').forEach((p) => p.classList.toggle('active', Number(p.dataset.step) === step));
    $$('#stepper li').forEach((li, i) => {
      li.classList.toggle('current', i === step);
      li.classList.toggle('done', i < step);
      $('button', li).disabled = !canGo(i);
    });
    $('#stepper').style.setProperty('--sp', step / 3);
    if (step === 2 && state.date) loadSlots(state.date);
    const top = $('#stepper').getBoundingClientRect().top + scrollY - 100;
    if (scrollY > top) scrollTo({ top, behavior: 'smooth' });
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-next]')) go(state.step + 1);
    else if (e.target.closest('[data-prev]')) go(state.step - 1);
    else if (e.target.closest('[data-goto]')) go(Number(e.target.closest('[data-goto]').dataset.goto));
  });

  function refreshButtons() {
    $('[data-step="0"] [data-next]').disabled = !state.services.size;
    $('[data-step="2"] [data-next]').disabled = !(state.date && state.time);
    $$('#stepper li').forEach((li, i) => { $('button', li).disabled = !canGo(i); });
  }

  function selection() {
    const items = cfg.services.filter((s) => state.services.has(s.id));
    return {
      items,
      duration: items.reduce((n, s) => n + s.duration, 0),
      price: items.reduce((n, s) => n + s.price, 0),
    };
  }

  function invalidateSlot() {
    state.time = null;
    slotCache.clear();
    if (state.date) loadSlots(state.date);
  }

  /* -------------------------------------------------------- services */

  function renderServices() {
    const cats = [...new Set(cfg.services.map((s) => s.cat))];
    $('#services').innerHTML = cats.map((cat) => `
      <div class="cat-title">${esc(cat)}</div>
      <div class="svc-grid">
        ${cfg.services.filter((s) => s.cat === cat).map((s) => `
          <button type="button" class="svc" data-id="${s.id}" aria-pressed="${state.services.has(s.id)}">
            <strong>${esc(s.name)}</strong><span class="p">${CF.euro(s.price)}</span>
            <span class="d">⏱ ${CF.dur(s.duration)}</span>
            <small>${esc(s.desc)}</small>
          </button>`).join('')}
      </div>`).join('');
    refreshButtons();
  }

  $('#services').addEventListener('click', (e) => {
    const b = e.target.closest('.svc');
    if (!b) return;
    const id = b.dataset.id;
    if (state.services.has(id)) state.services.delete(id);
    else {
      if (state.services.size >= cfg.rules.maxServices) return flash(b);
      state.services.add(id);
    }
    b.setAttribute('aria-pressed', state.services.has(id));
    invalidateSlot();
    renderTicket();
    refreshButtons();
  });

  function flash(el) {
    el.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 300 });
  }

  /* ----------------------------------------------------------- staff */

  function renderStaff() {
    const plates = ['yellow', 'blue', 'mint', 'pink', 'red'];
    const cards = [{ id: 'any', name: 'Sans préférence', tagline: 'Le premier fauteuil libre' }].concat(cfg.staff);
    $('#staff').innerHTML = cards.map((s, i) => `
      <button type="button" class="staff-card" data-id="${s.id}" aria-pressed="${state.staff === s.id}">
        <div class="plate ${s.id === 'any' ? '' : plates[(i - 1) % plates.length]}"><small>${s.id === 'any' ? 'Any' : 'Chair'}</small><b>${s.id === 'any' ? '★ ★ ★' : esc(s.name.replace(/^Fauteuil\s+/i, '').toUpperCase())}</b><i>CF COIFFURE</i></div>
        <strong>${esc(s.name)}</strong><span>${esc(s.tagline)}</span>
      </button>`).join('');
  }

  $('#staff').addEventListener('click', (e) => {
    const b = e.target.closest('.staff-card');
    if (!b) return;
    state.staff = b.dataset.id;
    $$('.staff-card').forEach((c) => c.setAttribute('aria-pressed', c === b));
    invalidateSlot();
    renderTicket();
    refreshButtons();
  });

  /* -------------------------------------------------------- calendar */

  function dayOpen(date) {
    const wd = new Date(date + 'T12:00:00Z').getUTCDay();
    const max = CF.addDays(cfg.today, cfg.rules.maxDaysAhead);
    return date >= cfg.today && date <= max && (cfg.hours[wd] || []).length > 0;
  }

  function renderCalendar() {
    const [y, m] = state.month.split('-').map(Number);
    const first = `${state.month}-01`;
    const firstWd = (new Date(first + 'T12:00:00Z').getUTCDay() + 6) % 7; // lundi = 0
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const label = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(first + 'T12:00:00Z'));
    const minMonth = cfg.today.slice(0, 7);
    const maxMonth = CF.addDays(cfg.today, cfg.rules.maxDaysAhead).slice(0, 7);

    let cells = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => `<span class="dow">${d}</span>`).join('');
    for (let i = 0; i < firstWd; i++) cells += '<span></span>';
    for (let d = 1; d <= days; d++) {
      const date = `${state.month}-${String(d).padStart(2, '0')}`;
      const open = dayOpen(date);
      cells += `<button type="button" data-date="${date}" ${open ? '' : 'disabled'} class="${date === cfg.today ? 'today' : ''}"
        aria-pressed="${state.date === date}" aria-label="${CF.frDate(date)}${open ? '' : ' (indisponible)'}">${d}</button>`;
    }
    $('#calendar').innerHTML = `
      <div class="cal-head">
        <button type="button" data-month="-1" aria-label="Mois précédent" ${state.month <= minMonth ? 'disabled' : ''}>‹</button>
        <strong>${label}</strong>
        <button type="button" data-month="1" aria-label="Mois suivant" ${state.month >= maxMonth ? 'disabled' : ''}>›</button>
      </div>
      <div class="cal-grid">${cells}</div>`;
  }

  $('#calendar').addEventListener('click', (e) => {
    const mb = e.target.closest('[data-month]');
    if (mb) {
      const [y, m] = state.month.split('-').map(Number);
      const d = new Date(Date.UTC(y, m - 1 + Number(mb.dataset.month), 1));
      state.month = d.toISOString().slice(0, 7);
      return renderCalendar();
    }
    const db = e.target.closest('[data-date]');
    if (!db || db.disabled) return;
    selectDate(db.dataset.date);
  });

  function selectDate(date) {
    state.date = date;
    state.time = null;
    state.month = date.slice(0, 7);
    renderCalendar();
    renderTicket();
    refreshButtons();
    loadSlots(date);
  }

  async function fetchSlots(date) {
    const keyStr = [date, [...state.services].join(','), state.staff].join('|');
    if (slotCache.has(keyStr)) return slotCache.get(keyStr);
    const url = `/api/availability?date=${date}&services=${encodeURIComponent([...state.services].join(','))}&staff=${encodeURIComponent(state.staff)}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('slots');
    const { slots } = await r.json();
    slotCache.set(keyStr, slots);
    return slots;
  }

  async function loadSlots(date) {
    const box = $('#slots');
    $('#slots-head').textContent = CF.frDate(date);
    box.innerHTML = '<div class="slot-list">' + '<span class="skeleton"></span>'.repeat(8) + '</div>';
    try {
      const slots = await fetchSlots(date);
      if (state.date !== date) return;
      if (!slots.length) {
        box.innerHTML = '<div class="empty">Complet ce jour-là 😕<br>Essayez une autre date ou le bouton « Premier créneau libre ».</div>';
        return;
      }
      const groups = [['Matin', (t) => t < '12:00'], ['Après-midi', (t) => t >= '12:00' && t < '17:00'], ['Fin de journée', (t) => t >= '17:00']];
      box.innerHTML = groups.map(([name, f]) => {
        const list = slots.filter((s) => f(s.time));
        if (!list.length) return '';
        return `<div class="slot-group"><h4>${name}</h4><div class="slot-list">${list.map((s, i) =>
          `<button type="button" class="slot" style="animation-delay:${i * 25}ms" data-time="${s.time}" aria-pressed="${state.time === s.time}">${s.time.replace(':', 'h')}</button>`).join('')}</div></div>`;
      }).join('');
    } catch (_) {
      box.innerHTML = '<div class="alert">Impossible de charger les créneaux. Réessayez dans un instant.</div>';
    }
  }

  $('#slots').addEventListener('click', (e) => {
    const b = e.target.closest('.slot');
    if (!b) return;
    state.time = b.dataset.time;
    $$('.slot').forEach((s) => s.setAttribute('aria-pressed', s === b));
    renderTicket();
    refreshButtons();
  });

  $('#first-slot').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = 'Recherche…';
    try {
      for (let i = 0; i <= Math.min(cfg.rules.maxDaysAhead, 45); i++) {
        const date = CF.addDays(cfg.today, i);
        if (!dayOpen(date)) continue;
        const slots = await fetchSlots(date);
        if (slots.length) {
          selectDate(date);
          state.time = slots[0].time;
          await loadSlots(date);
          renderTicket();
          refreshButtons();
          return;
        }
      }
      $('#slots').innerHTML = '<div class="empty">Aucun créneau libre dans les prochaines semaines. Appelez-nous !</div>';
    } catch (_) {
      $('#slots').innerHTML = '<div class="alert">Recherche impossible pour le moment.</div>';
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });

  /* ---------------------------------------------------------- ticket */

  function renderTicket() {
    const sel = selection();
    $('#t-items').innerHTML = sel.items.length
      ? sel.items.map((s) => `<li><span>${esc(s.name)}</span><span>${CF.euro(s.price)}</span></li>`).join('')
      : '<li class="empty-t">Aucune prestation sélectionnée</li>';
    $('#t-dur').textContent = sel.duration ? CF.dur(sel.duration) : '—';
    $('#t-total').textContent = CF.euro(sel.price);
    const staff = cfg.staff.find((s) => s.id === state.staff);
    $('#t-staff').textContent = staff ? staff.name : 'Sans préférence';
    $('#t-date').textContent = state.date ? CF.frDate(state.date, { weekday: 'short', month: 'short' }) : '—';
    $('#t-time').textContent = state.time ? state.time.replace(':', 'h') : '—';
    const n = sel.items.length;
    $('#mbar').classList.toggle('show', n > 0 && !$('#wizard').hidden);
    $('#mb-info').textContent = n + ' prestation' + (n > 1 ? 's' : '') + ' · ' + CF.dur(sel.duration || 0)
      + (state.date && state.time ? ' · ' + CF.frDate(state.date, { weekday: 'short', month: 'short' }) + ' ' + state.time.replace(':', 'h') : '');
    $('#mb-total').textContent = CF.euro(sel.price);
  }

  /* ------------------------------------------------------------ form */

  const form = $('#form');
  try {
    const saved = JSON.parse(localStorage.getItem('cf-contact') || 'null');
    if (saved) ['name', 'phone', 'email'].forEach((k) => { if (saved[k]) form.elements[k].value = saved[k]; });
  } catch (_) { /* rien */ }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('#form-error');
    err.innerHTML = '';
    const data = Object.fromEntries(new FormData(form));
    const fail = (msg) => { err.innerHTML = `<div class="alert">${esc(msg)}</div>`; };
    if (data.name.trim().length < 2) return fail('Merci d’indiquer votre nom.');
    if (data.phone.replace(/\D/g, '').length < 9) return fail('Merci d’indiquer un numéro de téléphone valide.');
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) return fail('Adresse e-mail invalide.');
    if (!form.elements.consent.checked) return fail('Merci de cocher la case de consentement.');

    const btn = $('#submit');
    btn.disabled = true;
    btn.textContent = 'Réservation…';
    try {
      const r = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: [...state.services], staff: state.staff, date: state.date, time: state.time,
          name: data.name, phone: data.phone, email: data.email, note: data.note, website: data.website,
          consent: true,
          replace: state.replace ? { id: state.replace.id, token: state.replace.token } : undefined,
        }),
      });
      const res = await r.json().catch(() => ({}));
      if (r.status === 409) {
        slotCache.clear();
        state.time = null;
        go(2);
        $('#slots').insertAdjacentHTML('afterbegin', `<div class="alert">${esc(res.error)}</div>`);
        renderTicket();
        refreshButtons();
        return;
      }
      if (!r.ok) return fail(res.error || 'La réservation a échoué.');
      try { localStorage.setItem('cf-contact', JSON.stringify({ name: data.name, phone: data.phone, email: data.email })); } catch (_) { /* rien */ }
      showDone(res.booking, res.token, Boolean(data.email));
    } catch (_) {
      fail('Connexion impossible. Vérifiez votre réseau et réessayez.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Confirmer le rendez-vous ✓';
    }
  });

  /* ---------------------------------------------------- confirmation */

  function showDone(b, token, hasEmail) {
    const manageUrl = `${location.origin}/rdv.html?id=${encodeURIComponent(b.id)}&t=${encodeURIComponent(token)}`;
    if (state.replace) CF.mine.remove(state.replace.id);
    CF.mine.add({ id: b.id, token, date: b.date, time: b.time, label: b.services.map((s) => s.name).join(' + ') });

    $('#wizard').hidden = true;
    $('#stepper').hidden = true;
    $('#replace-banner').hidden = true;
    $('#done').hidden = false;
    $('#mbar').classList.remove('show');
    $('#d-code').textContent = b.id;
    $('#d-body').innerHTML = `
      <ul>${b.services.map((s) => `<li><span>${esc(s.name)}</span><span>${CF.euro(s.price)}</span></li>`).join('')}</ul>
      <div class="line"></div>
      <div class="row"><span>Date</span><span>${esc(CF.frDate(b.date))}</span></div>
      <div class="row"><span>Heure</span><span>${b.time.replace(':', 'h')} → ${b.end.replace(':', 'h')}</span></div>
      <div class="row"><span>Fauteuil</span><span>${esc(b.staffName)}</span></div>
      <div class="row"><span>Au nom de</span><span>${esc(b.name)}</span></div>
      <div class="line"></div>
      <div class="row"><span>Total indicatif</span><span class="total">${CF.euro(b.price)}</span></div>`;
    const cal = CF.calendar(Object.assign({ manageUrl }, b), cfg.salon.address);
    $('#d-gcal').href = cal.gcal;
    $('#d-ics').onclick = cal.downloadIcs;
    $('#d-manage').href = manageUrl;
    $('#d-mailnote').textContent = hasEmail
      ? 'Un e-mail de confirmation vous a été envoyé (si vous ne le voyez pas, regardez dans les indésirables). Gardez le lien « Gérer / annuler ».'
      : 'Conseil : gardez le lien « Gérer / annuler » (ou une capture de ce ticket) pour modifier votre rendez-vous.';
    scrollTo({ top: 0, behavior: 'smooth' });
    CF.confetti();
    renderMine();
  }

  /* ------------------------------------------------- mes rendez-vous */

  function renderMine() {
    const list = CF.mine.all().filter((e) => e.date >= cfg.today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    $('#mes-rdv').hidden = !list.length;
    $('#mine-list').innerHTML = list.map((e) => `
      <a class="mine-item" href="rdv.html?id=${encodeURIComponent(e.id)}&t=${encodeURIComponent(e.token)}">
        <span><strong>${esc(CF.frDate(e.date))} · ${e.time.replace(':', 'h')}</strong><br><small>${esc(e.label)} — ${esc(e.id)}</small></span>
        <span>→</span>
      </a>`).join('');
  }
})();
