/* CF Coiffure — consulter ou annuler son rendez-vous (rdv.html). */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const CF = window.CF;
  const esc = CF.esc;
  const p = new URLSearchParams(location.search);
  const id = p.get('id');
  const token = p.get('t');
  const box = $('#rdv');

  if (!id || !token) {
    box.innerHTML = '<h1>Lien incomplet</h1><p class="muted">Utilisez le lien affiché après votre réservation.</p>';
    return;
  }

  Promise.all([CF.config(), fetch(`/api/booking?id=${encodeURIComponent(id)}&t=${encodeURIComponent(token)}`).then(async (r) => {
    const res = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(res.error || 'Rendez-vous introuvable.');
    return res.booking;
  })]).then(([cfg, b]) => render(cfg, b)).catch((err) => {
    box.innerHTML = `<h1>Rendez-vous introuvable</h1><p class="muted">${esc(err.message)}</p><p><a class="btn" href="/reserver.html">Prendre rendez-vous</a></p>`;
  });

  function render(cfg, b) {
    const cancelled = b.status === 'cancelled';
    const past = b.date < cfg.today;
    if (cancelled) CF.mine.remove(b.id);
    box.innerHTML = `
      <h1>${cancelled ? 'Rendez-vous annulé' : 'Votre rendez-vous'}</h1>
      <div class="ticket" style="margin-top:20px">
        <p class="when" style="${cancelled ? 'text-decoration:line-through;opacity:.6' : ''}">${esc(CF.frDate(b.date))}<br>à ${CF.h(b.time)}</p>
        <dl>
          <dt>Nom</dt><dd>${esc(b.name)}</dd>
          <dt>Téléphone</dt><dd>${esc(b.phone)}</dd>
          <dt>Adresse</dt><dd>${esc(cfg.salon.address)}</dd>
          <dt>Code</dt><dd>${esc(b.id)}</dd>
        </dl>
      </div>
      <div class="actions">
        ${cancelled || past ? '<a class="btn" href="/reserver.html">Prendre un autre rendez-vous</a>'
          : b.canCancel ? '<button class="btn" id="cancel">Annuler le rendez-vous</button>'
          : `<p class="alert info">Le rendez-vous est dans moins de ${cfg.rules.cancelNoticeHours} h : pour l'annuler, prévenez directement le salon.</p>`}
      </div>
      <div id="msg" role="alert"></div>`;

    const btn = $('#cancel');
    if (btn) btn.addEventListener('click', async () => {
      if (!confirm('Annuler ce rendez-vous ?')) return;
      btn.disabled = true;
      try {
        const r = await fetch('/api/booking', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, token, action: 'cancel' }),
        });
        const res = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(res.error || 'Annulation impossible.');
        render(cfg, res.booking);
      } catch (err) {
        $('#msg').innerHTML = `<div class="alert">${esc(err.message)}</div>`;
        btn.disabled = false;
      }
    });
  }
})();
