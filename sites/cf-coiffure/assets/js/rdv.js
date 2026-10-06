/* CF Coiffure — consultation, déplacement et annulation d'un rendez-vous (rdv.html). */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const CF = window.CF;
  const esc = CF.esc;
  const p = new URLSearchParams(location.search);
  const id = p.get('id');
  const token = p.get('t');
  const box = $('#rdv');
  const STATUS = { confirmed: ['Confirmé', 'var(--mint)'], cancelled: ['Annulé', 'var(--red)'], done: ['Honoré', 'var(--mustard)'], noshow: ['Absent', '#999'] };

  if (!id || !token) {
    box.innerHTML = '<div class="empty">Lien incomplet. Utilisez le lien reçu par e-mail ou affiché après votre réservation.</div>';
    return;
  }

  let cfg;
  Promise.all([CF.config(), load()]).then(([c, b]) => { cfg = c; render(b); }).catch((err) => {
    box.innerHTML = `<div class="empty">${esc(err.message || 'Rendez-vous introuvable.')}</div><p style="margin-top:20px"><a class="btn" href="reserver.html">Prendre un rendez-vous</a></p>`;
  });

  async function load() {
    const r = await fetch(`/api/booking?id=${encodeURIComponent(id)}&t=${encodeURIComponent(token)}`);
    const res = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(res.error || 'Rendez-vous introuvable.');
    return res.booking;
  }

  function render(b) {
    const [label, color] = STATUS[b.status] || [b.status, '#999'];
    const active = b.status === 'confirmed' && b.date >= cfg.today;
    if (b.status === 'cancelled') CF.mine.remove(b.id);
    box.innerHTML = `
      <div class="ticket">
        <h3>CF COIFFURE</h3>
        <div class="code">${esc(b.id)}</div>
        <p style="text-align:center;margin:0 0 10px"><span style="display:inline-block;padding:4px 14px;border-radius:999px;background:${color};color:#1c1512;font-weight:700;letter-spacing:.14em;text-transform:uppercase;font-size:.8rem">${label}</span></p>
        <ul>${b.services.map((s) => `<li><span>${esc(s.name)}</span><span>${CF.euro(s.price)}</span></li>`).join('')}</ul>
        <div class="line"></div>
        <div class="row"><span>Date</span><span>${esc(CF.frDate(b.date))}</span></div>
        <div class="row"><span>Heure</span><span>${b.time.replace(':', 'h')} → ${b.end.replace(':', 'h')}</span></div>
        <div class="row"><span>Fauteuil</span><span>${esc(b.staffName)}</span></div>
        <div class="row"><span>Au nom de</span><span>${esc(b.name)}</span></div>
        <div class="line"></div>
        <div class="row"><span>Total indicatif</span><span class="total">${CF.euro(b.price)}</span></div>
        <div class="barcode" aria-hidden="true"></div>
      </div>
      ${active ? `
        <div class="done-actions">
          <a class="btn blue small" id="gcal" target="_blank" rel="noopener">Google Agenda</a>
          <button class="btn blue small" id="ics">Fichier .ics</button>
          ${b.canCancel ? `<a class="btn cream small" href="reserver.html?replace=${encodeURIComponent(b.id)}&t=${encodeURIComponent(token)}">Déplacer</a>
          <button class="btn small" id="cancel">Annuler</button>` : ''}
        </div>
        ${b.canCancel ? '' : `<p class="alert info" style="margin-top:22px">Le rendez-vous approche : pour le modifier ou l’annuler, merci d’appeler directement le salon${cfg.salon.phone ? ' au <a href="tel:' + esc(cfg.salon.phone.replace(/\s/g, '')) + '">' + esc(cfg.salon.phone) + '</a>' : ''}.</p>`}
        <div id="msg" role="alert"></div>`
      : `<div class="done-actions"><a class="btn" href="reserver.html">Prendre un nouveau rendez-vous</a></div>`}`;

    if (!active) return;
    const cal = CF.calendar(Object.assign({ manageUrl: location.href }, b), cfg.salon.address);
    $('#gcal').href = cal.gcal;
    $('#ics').onclick = cal.downloadIcs;
    const cancel = $('#cancel');
    if (cancel) cancel.addEventListener('click', async () => {
      if (!confirm('Annuler ce rendez-vous ? Le créneau sera libéré pour un autre client.')) return;
      cancel.disabled = true;
      try {
        const r = await fetch('/api/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, token, action: 'cancel' }),
        });
        const res = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(res.error || 'Annulation impossible.');
        render(res.booking);
      } catch (err) {
        $('#msg').innerHTML = `<div class="alert">${esc(err.message)}</div>`;
        cancel.disabled = false;
      }
    });
  }
})();
