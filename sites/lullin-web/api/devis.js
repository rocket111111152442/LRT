/**
 * Traitement du formulaire de devis — fonction serverless Vercel.
 *
 * Envoi par l'API HTTP de Resend (https://resend.com), sans dépendance.
 *
 * Variables d'environnement à définir dans Vercel (Settings → Environment Variables) :
 *   RESEND_API_KEY   clé d'API Resend                                   (obligatoire)
 *   CONTACT_FROM     expéditeur vérifié, ex. devis@lullinweb.fr         (obligatoire)
 *   CONTACT_TO       destinataire des demandes (votre adresse)          (obligatoire)
 *
 * Tant que ces variables ne sont pas renseignées, la fonction répond 503
 * et le site invite le visiteur à écrire directement par e-mail.
 */

'use strict';

const MAX = { nom: 120, entreprise: 160, email: 180, telephone: 40, projet: 60, message: 5000 };

function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\r\n]+/g, ' ').trim().slice(0, max);
}

function multiline(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/\r\n/g, '\n').trim().slice(0, max);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length) {
    try {
      return JSON.parse(req.body);
    } catch (err) {
      return Object.fromEntries(new URLSearchParams(req.body));
    }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (err) {
    return Object.fromEntries(new URLSearchParams(raw));
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, erreur: 'methode' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    return res.status(400).json({ ok: false, erreur: 'corps' });
  }

  /* Piège à robots : le champ doit rester vide. */
  if (clean(body.societe_web, 50)) return res.status(200).json({ ok: true });

  const nom = clean(body.nom, MAX.nom);
  const entreprise = clean(body.entreprise, MAX.entreprise);
  const email = clean(body.email, MAX.email);
  const telephone = clean(body.telephone, MAX.telephone);
  const projet = clean(body.projet, MAX.projet);
  const message = multiline(body.message, MAX.message);

  const manquants = [];
  if (!nom) manquants.push('nom');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) manquants.push('email');
  if (message.length < 20) manquants.push('message');
  if (!body.consentement) manquants.push('consentement');
  if (manquants.length) return res.status(422).json({ ok: false, erreur: 'champs', manquants });

  const cle = process.env.RESEND_API_KEY;
  const expediteur = process.env.CONTACT_FROM;
  const vers = process.env.CONTACT_TO;
  if (!cle || !expediteur || !vers) {
    return res.status(503).json({ ok: false, erreur: 'non_configure' });
  }

  const lignes = [
    ['Nom', nom],
    ['Entreprise', entreprise || '—'],
    ['E-mail', email],
    ['Téléphone', telephone || '—'],
    ['Type de projet', projet || '—'],
  ];

  const texte = 'Lullin Web — nouvelle demande de devis\n\n'
    + lignes.map(function (l) { return l[0] + ' : ' + l[1]; }).join('\n')
    + '\n\nMessage :\n' + message + '\n';

  const html = '<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#0a0a0c">'
    + '<p style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#6b6b70;margin:0 0 16px">'
    + 'Lullin Web — nouvelle demande de devis</p>'
    + '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">'
    + lignes.map(function (l) {
        return '<tr><td style="padding:6px 24px 6px 0;color:#6b6b70">' + escapeHtml(l[0])
             + '</td><td style="padding:6px 0"><strong>' + escapeHtml(l[1]) + '</strong></td></tr>';
      }).join('')
    + '</table><hr style="border:0;border-top:1px solid #e5e5e5;margin:20px 0">'
    + '<p style="white-space:pre-wrap;line-height:1.6;margin:0">' + escapeHtml(message) + '</p></div>';

  try {
    const reponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + cle, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: expediteur,
        to: [vers],
        reply_to: email,
        subject: '[Lullin Web] Nouvelle demande de devis — ' + nom,
        text: texte,
        html: html,
      }),
    });
    if (!reponse.ok) {
      const detail = await reponse.text();
      console.error('Envoi refusé par Resend', reponse.status, detail.slice(0, 500));
      return res.status(502).json({ ok: false, erreur: 'envoi' });
    }
  } catch (err) {
    console.error('Envoi impossible', err);
    return res.status(502).json({ ok: false, erreur: 'envoi' });
  }

  return res.status(200).json({ ok: true });
};
