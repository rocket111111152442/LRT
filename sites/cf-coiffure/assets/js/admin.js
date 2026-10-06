/* CF Coiffure — espace salon : agenda, saisie, annulation, indisponibilités. */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CF = window.CF;
  const esc = CF.esc;
  const KEY = 'cf-admin-key';
  const PX = 1.6; // pixels par minute dans la vue jour
  const STATUS = { confirmed: ['Prévu', '#12305c'], cancelled: ['Annulé', '#c8312b'], done: ['Venu', '#2f7d4f'], noshow: ['Pas venu', '#777'] };

  let cfg = null;
  let key = sessionStorage.getItem(KEY) || '';
  const state = { view: 'day', date: null, data: { bookings: [], blocks: [] } };

  const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const toHHMM = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  const weekday = (d) => new Date(d + 'T12:00:00Z').getUTCDay();
  const monday = (d) => CF.addDays(d, -((weekday(d) + 6) % 7));
  const multi = () => cfg.staff.length > 1;

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }

  async function api(method, body, qs = '') {
    const r = await fetch('/api/admin' + qs, {
      method,
      headers: Object.assign({ 'x-admin-key': key }, body ? { 'Content-Type': 'application/json' } : {}),
      body: body ? JSON.stringify(body) : undefined,
    });
    const res = await r.json().catch(() => ({}));
    if (r.status === 401) { logout(); throw new Error(res.error || 'Session expirée.'); }
    if (!r.ok) throw new Error(res.error || 'Erreur.');
    return res;
  }

  /* ------------------------------------------------------------- accès */

  $('#login').addEventListener('submit', async (e) => {
    e.preventDefault();
    key = e.target.pw.value;
    try {
      await api('GET', null, '?from=2000-01-01&days=1');
      sessionStorage.setItem(KEY, key);
      start();
    } catch (err) {
      $('#login-err').innerHTML = `<div class="alert">${esc(err.message)}</div>`;
    }
  });

  function logout() {
    sessionStorage.removeItem(KEY);
    key = '';
    $('#dash').hidden = true;
    $('#bar-actions').hidden = true;
    $('#login').hidden = false;
  }
  $('#logout').addEventListener('click', logout);

  async function start() {
    cfg = await CF.config();
    state.date = state.date || cfg.today;
    $('#login').hidden = true;
    $('#dash').hidden = false;
    $('#bar-actions').hidden = false;
    refresh();
  }
  if (key) start();

  /* ------------------------------------------------------- navigation */

  function range() {
    if (state.view === 'day') return { from: state.date, days: 1 };
    if (state.view === 'week') return { from: monday(state.date), days: 7 };
    return { from: state.date, days: 14 };
  }

  $('.toolbar').addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    const view = e.target.closest('[data-view]');
    if (nav) {
      const step = state.view === 'day' ? 1 : state.view === 'week' ? 7 : 14;
      state.date = Number(nav.dataset.nav) === 0 ? cfg.today : CF.addDays(state.date, Number(nav.dataset.nav) * step);
      refresh();
    }
    if (view) setView(view.dataset.view);
  });
  function setView(v) {
    state.view = v;
    $$('[data-view]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === v));
    refresh();
  }
  $('#pick').addEventListener('change', (e) => { if (e.target.value) { state.date = e.target.value; refresh(); } });

  async function refresh() {
    const { from, days } = range();
    $('#pick').value = state.date;
    const to = CF.addDays(from, days - 1);
    $('#title').textContent = days === 1 ? CF.frDate(from)
      : CF.frDate(from, { weekday: undefined, month: 'short' }) + ' → ' + CF.frDate(to, { weekday: undefined, month: 'short' });
    try {
      state.data = await api('GET', null, `?from=${from}&days=${days}`);
      render();
    } catch (err) {
      $('#view').innerHTML = `<div class="alert">${esc(err.message)}</div>`;
    }
  }
  setInterval(() => { if (key && cfg && !$('#modal').classList.contains('open') && !document.hidden) refresh(); }, 60000);

  /* ------------------------------------------------------------ rendu */

  const staffOf = (id) => cfg.staff.find((s) => s.id === id) || { name: id, color: '#888' };
  const isDefaultLabel = (b) => b.label === cfg.booking.label;

  function render() {
    const active = state.data.bookings.filter((b) => b.status !== 'cancelled');
    const { from, days } = range();
    let open = 0;
    for (let i = 0; i < days; i++) (cfg.hours[weekday(CF.addDays(from, i))] || []).forEach(([a, b]) => { open += (toMin(b) - toMin(a)) * cfg.staff.length; });
    const booked = active.reduce((n, b) => n + b.duration, 0);
    $('#kpis').innerHTML = `
      <div class="kpi"><strong>${active.length}</strong><span>rendez-vous</span></div>
      <div class="kpi"><strong>${open ? Math.round((booked / open) * 100) : 0} %</strong><span>du temps réservé</span></div>
      <div class="kpi"><strong>${state.data.bookings.length - active.length}</strong><span>annulation(s)</span></div>`;
    if (state.view === 'day') renderDay();
    else if (state.view === 'week') renderWeek();
    else renderList();
  }

  function evHtml(b, style = '') {
    return `<button class="ev ${b.status}" style="border-left-color:${staffOf(b.staff).color};${style}" data-id="${b.id}">
      <strong>${CF.h(b.time)} · ${esc(b.name)}</strong>${isDefaultLabel(b) ? esc(b.phone) : esc(b.label)}</button>`;
  }

  function renderDay() {
    const ranges = cfg.hours[weekday(state.date)] || [];
    const start = Math.min(...ranges.map(([a]) => toMin(a)), 9 * 60);
    const end = Math.max(...ranges.map(([, b]) => toMin(b)), 19 * 60);
    const y = (m) => (m - start) * PX;
    const height = y(end);
    let times = '';
    for (let m = start; m <= end; m += 60) times += `<span style="top:${y(m)}px">${CF.h(toHHMM(m))}</span>`;

    const closed = [];
    let cursor = start;
    ranges.map(([a, b]) => [toMin(a), toMin(b)]).sort((p, q) => p[0] - q[0]).forEach(([a, b]) => {
      if (a > cursor) closed.push([cursor, a]);
      cursor = Math.max(cursor, b);
    });
    if (cursor < end) closed.push([cursor, end]);
    const closedHtml = closed.map(([a, b]) => `<div class="closed" style="top:${y(a)}px;height:${(b - a) * PX}px"></div>`).join('');

    const now = new Date(new Date().toLocaleString('en-US', { timeZone: cfg.salon.timezone }));
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const nowLine = state.date === cfg.today && nowMin >= start && nowMin <= end ? `<div class="now-line" style="top:${y(nowMin)}px"></div>` : '';

    const cols = cfg.staff.map((s) => {
      const evs = state.data.bookings.filter((b) => b.staff === s.id && b.status !== 'cancelled')
        .map((b) => evHtml(b, `top:${y(toMin(b.time))}px;height:${Math.max(b.duration * PX - 2, 22)}px`)).join('');
      const blocks = state.data.blocks.filter((k) => k.staff === s.id || k.staff === 'all').map((k) =>
        `<button class="ev block" data-block="${k.id}" data-date="${k.date}" style="top:${y(toMin(k.start))}px;height:${Math.max((toMin(k.end) - toMin(k.start)) * PX - 2, 22)}px">
          <strong>Bloqué ${CF.h(k.start)} – ${CF.h(k.end)}</strong>${esc(k.reason || '')}</button>`).join('');
      return `<div class="ag-col" style="height:${height}px">${closedHtml}${blocks}${evs}${nowLine}</div>`;
    }).join('');

    $('#view').innerHTML = `
      <div class="agenda" style="--hour:${60 * PX}px">
        <div class="agenda-inner" style="grid-template-columns:60px repeat(${cfg.staff.length}, 1fr)">
          ${multi() ? '<div class="ag-head"></div>' + cfg.staff.map((s) => `<div class="ag-head" style="--c:${s.color}">${esc(s.name)}</div>`).join('') : ''}
          <div class="ag-times" style="height:${height}px">${times}</div>
          ${cols}
        </div>
      </div>
      ${ranges.length ? '' : '<p class="alert info">Le salon est normalement fermé ce jour-là.</p>'}`;
    if (nowLine) $('.agenda').scrollTop = Math.max(y(nowMin) - 120, 0);
  }

  function renderWeek() {
    const from = monday(state.date);
    $('#view').innerHTML = `<div class="week">${Array.from({ length: 7 }, (_, i) => {
      const d = CF.addDays(from, i);
      const list = state.data.bookings.filter((b) => b.date === d && b.status !== 'cancelled');
      const blocks = state.data.blocks.filter((k) => k.date === d);
      return `<div class="day ${d === cfg.today ? 'today' : ''}">
        <h4 data-day="${d}"><span>${esc(CF.frDate(d, { month: 'short' }))}</span><span>${list.length}</span></h4>
        ${blocks.map((k) => `<button class="ev block" data-block="${k.id}" data-date="${k.date}"><strong>Bloqué ${CF.h(k.start)}–${CF.h(k.end)}</strong>${esc(k.reason || '')}</button>`).join('')}
        ${list.map((b) => evHtml(b)).join('') || `<small class="muted">${(cfg.hours[weekday(d)] || []).length ? 'Aucun rendez-vous' : 'Fermé'}</small>`}
      </div>`;
    }).join('')}</div>`;
  }

  function renderList() {
    const rows = state.data.bookings;
    $('#view').innerHTML = rows.length ? `
      <div style="overflow-x:auto"><table class="table">
        <thead><tr><th>Date</th><th>Heure</th><th>Nom</th><th>Téléphone</th><th>Durée</th><th>Statut</th></tr></thead>
        <tbody>${rows.map((b) => {
          const [label, color] = STATUS[b.status];
          return `<tr data-id="${b.id}"><td>${esc(CF.frDate(b.date, { weekday: 'short', month: 'short' }))}</td><td>${CF.h(b.time)}</td><td>${esc(b.name)}</td>
            <td>${esc(b.phone)}</td><td>${b.duration} min${isDefaultLabel(b) ? '' : ' · ' + esc(b.label)}</td><td><span class="pill" style="background:${color}">${label}</span></td></tr>`;
        }).join('')}</tbody>
      </table></div>` : '<div class="empty">Aucun rendez-vous sur les 14 prochains jours.</div>';
  }

  /* ------------------------------------------------------------ fiches */

  $('#view').addEventListener('click', (e) => {
    const day = e.target.closest('[data-day]');
    if (day) { state.date = day.dataset.day; return setView('day'); }
    const blk = e.target.closest('[data-block]');
    if (blk) return openBlock(blk.dataset.date, blk.dataset.block);
    const ev = e.target.closest('[data-id]');
    if (ev) openBooking(ev.dataset.id);
  });

  const modal = $('#modal');
  const card = $('#modal-card');
  function openModal(html) { card.innerHTML = html; card.onclick = null; modal.classList.add('open'); }
  function closeModal() { modal.classList.remove('open'); }
  modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  function openBooking(id) {
    const b = state.data.bookings.find((x) => x.id === id);
    if (!b) return;
    const [label, color] = STATUS[b.status];
    openModal(`
      <h3>${esc(b.name)}</h3>
      <dl>
        <dt>Statut</dt><dd><span class="pill" style="background:${color}">${label}</span></dd>
        <dt>Quand</dt><dd>${esc(CF.frDate(b.date))}, ${CF.h(b.time)} → ${CF.h(b.end)}</dd>
        ${isDefaultLabel(b) ? '' : `<dt>Prestation</dt><dd>${esc(b.label)}</dd>`}
        ${multi() ? `<dt>Poste</dt><dd>${esc(staffOf(b.staff).name)}</dd>` : ''}
        <dt>Téléphone</dt><dd><a href="tel:${esc(b.phone.replace(/[^\d+]/g, ''))}">${esc(b.phone)}</a></dd>
        ${b.note ? `<dt>Note</dt><dd>${esc(b.note)}</dd>` : ''}
        <dt>Pris</dt><dd>${b.source === 'salon' ? 'au salon' : 'en ligne'} · ${esc(b.id)}</dd>
      </dl>
      <div class="field"><label for="m-note">Note interne</label><textarea id="m-note" rows="2" maxlength="400">${esc(b.salonNote || '')}</textarea></div>
      <div class="modal-actions">
        ${b.status !== 'cancelled' ? `
          <button class="btn small" data-act="status" data-v="done">Venu</button>
          <button class="btn small outline" data-act="status" data-v="noshow">Pas venu</button>
          ${b.status !== 'confirmed' ? '<button class="btn small outline" data-act="status" data-v="confirmed">Remettre prévu</button>' : ''}
          <button class="btn small outline" data-act="cancel">Annuler</button>` : ''}
        <button class="btn small outline" data-act="note">Enregistrer la note</button>
        <button class="btn small outline" data-close>Fermer</button>
      </div>`);
    card.onclick = async (e) => {
      const a = e.target.closest('[data-act]');
      if (!a) return;
      if (a.dataset.act === 'cancel' && !confirm('Annuler ce rendez-vous et libérer le créneau ?')) return;
      a.disabled = true;
      try {
        if (a.dataset.act === 'status') await api('POST', { action: 'status', id, status: a.dataset.v });
        if (a.dataset.act === 'note') await api('POST', { action: 'note', id, salonNote: $('#m-note').value });
        if (a.dataset.act === 'cancel') await api('POST', { action: 'cancel', id });
        toast('Enregistré');
        closeModal();
        refresh();
      } catch (err) { toast(err.message); a.disabled = false; }
    };
  }

  function openBlock(date, id) {
    const k = state.data.blocks.find((x) => x.id === id);
    if (!k) return;
    openModal(`
      <h3>Créneau bloqué</h3>
      <dl><dt>Date</dt><dd>${esc(CF.frDate(date))}</dd><dt>Heures</dt><dd>${CF.h(k.start)} → ${CF.h(k.end)}</dd><dt>Motif</dt><dd>${esc(k.reason || '—')}</dd></dl>
      <div class="modal-actions"><button class="btn small" id="unblock">Débloquer</button><button class="btn small outline" data-close>Fermer</button></div>`);
    $('#unblock').onclick = async () => {
      try { await api('POST', { action: 'unblock', date, id }); toast('Créneau débloqué'); closeModal(); refresh(); } catch (err) { toast(err.message); }
    };
  }

  /* ------------------------------------------------- saisir / bloquer */

  const staffField = (withAll) => (multi()
    ? `<div class="field"><label>Poste</label><select name="staff">${withAll ? '<option value="all">Tous</option>' : '<option value="any">Premier libre</option>'}${cfg.staff.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>`
    : `<input type="hidden" name="staff" value="${withAll ? 'all' : 'any'}">`);

  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open]');
    if (!o || !cfg) return;
    if (o.dataset.open === 'create') openCreate(); else openBlockForm();
  });

  function openCreate() {
    const durations = [cfg.booking.duration, 15, 30, 45, 60, 90, 120, 150, 180].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
    openModal(`
      <h3>Nouveau rendez-vous</h3>
      <form id="create">
        <div class="form-row">
          <div class="field"><label>Date</label><input type="date" name="date" value="${state.date}" required></div>
          <div class="field"><label>Heure</label><input type="time" name="time" step="300" required></div>
        </div>
        <div class="form-row">
          <div class="field"><label>Durée</label><select name="duration">${durations.map((d) => `<option value="${d}" ${d === cfg.booking.duration ? 'selected' : ''}>${d} min</option>`).join('')}</select></div>
          <div class="field"><label>Prestation (facultatif)</label><input name="label" maxlength="80" placeholder="Couleur, mèches…"></div>
        </div>
        ${staffField(false)}
        <div class="form-row">
          <div class="field"><label>Nom</label><input name="name" required maxlength="80"></div>
          <div class="field"><label>Téléphone</label><input name="phone" type="tel" maxlength="20"></div>
        </div>
        <div class="modal-actions"><button class="btn small">Enregistrer</button><button type="button" class="btn small outline" data-close>Annuler</button></div>
      </form>`);
    $('#create').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      if (toMin(f.time.value) % cfg.step) return toast(`L’heure doit être un multiple de ${cfg.step} minutes.`);
      try {
        await api('POST', { action: 'create', date: f.date.value, time: f.time.value, duration: Number(f.duration.value), label: f.label.value, staff: f.staff.value, name: f.name.value, phone: f.phone.value });
        toast('Rendez-vous enregistré');
        closeModal();
        state.date = f.date.value;
        refresh();
      } catch (err) { toast(err.message); }
    });
  }

  function openBlockForm() {
    openModal(`
      <h3>Bloquer des créneaux</h3>
      <p class="muted" style="margin-top:-6px">Congés, pause, rendez-vous perso… Les rendez-vous déjà pris restent en place.</p>
      <form id="blockf">
        <div class="form-row">
          <div class="field"><label>Du</label><input type="date" name="date" value="${state.date}" required></div>
          <div class="field"><label>Au (inclus)</label><input type="date" name="to" value="${state.date}" required></div>
        </div>
        <label class="check"><input type="checkbox" name="allday" checked> Journée(s) entière(s)</label>
        <div class="form-row">
          <div class="field"><label>De</label><input type="time" name="start" value="12:00" step="300"></div>
          <div class="field"><label>À</label><input type="time" name="end" value="14:00" step="300"></div>
        </div>
        ${staffField(true)}
        <div class="field"><label>Motif (visible seulement ici)</label><input name="reason" maxlength="120" placeholder="Congés…"></div>
        <div class="modal-actions"><button class="btn small">Bloquer</button><button type="button" class="btn small outline" data-close>Annuler</button></div>
      </form>`);
    $('#blockf').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      if (f.to.value < f.date.value) return toast('La date de fin est avant la date de début.');
      const n = Math.round((new Date(f.to.value) - new Date(f.date.value)) / 86400000) + 1;
      if (n > 31) return toast('31 jours maximum à la fois.');
      const btn = $('button', f);
      btn.disabled = true;
      try {
        for (let i = 0; i < n; i++) {
          const d = CF.addDays(f.date.value, i);
          const ranges = cfg.hours[weekday(d)] || [];
          if (f.allday.checked && !ranges.length) continue;
          const start = f.allday.checked ? ranges.reduce((m, r) => (r[0] < m ? r[0] : m), '23:59') : f.start.value;
          const end = f.allday.checked ? ranges.reduce((m, r) => (r[1] > m ? r[1] : m), '00:00') : f.end.value;
          await api('POST', { action: 'block', date: d, start, end, staff: f.staff.value, reason: f.reason.value });
        }
        toast('Créneaux bloqués');
        closeModal();
        refresh();
      } catch (err) { toast(err.message); btn.disabled = false; }
    });
  }

  /* ------------------------------------------------------------ export */

  $('#export').addEventListener('click', () => {
    const rows = [['Code', 'Date', 'Heure', 'Fin', 'Nom', 'Téléphone', 'Prestation', 'Statut', 'Pris']]
      .concat(state.data.bookings.map((b) => [b.id, b.date, b.time, b.end, b.name, b.phone, b.label, STATUS[b.status][0], b.source === 'salon' ? 'salon' : 'en ligne']));
    const csv = '﻿' + rows.map((r) => r.map((v) => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `rdv-cf-coiffure-${range().from}.csv`;
    a.click();
  });
})();
