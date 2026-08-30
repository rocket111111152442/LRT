/**
 * Traitement du formulaire de contact — fonction serverless Vercel.
 *
 * Sans dépendance : l'envoi passe par l'API HTTP de Resend (https://resend.com),
 * qui fonctionne depuis une fonction serverless là où le SMTP est souvent bloqué.
 *
 * Variables d'environnement à définir dans Vercel (Settings → Environment Variables) :
 *   RESEND_API_KEY            clé d'API Resend                             (obligatoire)
 *   CONTACT_FROM              expéditeur vérifié, ex. site@allcx-consulting.com (obligatoire)
 *   CONTACT_TO_CONSULTING     destinataire des demandes Consulting          (optionnel)
 *   CONTACT_TO_PATRIMOINE     destinataire des demandes Patrimoine          (optionnel)
 *   CONTACT_TO                destinataire par défaut si les deux ci-dessus manquent
 *
 * Tant que la clé n'est pas renseignée, la fonction répond 503 et le formulaire
 * bascule automatiquement sur l'ouverture du logiciel de messagerie du visiteur.
 */

'use strict';

const MAX = { nom: 120, societe: 160, email: 180, telephone: 40, sujet: 160, message: 5000 };

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

function destinataire(marque) {
  if (marque === 'patrimoine') {
    return process.env.CONTACT_TO_PATRIMOINE || process.env.CONTACT_TO || '';
  }
  return process.env.CONTACT_TO_CONSULTING || process.env.CONTACT_TO || '';
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

  const versHtml = !String(req.headers['content-type'] || '').includes('application/json');
  const retour = /^\/[A-Za-z0-9/_-]*\.html$/.test(body.retour || '') ? body.retour : '/';

  const fin = function (code, charge, etat) {
    if (versHtml) {
      res.setHeader('Location', retour + '?envoi=' + etat);
      return res.status(303).end();
    }
    return res.status(code).json(charge);
  };

  /* Piège à robots : le champ doit rester vide. */
  if (clean(body.societe_web, 50)) return fin(200, { ok: true }, 'ok');

  const nom = clean(body.nom, MAX.nom);
  const societe = clean(body.societe, MAX.societe);
  const email = clean(body.email, MAX.email);
  const telephone = clean(body.telephone, MAX.telephone);
  const sujet = clean(body.sujet, MAX.sujet);
  const message = multiline(body.message, MAX.message);
  const marque = body.marque === 'patrimoine' ? 'patrimoine' : 'consulting';

  const manquants = [];
  if (!nom) manquants.push('nom');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) manquants.push('email');
  if (message.length < 20) manquants.push('message');
  if (!body.consentement) manquants.push('consentement');
  if (manquants.length) return fin(422, { ok: false, erreur: 'champs', manquants }, 'erreur');

  const cle = process.env.RESEND_API_KEY;
  const expediteur = process.env.CONTACT_FROM;
  const vers = destinataire(marque);
  if (!cle || !expediteur || !vers) {
    return fin(503, { ok: false, erreur: 'non_configure' }, 'erreur');
  }

  const marqueLabel = marque === 'patrimoine' ? 'ALLCX Patrimoine' : 'ALLCX Consulting';
  const lignes = [
    ['Nom', nom],
    ['Société', societe || '—'],
    ['E-mail', email],
    ['Téléphone', telephone || '—'],
    ['Objet', sujet || '—'],
  ];

  const texte = marqueLabel + ' — nouvelle demande\n\n'
    + lignes.map(function (l) { return l[0] + ' : ' + l[1]; }).join('\n')
    + '\n\nMessage :\n' + message + '\n';

  const html = '<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#26201E">'
    + '<p style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#75162A;margin:0 0 16px">'
    + escapeHtml(marqueLabel) + ' — nouvelle demande</p>'
    + '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">'
    + lignes.map(function (l) {
        return '<tr><td style="padding:6px 24px 6px 0;color:#6B5F5C">' + escapeHtml(l[0])
             + '</td><td style="padding:6px 0"><strong>' + escapeHtml(l[1]) + '</strong></td></tr>';
      }).join('')
    + '</table><hr style="border:0;border-top:1px solid #E7E0D9;margin:20px 0">'
    + '<p style="white-space:pre-wrap;line-height:1.6;margin:0">' + escapeHtml(message) + '</p></div>';

  try {
    const reponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + cle, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: expediteur,
        to: [vers],
        reply_to: email,
        subject: '[' + marqueLabel + '] ' + (sujet || 'Demande de contact'),
        text: texte,
        html: html,
      }),
    });
    if (!reponse.ok) {
      const detail = await reponse.text();
      console.error('Envoi refusé par Resend', reponse.status, detail.slice(0, 500));
      return fin(502, { ok: false, erreur: 'envoi' }, 'erreur');
    }
  } catch (err) {
    console.error('Envoi impossible', err);
    return fin(502, { ok: false, erreur: 'envoi' }, 'erreur');
  }

  return fin(200, { ok: true }, 'ok');
};
