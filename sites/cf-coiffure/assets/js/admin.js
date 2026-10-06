/* CF Coiffure — espace salon : agenda, création, annulation, indisponibilités. */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CF = window.CF;
  const esc = CF.esc;
  const KEY = 'cf-admin-key';
  const SLOT_PX = 22; // hauteur de 15 min dans la vue jour
  const STATUS = { confirmed: ['Confirmé', '#7fd1c4'], cancelled: ['Annulé', '#ff7b7b'], done: ['Honoré', '#f2c230'], noshow: ['Absent', '#aaa'] };

  let cfg = null;
  let key = sessionStorage.getItem(KEY) || '';
  const state = { view: 'day', date: null, data: { bookings: [], blocks: [] } };

  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const toHHMM = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  const weekday = (d) => new Date(d + 'T12:00:00Z').getUTCDay();
  const monday = (d) => CF.addDays(d, -((weekday(d) + 6) % 7));

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
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

  /* ------------------------------------------------------------- auth */

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
      const n = Number(nav.dataset.nav);
      const step = state.view === 'day' ? 1 : state.view === 'week' ? 7 : 14;
      state.date = n === 0 ? cfg.today : CF.addDays(state.date, n * step);
      refresh();
    }
    if (view) {
      state.view = view.dataset.view;
      $$('[data-view]').forEach((b) => b.setAttribute('aria-pressed', b === view));
      refresh();
    }
  });
  $('#pick').addEventListener('change', (e) => { if (e.target.value) { state.date = e.target.value; refresh(); } });

  async function refresh() {
    const { from, days } = range();
    $('#pick').value = state.date;
    const to = CF.addDays(from, days - 1);
    $('#title').textContent = days === 1 ? CF.frDate(from, { year: 'numeric' })
      : CF.frDate(from, { weekday: undefined, month: 'short' }) + ' → ' + CF.frDate(to, { weekday: undefined, month: 'short', year: 'numeric' });
    try {
      state.data = await api('GET', null, `?from=${from}&days=${days}`);
      render();
    } catch (err) {
      $('#view').innerHTML = `<div class="alert">${esc(err.message)}</div>`;
    }
  }
  setInterval(() => { if (key && !$('#modal').classList.contains('open') && !document.hidden) refresh(); }, 60000);

  /* ----------------------------------------------------------- render */

  function staffOf(id) { return cfg.staff.find((s) => s.id === id) || { name: id, color: '#888' }; }

  function render() {
    const active = state.data.bookings.filter((b) => b.status !== 'cancelled');
    const revenue = active.filter((b) => b.status !== 'noshow').reduce((n, b) => n + b.price, 0);
    const { from, days } = range();
    let open = 0;
    for (let i = 0; i < days; i++) {
      (cfg.hours[weekday(CF.addDays(from, i))] || []).forEach(([a, b]) => { open += (toMin(b) - toMin(a)) * cfg.staff.length; });
    }
    const booked = active.reduce((n, b) => n + b.duration, 0);
    $('#kpis').innerHTML = `
      <div class="kpi"><strong>${active.length}</strong><span>Rendez-vous</span></div>
      <div class="kpi"><strong>${CF.euro(revenue)}</strong><span>CA prévu</span></div>
      <div class="kpi"><strong>${open ? Math.round((booked / open) * 100) : 0} %</strong><span>Remplissage</span></div>
      <div class="kpi"><strong>${state.data.bookings.filter((b) => b.status === 'cancelled').length}</strong><span>Annulations</span></div>`;

    if (state.view === 'day') renderDay();
    else if (state.view === 'week') renderWeek();
    else renderList();
  }

  function evHtml(b, style = '') {
    const s = staffOf(b.staff);
    return `<button class="ev ${b.status}" style="--c:${s.color};${style}" data-id="${b.id}">
      <strong>${b.time.replace(':', 'h')} · ${esc(b.name)}</strong>${esc(b.services.map((x) => x.name).join(' + '))}${b.source === 'salon' ? ' · <em>salon</em>' : ''}
    </button>`;
  }

  function renderDay() {
    const ranges = cfg.hours[weekday(state.date)] || [];
    const start = Math.min(...ranges.map(([a]) => toMin(a)), 9 * 60);
    const end = Math.max(...ranges.map(([, b]) => toMin(b)), 19 * 60);
    const height = ((end - start) / 15) * SLOT_PX;
    const y = (t) => ((toMin(t) - start) / 15) * SLOT_PX;
    const cols = cfg.staff;

    let times = '';
    for (let m = start; m <= end; m += 60) times += `<span style="top:${((m - start) / 15) * SLOT_PX}px">${toHHMM(m)}</span>`;

    // zones fermées (hors horaires)
    const closed = [];
    let cursor = start;
    ranges.map(([a, b]) => [toMin(a), toMin(b)]).sort((p, q) => p[0] - q[0]).forEach(([a, b]) => {
      if (a > cursor) closed.push([cursor, a]);
      cursor = Math.max(cursor, b);
    });
    if (cursor < end) closed.push([cursor, end]);
    const closedHtml = closed.map(([a, b]) => `<div class="closed" style="top:${((a - start) / 15) * SLOT_PX}px;height:${((b - a) / 15) * SLOT_PX}px"></div>`).join('');

    const now = new Date(new Date().toLocaleString('en-US', { timeZone: cfg.salon.timezone }));
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const nowLine = state.date === cfg.today && nowMin >= start && nowMin <= end ? `<div class="now-line" style="top:${((nowMin - start) / 15) * SLOT_PX}px"></div>` : '';

    const colHtml = cols.map((s) => {
      const evs = state.data.bookings.filter((b) => b.staff === s.id && b.status !== 'cancelled')
        .map((b) => evHtml(b, `top:${y(b.time)}px;height:${Math.max((b.duration / 15) * SLOT_PX - 3, 20)}px`)).join('');
      const blocks = state.data.blocks.filter((k) => k.staff === s.id || k.staff === 'all').map((k) =>
        `<button class="ev block" data-block="${k.id}" data-date="${k.date}" style="top:${y(k.start)}px;height:${Math.max(((toMin(k.end) - toMin(k.start)) / 15) * SLOT_PX - 3, 20)}px">
          <strong>⛔ ${esc(k.reason || 'Indisponible')}</strong>${k.start.replace(':', 'h')} – ${k.end.replace(':', 'h')}</button>`).join('');
      return `<div class="ag-col" style="height:${height}px">${closedHtml}${blocks}${evs}${nowLine}</div>`;
    }).join('');

    $('#view').innerHTML = `
      <div class="agenda" style="--slot:${SLOT_PX}px">
        <div class="agenda-inner" style="grid-template-columns:60px repeat(${cols.length}, 1fr)">
          <div class="ag-head" style="--c:transparent"></div>
          ${cols.map((s) => `<div class="ag-head" style="--c:${s.color}">${esc(s.name)}</div>`).join('')}
          <div class="ag-times" style="height:${height}px">${times}</div>
          ${colHtml}
        </div>
      </div>
      ${ranges.length ? '' : '<p class="alert info">Le salon est normalement fermé ce jour-là.</p>'}`;
    // place la vue sur l'heure courante
    if (nowLine) $('.agenda').scrollTop = Math.max(((nowMin - start) / 15) * SLOT_PX - 120, 0);
  }

  function renderWeek() {
    const from = monday(state.date);
    $('#view').innerHTML = `<div class="week">${Array.from({ length: 7 }, (_, i) => {
      const d = CF.addDays(from, i);
      const list = state.data.bookings.filter((b) => b.date === d && b.status !== 'cancelled');
      const blocks = state.data.blocks.filter((k) => k.date === d);
      return `<div class="day ${d === cfg.today ? 'today' : ''}">
        <h4 data-day="${d}"><span>${esc(CF.frDate(d, { month: 'short' }))}</span><span>${list.length}</span></h4>
        ${blocks.map((k) => `<button class="ev block" data-block="${k.id}" data-date="${k.date}"><strong>⛔ ${k.start}–${k.end}</strong>${esc(k.reason || '')} (${k.staff === 'all' ? 'tous' : esc(staffOf(k.staff).name)})</button>`).join('')}
        ${list.map((b) => evHtml(b)).join('') || ((cfg.hours[weekday(d)] || []).length ? '<small style="opacity:.5">Aucun RDV</small>' : '<small style="opacity:.5">Fermé</small>')}
      </div>`;
    }).join('')}</div>`;
  }

  function renderList() {
    const rows = state.data.bookings;
    $('#view').innerHTML = rows.length ? `
      <div style="overflow-x:auto"><table class="table">
        <thead><tr><th>Date</th><th>Heure</th><th>Client</th><th>Téléphone</th><th>Prestations</th><th>Fauteuil</th><th>Prix</th><th>Statut</th></tr></thead>
        <tbody>${rows.map((b) => {
          const [label, color] = STATUS[b.status];
          return `<tr data-id="${b.id}"><td>${esc(CF.frDate(b.date, { weekday: 'short', month: 'short' }))}</td><td>${b.time}</td><td>${esc(b.name)}</td>
            <td>${esc(b.phone)}</td><td>${esc(b.services.map((x) => x.name).join(' + '))}</td><td>${esc(staffOf(b.staff).name)}</td>
            <td>${CF.euro(b.price)}</td><td><span class="pill" style="background:${color}">${label}</span></td></tr>`;
        }).join('')}</tbody>
      </table></div>` : '<div class="empty">Aucun rendez-vous sur ces 14 jours.</div>';
  }

  /* ----------------------------------------------------------- détails */

  $('#view').addEventListener('click', (e) => {
    const day = e.target.closest('[data-day]');
    if (day) { state.date = day.dataset.day; state.view = 'day'; $$('[data-view]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === 'day')); return refresh(); }
    const blk = e.target.closest('[data-block]');
    if (blk) return openBlock(blk.dataset.date, blk.dataset.block);
    const ev = e.target.closest('[data-id]');
    if (ev) openBooking(ev.dataset.id);
  });

  const modal = $('#modal');
  const card = $('#modal-card');
  function openModal(html) { card.innerHTML = html; modal.classList.add('open'); const f = $('input, select, button', card); if (f) f.focus(); }
  function closeModal() { modal.classList.remove('open'); }
  modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  function openBooking(id) {
    const b = state.data.bookings.find((x) => x.id === id);
    if (!b) return;
    const [label, color] = STATUS[b.status];
    const tel = b.phone.replace(/[^\d+]/g, '');
    openModal(`
      <h3>${esc(b.name)}</h3>
      <dl>
        <dt>Statut</dt><dd><span class="pill" style="background:${color}">${label}</span></dd>
        <dt>Quand</dt><dd>${esc(CF.frDate(b.date, { year: 'numeric' }))}, ${b.time} → ${b.end}</dd>
        <dt>Fauteuil</dt><dd>${esc(staffOf(b.staff).name)}${b.staffRequested === 'any' ? ' <small>(sans préférence)</small>' : ''}</dd>
        <dt>Prestations</dt><dd>${b.services.map((s) => esc(s.name) + ' — ' + CF.euro(s.price)).join('<br>')}</dd>
        <dt>Total</dt><dd><strong>${CF.euro(b.price)}</strong> · ${CF.dur(b.duration)}</dd>
        <dt>Téléphone</dt><dd><a href="tel:${esc(tel)}">${esc(b.phone)}</a></dd>
        ${b.email ? `<dt>E-mail</dt><dd><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></dd>` : ''}
        ${b.note ? `<dt>Message</dt><dd>${esc(b.note)}</dd>` : ''}
        <dt>Code</dt><dd>${esc(b.id)} · ${b.source === 'salon' ? 'saisi au salon' : 'réservé en ligne'}</dd>
        <dt>Historique</dt><dd><small>${(b.history || []).map((h) => esc(new Date(h.at).toLocaleString('fr-FR')) + ' — ' + esc(h.what)).join('<br>')}</small></dd>
      </dl>
      <div class="field"><label for="m-note">Note interne</label><textarea id="m-note" maxlength="400">${esc(b.salonNote || '')}</textarea></div>
      <div class="modal-actions">
        ${b.status !== 'cancelled' ? `
          <button class="btn small" data-act="status" data-v="done">✓ Honoré</button>
          <button class="btn small ghost" data-act="status" data-v="noshow">Absent</button>
          ${b.status !== 'confirmed' ? '<button class="btn small ghost" data-act="status" data-v="confirmed">Remettre en confirmé</button>' : ''}
          <button class="btn small blue" data-act="cancel">Annuler le RDV</button>` : ''}
        <button class="btn small cream" data-act="note">Enregistrer la note</button>
        <button class="btn small ghost" data-close>Fermer</button>
      </div>`);
    card.onclick = async (e) => {
      const a = e.target.closest('[data-act]');
      if (!a) return;
      a.disabled = true;
      try {
        if (a.dataset.act === 'status') await api('POST', { action: 'status', id, status: a.dataset.v });
        if (a.dataset.act === 'note') await api('POST', { action: 'note', id, salonNote: $('#m-note').value });
        if (a.dataset.act === 'cancel') {
          if (!confirm('Annuler ce rendez-vous et libérer le créneau ?')) { a.disabled = false; return; }
          const notify = b.email ? confirm('Prévenir le client par e-mail ?') : false;
          await api('POST', { action: 'cancel', id, notify });
        }
        toast('Enregistré ✓');
        closeModal();
        refresh();
      } catch (err) { toast(err.message); a.disabled = false; }
    };
  }

  function openBlock(date, id) {
    const k = state.data.blocks.find((x) => x.id === id);
    if (!k) return;
    openModal(`
      <h3>Indisponibilité</h3>
      <dl><dt>Date</dt><dd>${esc(CF.frDate(date, { year: 'numeric' }))}</dd><dt>Plage</dt><dd>${k.start} → ${k.end}</dd>
      <dt>Fauteuil</dt><dd>${k.staff === 'all' ? 'Tout le salon' : esc(staffOf(k.staff).name)}</dd><dt>Motif</dt><dd>${esc(k.reason || '—')}</dd></dl>
      <div class="modal-actions"><button class="btn small" id="unblock">Supprimer (rouvrir les créneaux)</button><button class="btn small ghost" data-close>Fermer</button></div>`);
    $('#unblock').onclick = async () => {
      try { await api('POST', { action: 'unblock', date, id }); toast('Créneaux rouverts ✓'); closeModal(); refresh(); } catch (err) { toast(err.message); }
    };
  }

  /* ---------------------------------------------- créer / bloquer */

  const staffOptions = (withAll) => (withAll ? '<option value="all">Tout le salon</option>' : '<option value="any">Premier libre</option>')
    + cfg.staff.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('');

  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open]');
    if (!o || !cfg) return;
    card.onclick = null;
    if (o.dataset.open === 'create') openCreate();
    else openBlockForm();
  });

  function openCreate() {
    openModal(`
      <h3>Nouveau rendez-vous</h3>
      <form id="create" class="form-grid">
        <div class="field full"><label>Prestations</label><div class="svc-checks">
          ${cfg.services.map((s) => `<label><input type="checkbox" name="svc" value="${s.id}"> ${esc(s.name)} <small style="opacity:.6">${CF.dur(s.duration)}</small></label>`).join('')}
        </div></div>
        <div class="field"><label>Date</label><input type="date" name="date" value="${state.date}" required></div>
        <div class="field"><label>Heure</label><input type="time" name="time" step="900" required></div>
        <div class="field full"><label>Fauteuil</label><select name="staff">${staffOptions(false)}</select></div>
        <div class="field"><label>Nom du client</label><input name="name" required maxlength="80"></div>
        <div class="field"><label>Téléphone</label><input name="phone" type="tel" maxlength="20"></div>
        <div class="field full"><label>E-mail</label><input name="email" type="email" maxlength="160"></div>
        <div class="field full"><label>Note</label><input name="note" maxlength="400"></div>
        <div class="field full"><div class="modal-actions"><button class="btn small">Créer</button><button type="button" class="btn small ghost" data-close>Annuler</button></div></div>
      </form>`);
    $('#create').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      const services = $$('input[name="svc"]:checked', f).map((i) => i.value);
      if (!services.length) return toast('Choisissez au moins une prestation.');
      const time = f.time.value;
      if (toMin(time) % cfg.step) return toast(`L’heure doit tomber sur un quart d’heure.`);
      try {
        await api('POST', { action: 'create', services, date: f.date.value, time, staff: f.staff.value, name: f.name.value, phone: f.phone.value, email: f.email.value, note: f.note.value });
        toast('Rendez-vous créé ✓');
        closeModal();
        state.date = f.date.value;
        refresh();
      } catch (err) { toast(err.message); }
    });
  }

  function openBlockForm() {
    openModal(`
      <h3>Bloquer des créneaux</h3>
      <p class="hint" style="margin-top:-6px">Congés, pause, formation… Les rendez-vous déjà pris ne sont pas touchés.</p>
      <form id="blockf" class="form-grid">
        <div class="field"><label>Du</label><input type="date" name="date" value="${state.date}" required></div>
        <div class="field"><label>Au (inclus)</label><input type="date" name="to" value="${state.date}" required></div>
        <label class="check field full"><input type="checkbox" name="allday" checked> Journée(s) entière(s)</label>
        <div class="field"><label>De</label><input type="time" name="start" value="12:00" step="900"></div>
        <div class="field"><label>À</label><input type="time" name="end" value="14:00" step="900"></div>
        <div class="field full"><label>Fauteuil</label><select name="staff">${staffOptions(true)}</select></div>
        <div class="field full"><label>Motif (visible uniquement par le salon)</label><input name="reason" maxlength="120" placeholder="Congés, formation…"></div>
        <div class="field full"><div class="modal-actions"><button class="btn small">Bloquer</button><button type="button" class="btn small ghost" data-close>Annuler</button></div></div>
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
        toast('Créneaux bloqués ✓');
        closeModal();
        refresh();
      } catch (err) { toast(err.message); btn.disabled = false; }
    });
  }

  /* ------------------------------------------------------------ export */

  $('#export').addEventListener('click', () => {
    const rows = [['Code', 'Date', 'Heure', 'Fin', 'Client', 'Téléphone', 'E-mail', 'Prestations', 'Fauteuil', 'Prix', 'Statut', 'Source', 'Message']]
      .concat(state.data.bookings.map((b) => [b.id, b.date, b.time, b.end, b.name, b.phone, b.email, b.services.map((s) => s.name).join(' + '), staffOf(b.staff).name, b.price, STATUS[b.status][0], b.source, b.note]));
    const csv = '﻿' + rows.map((r) => r.map((v) => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `rdv-cf-coiffure-${range().from}.csv`;
    a.click();
  });
})();
