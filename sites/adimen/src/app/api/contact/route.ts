import { NextResponse } from 'next/server';

import { agence } from '@/content/site';
import {
  MOYENS_CONTACT,
  SECTEURS,
  TYPES_DEMANDE,
  libelleDe,
  valider,
  type DonneesFormulaire,
} from '@/lib/formulaire';

export const runtime = 'nodejs';
/* Le traitement dépend de l'appel : aucune mise en cache possible. */
export const dynamic = 'force-dynamic';

/* --------------------------------------------------------------------------
   Limitation du débit
   Fenêtre glissante en mémoire du processus. Elle arrête les envois répétés
   depuis une même adresse ; elle n'est pas partagée entre instances et ne
   remplace pas une protection de périphérie.
   -------------------------------------------------------------------------- */
const FENETRE_MS = 10 * 60 * 1000;
const MAX_PAR_FENETRE = 5;
const journal = new Map<string, number[]>();

function tropDeRequetes(cle: string): boolean {
  const maintenant = Date.now();
  const recentes = (journal.get(cle) ?? []).filter((date) => maintenant - date < FENETRE_MS);

  // Purge opportuniste : évite que la table ne grossisse indéfiniment.
  if (journal.size > 5000) {
    for (const [autreCle, dates] of journal) {
      if (dates.every((date) => maintenant - date >= FENETRE_MS)) journal.delete(autreCle);
    }
  }

  if (recentes.length >= MAX_PAR_FENETRE) {
    journal.set(cle, recentes);
    return true;
  }

  recentes.push(maintenant);
  journal.set(cle, recentes);
  return false;
}

function adresseAppelante(requete: Request): string {
  const transmise = requete.headers.get('x-forwarded-for');
  // Seule la première entrée est renseignée par le proxy de tête.
  return transmise?.split(',')[0]?.trim() || requete.headers.get('x-real-ip') || 'inconnue';
}

/** Neutralise les retours à la ligne, qui permettraient d'injecter un en-tête. */
function nettoyerEntete(valeur: string): string {
  return valeur.replace(/[\r\n]+/g, ' ').trim();
}

function echapperHtml(valeur: string): string {
  return valeur
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(requete: Request) {
  /* --- Origine : bloque les envois croisés depuis un autre site --- */
  const origine = requete.headers.get('origin');
  const hote = requete.headers.get('host');
  if (origine && hote) {
    try {
      if (new URL(origine).host !== hote) {
        return NextResponse.json({ ok: false, message: 'Origine refusée.' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ ok: false, message: 'Origine invalide.' }, { status: 403 });
    }
  }

  if (tropDeRequetes(adresseAppelante(requete))) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'Plusieurs demandes ont déjà été envoyées depuis cet appareil. Réessayez dans quelques minutes ou appelez-nous directement.',
      },
      { status: 429 },
    );
  }

  let donnees: Partial<DonneesFormulaire>;
  try {
    const brut: unknown = await requete.json();
    if (typeof brut !== 'object' || brut === null) throw new Error('format');
    donnees = brut as Partial<DonneesFormulaire>;
  } catch {
    return NextResponse.json({ ok: false, message: 'Requête illisible.' }, { status: 400 });
  }

  /* --- Champ piège : un automate le remplit, un visiteur ne le voit pas ---
     La réponse est volontairement identique à un succès, pour ne pas
     renseigner l'émetteur sur le mécanisme. */
  if (donnees.societe && donnees.societe.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const erreurs = valider(donnees);
  if (Object.keys(erreurs).length > 0) {
    return NextResponse.json({ ok: false, erreurs }, { status: 422 });
  }

  /* --- Composition du message --- */
  const nom = nettoyerEntete(donnees.nom!.trim());
  const email = nettoyerEntete(donnees.email!.trim());
  const telephone = donnees.telephone?.trim() ?? '';
  const disponibilites = donnees.disponibilites?.trim() ?? '';

  const lignes = [
    ['Nom', nom],
    ['E-mail', email],
    ['Téléphone', telephone || '—'],
    ['Contact préféré', libelleDe(MOYENS_CONTACT, donnees.moyenContact!)],
    ['Type de demande', libelleDe(TYPES_DEMANDE, donnees.typeDemande!)],
    ['Secteur', libelleDe(SECTEURS, donnees.secteur!)],
    ['Disponibilités', disponibilites || '—'],
  ] as const;

  const texte = [
    ...lignes.map(([etiquette, valeur]) => `${etiquette} : ${valeur}`),
    '',
    'Message :',
    donnees.message!.trim(),
  ].join('\n');

  const html = [
    '<table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px">',
    ...lignes.map(
      ([etiquette, valeur]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666">${etiquette}</td><td style="padding:4px 0"><strong>${echapperHtml(valeur)}</strong></td></tr>`,
    ),
    '</table>',
    `<p style="font-family:system-ui,sans-serif;font-size:14px;white-space:pre-wrap">${echapperHtml(donnees.message!.trim())}</p>`,
  ].join('');

  /* --- Acheminement ---
     Aucune clé n'est inventée : si le service d'envoi n'est pas configuré, la
     route le dit franchement et le formulaire bascule sur le lien de
     messagerie. Voir README.md § « Variables d'environnement ». */
  const cle = process.env.RESEND_API_KEY;
  const expediteur = process.env.CONTACT_FROM;
  const destinataire = process.env.CONTACT_TO ?? agence.email;

  if (!cle || !expediteur) {
    return NextResponse.json(
      {
        ok: false,
        code: 'non_configure',
        message:
          "L'envoi automatique n'est pas encore configuré. Votre message n'a pas été transmis.",
      },
      { status: 503 },
    );
  }

  try {
    const reponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cle}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: expediteur,
        to: [destinataire],
        reply_to: email,
        subject: `Demande — ${libelleDe(TYPES_DEMANDE, donnees.typeDemande!)} — ${nom}`,
        text: texte,
        html,
      }),
    });

    if (!reponse.ok) {
      // Le détail du fournisseur reste côté serveur : il n'apprend rien d'utile
      // au visiteur et pourrait exposer la configuration.
      console.error('Envoi refusé par le service de messagerie', reponse.status);
      return NextResponse.json(
        {
          ok: false,
          message: "Votre message n'a pas pu être transmis. Merci de réessayer ou de nous appeler.",
        },
        { status: 502 },
      );
    }
  } catch (erreur) {
    console.error('Service de messagerie injoignable', erreur);
    return NextResponse.json(
      {
        ok: false,
        message: "Votre message n'a pas pu être transmis. Merci de réessayer ou de nous appeler.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
