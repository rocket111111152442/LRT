'use client';

import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';

import { agence } from '@/content/site';
import {
  MOYENS_CONTACT,
  SECTEURS,
  TYPES_DEMANDE,
  libelleDe,
  valider,
  type DonneesFormulaire,
  type Erreurs,
} from '@/lib/formulaire';
import { cx, lienTel } from '@/lib/utils';

type Etat = 'saisie' | 'envoi' | 'succes';

const VALEURS_INITIALES: DonneesFormulaire = {
  nom: '',
  email: '',
  telephone: '',
  moyenContact: 'email',
  typeDemande: '',
  secteur: '',
  disponibilites: '',
  message: '',
  consentement: '',
  societe: '',
};

/** Prépare un lien de messagerie de secours si l'envoi automatique échoue. */
function lienSecours(donnees: DonneesFormulaire): string {
  const corps = [
    `Nom : ${donnees.nom}`,
    `E-mail : ${donnees.email}`,
    `Téléphone : ${donnees.telephone || '—'}`,
    `Contact préféré : ${libelleDe(MOYENS_CONTACT, donnees.moyenContact)}`,
    `Type de demande : ${libelleDe(TYPES_DEMANDE, donnees.typeDemande)}`,
    `Secteur : ${libelleDe(SECTEURS, donnees.secteur)}`,
    `Disponibilités : ${donnees.disponibilites || '—'}`,
    '',
    donnees.message,
  ].join('\n');

  return `mailto:${agence.email}?subject=${encodeURIComponent(`Demande — ${donnees.nom}`)}&body=${encodeURIComponent(corps)}`;
}

export default function FormulaireContact({ compact = false }: { compact?: boolean }) {
  const [donnees, setDonnees] = useState<DonneesFormulaire>(VALEURS_INITIALES);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [etat, setEtat] = useState<Etat>('saisie');
  const [messageGlobal, setMessageGlobal] = useState<string | null>(null);
  const [secours, setSecours] = useState<string | null>(null);
  const idBase = useId().replace(/:/g, '');
  const resumeRef = useRef<HTMLDivElement>(null);

  const idDe = (champ: string) => `${idBase}-${champ}`;
  const idErreur = (champ: string) => `${idBase}-${champ}-erreur`;

  const majChamp = (champ: keyof DonneesFormulaire, valeur: string) => {
    setDonnees((precedent) => ({ ...precedent, [champ]: valeur }));
    // L'erreur disparaît dès la correction : pas d'attente d'un nouvel envoi.
    setErreurs((precedent) => {
      if (!(champ in precedent)) return precedent;
      const copie = { ...precedent };
      delete copie[champ as keyof Erreurs];
      return copie;
    });
  };

  async function surEnvoi(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessageGlobal(null);
    setSecours(null);

    const trouvees = valider(donnees);
    if (Object.keys(trouvees).length > 0) {
      setErreurs(trouvees);
      // Le premier champ fautif reçoit le focus : la correction est immédiate.
      const premier = Object.keys(trouvees)[0];
      if (premier) document.getElementById(idDe(premier))?.focus();
      return;
    }

    setEtat('envoi');

    try {
      const reponse = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donnees),
      });

      const charge: { ok?: boolean; erreurs?: Erreurs; message?: string } = await reponse
        .json()
        .catch(() => ({}));

      if (reponse.ok && charge.ok) {
        setEtat('succes');
        setDonnees(VALEURS_INITIALES);
        return;
      }

      setEtat('saisie');

      if (charge.erreurs) {
        setErreurs(charge.erreurs);
        setMessageGlobal('Certaines informations doivent être corrigées.');
      } else {
        setMessageGlobal(
          charge.message ??
            "Votre message n'a pas pu être transmis. Merci de réessayer ou de nous appeler.",
        );
        // L'envoi automatique a échoué : on propose le logiciel de messagerie,
        // afin que la demande ne soit pas perdue.
        setSecours(lienSecours(donnees));
      }

      resumeRef.current?.focus();
    } catch {
      setEtat('saisie');
      setMessageGlobal(
        'La connexion a échoué. Vérifiez votre accès à Internet, ou appelez-nous directement.',
      );
      setSecours(lienSecours(donnees));
      resumeRef.current?.focus();
    }
  }

  /* ---------------- Confirmation ---------------- */
  if (etat === 'succes') {
    return (
      <div className="carte p-8 text-center lg:p-12" role="status" aria-live="polite" tabIndex={-1}>
        <CheckCircle2 aria-hidden="true" className="mx-auto size-10 text-tactique" />
        <h3 className="mt-6 font-display text-t3 text-ivoire">Votre demande nous est parvenue</h3>
        <p className="mx-auto mt-4 max-w-md text-argent">
          Nous revenons vers vous par le moyen que vous avez indiqué, du lundi au vendredi entre 8 h
          et 20 h. Votre message est traité de manière strictement confidentielle.
        </p>
        <p className="mt-6 text-[0.875rem] text-brume">
          Une situation urgente&nbsp;?{' '}
          <a
            href={lienTel(agence.telephonePrincipal)}
            className="text-champagne underline underline-offset-4"
          >
            {agence.telephonePrincipalAffiche}
          </a>
        </p>
        <button type="button" onClick={() => setEtat('saisie')} className="btn btn-secondaire mt-8">
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  const enCours = etat === 'envoi';

  return (
    <form onSubmit={surEnvoi} noValidate className={cx('flex flex-col gap-6', compact && 'gap-5')}>
      {/* Résumé d'erreur global, annoncé aux technologies d'assistance */}
      <div ref={resumeRef} tabIndex={-1} aria-live="assertive">
        {messageGlobal && (
          <div className="flex items-start gap-3 rounded-[var(--radius-doux)] border border-[color-mix(in_oklab,var(--color-alerte)_45%,transparent)] bg-[color-mix(in_oklab,var(--color-alerte)_10%,transparent)] p-4">
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-alerte" />
            <div className="text-[0.875rem] leading-relaxed text-ivoire">
              <p>{messageGlobal}</p>
              {secours && (
                <p className="mt-2">
                  <a href={secours} className="text-champagne underline underline-offset-4">
                    Ouvrir la demande dans votre logiciel de messagerie
                  </a>{' '}
                  ou appeler le{' '}
                  <a
                    href={lienTel(agence.telephonePrincipal)}
                    className="text-champagne underline underline-offset-4"
                  >
                    {agence.telephonePrincipalAffiche}
                  </a>
                  .
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Champ piège — invisible et hors du parcours au clavier */}
      <div className="piege" aria-hidden="true">
        <label htmlFor={idDe('societe')}>Ne pas remplir ce champ</label>
        <input
          id={idDe('societe')}
          name="societe"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={donnees.societe ?? ''}
          onChange={(e) => majChamp('societe', e.target.value)}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Nom */}
        <div className="champ">
          <label className="champ-label" htmlFor={idDe('nom')}>
            Nom
          </label>
          <input
            id={idDe('nom')}
            name="nom"
            type="text"
            autoComplete="name"
            required
            disabled={enCours}
            className="champ-saisie"
            value={donnees.nom}
            onChange={(e) => majChamp('nom', e.target.value)}
            aria-invalid={Boolean(erreurs.nom)}
            aria-describedby={erreurs.nom ? idErreur('nom') : undefined}
          />
          {erreurs.nom && (
            <p className="champ-erreur" id={idErreur('nom')}>
              <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
              {erreurs.nom}
            </p>
          )}
        </div>

        {/* E-mail */}
        <div className="champ">
          <label className="champ-label" htmlFor={idDe('email')}>
            E-mail
          </label>
          <input
            id={idDe('email')}
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={enCours}
            className="champ-saisie"
            value={donnees.email}
            onChange={(e) => majChamp('email', e.target.value)}
            aria-invalid={Boolean(erreurs.email)}
            aria-describedby={erreurs.email ? idErreur('email') : undefined}
          />
          {erreurs.email && (
            <p className="champ-erreur" id={idErreur('email')}>
              <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
              {erreurs.email}
            </p>
          )}
        </div>

        {/* Téléphone */}
        <div className="champ">
          <label className="champ-label" htmlFor={idDe('telephone')}>
            Téléphone <span className="facultatif">(facultatif)</span>
          </label>
          <input
            id={idDe('telephone')}
            name="telephone"
            type="tel"
            autoComplete="tel"
            disabled={enCours}
            className="champ-saisie"
            value={donnees.telephone}
            onChange={(e) => majChamp('telephone', e.target.value)}
            aria-invalid={Boolean(erreurs.telephone)}
            aria-describedby={erreurs.telephone ? idErreur('telephone') : undefined}
          />
          {erreurs.telephone && (
            <p className="champ-erreur" id={idErreur('telephone')}>
              <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
              {erreurs.telephone}
            </p>
          )}
        </div>

        {/* Secteur */}
        <div className="champ">
          <label className="champ-label" htmlFor={idDe('secteur')}>
            Ville ou secteur concerné
          </label>
          <select
            id={idDe('secteur')}
            name="secteur"
            required
            disabled={enCours}
            className="champ-saisie"
            value={donnees.secteur}
            onChange={(e) => majChamp('secteur', e.target.value)}
            aria-invalid={Boolean(erreurs.secteur)}
            aria-describedby={erreurs.secteur ? idErreur('secteur') : undefined}
          >
            <option value="">Choisir…</option>
            {SECTEURS.map((secteur) => (
              <option key={secteur.valeur} value={secteur.valeur}>
                {secteur.label}
              </option>
            ))}
          </select>
          {erreurs.secteur && (
            <p className="champ-erreur" id={idErreur('secteur')}>
              <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
              {erreurs.secteur}
            </p>
          )}
        </div>
      </div>

      {/* Type de demande */}
      <fieldset
        className="champ"
        aria-invalid={Boolean(erreurs.typeDemande)}
        aria-describedby={erreurs.typeDemande ? idErreur('typeDemande') : undefined}
      >
        <legend className="champ-label mb-3">Nature de la demande</legend>
        <div className="pastilles">
          {TYPES_DEMANDE.map((type) => (
            <label key={type.valeur} className="pastille">
              <input
                type="radio"
                name="typeDemande"
                value={type.valeur}
                disabled={enCours}
                checked={donnees.typeDemande === type.valeur}
                onChange={() => majChamp('typeDemande', type.valeur)}
                /* Cible du focus programmatique en cas d'erreur */
                id={type.valeur === TYPES_DEMANDE[0].valeur ? idDe('typeDemande') : undefined}
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
        {erreurs.typeDemande && (
          <p className="champ-erreur mt-1" id={idErreur('typeDemande')}>
            <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
            {erreurs.typeDemande}
          </p>
        )}
      </fieldset>

      {/* Moyen de contact préféré */}
      <fieldset
        className="champ"
        aria-invalid={Boolean(erreurs.moyenContact)}
        aria-describedby={erreurs.moyenContact ? idErreur('moyenContact') : undefined}
      >
        <legend className="champ-label mb-3">Comment préférez-vous être recontacté&nbsp;?</legend>
        <div className="pastilles">
          {MOYENS_CONTACT.map((moyen) => (
            <label key={moyen.valeur} className="pastille">
              <input
                type="radio"
                name="moyenContact"
                value={moyen.valeur}
                disabled={enCours}
                checked={donnees.moyenContact === moyen.valeur}
                onChange={() => majChamp('moyenContact', moyen.valeur)}
                id={moyen.valeur === MOYENS_CONTACT[0].valeur ? idDe('moyenContact') : undefined}
              />
              <span>{moyen.label}</span>
            </label>
          ))}
        </div>
        {erreurs.moyenContact && (
          <p className="champ-erreur mt-1" id={idErreur('moyenContact')}>
            <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
            {erreurs.moyenContact}
          </p>
        )}
      </fieldset>

      {/* Disponibilités */}
      <div className="champ">
        <label className="champ-label" htmlFor={idDe('disponibilites')}>
          Vos disponibilités <span className="facultatif">(facultatif)</span>
        </label>
        <input
          id={idDe('disponibilites')}
          name="disponibilites"
          type="text"
          disabled={enCours}
          className="champ-saisie"
          placeholder="Par exemple : en semaine après 18 h, ou samedi matin"
          value={donnees.disponibilites}
          onChange={(e) => majChamp('disponibilites', e.target.value)}
          aria-invalid={Boolean(erreurs.disponibilites)}
          aria-describedby={erreurs.disponibilites ? idErreur('disponibilites') : undefined}
        />
        {erreurs.disponibilites && (
          <p className="champ-erreur" id={idErreur('disponibilites')}>
            <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
            {erreurs.disponibilites}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="champ">
        <label className="champ-label" htmlFor={idDe('message')}>
          Votre situation
        </label>
        <textarea
          id={idDe('message')}
          name="message"
          required
          disabled={enCours}
          className="champ-saisie"
          placeholder="Décrivez brièvement votre situation et ce que vous cherchez à établir. Nous vous rappelons pour en préciser les contours."
          value={donnees.message}
          onChange={(e) => majChamp('message', e.target.value)}
          aria-invalid={Boolean(erreurs.message)}
          aria-describedby={erreurs.message ? idErreur('message') : undefined}
        />
        {erreurs.message && (
          <p className="champ-erreur" id={idErreur('message')}>
            <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
            {erreurs.message}
          </p>
        )}
      </div>

      {/* Consentement */}
      <div className="champ">
        <label className="case" htmlFor={idDe('consentement')}>
          <input
            id={idDe('consentement')}
            name="consentement"
            type="checkbox"
            required
            disabled={enCours}
            checked={donnees.consentement === 'oui'}
            onChange={(e) => majChamp('consentement', e.target.checked ? 'oui' : '')}
            aria-invalid={Boolean(erreurs.consentement)}
            aria-describedby={erreurs.consentement ? idErreur('consentement') : undefined}
          />
          <span className="text-[0.875rem] leading-relaxed text-argent">
            J’accepte que les informations transmises soient utilisées pour traiter ma demande,
            conformément à la{' '}
            <Link
              href="/politique-de-confidentialite/"
              className="text-champagne underline underline-offset-4"
            >
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
        {erreurs.consentement && (
          <p className="champ-erreur" id={idErreur('consentement')}>
            <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
            {erreurs.consentement}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" className="btn btn-primaire" disabled={enCours}>
          {enCours ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              Envoi en cours…
            </>
          ) : (
            <>
              <Send aria-hidden="true" className="size-4" />
              Envoyer ma demande
            </>
          )}
        </button>
        <p className="text-[0.8125rem] text-brume">
          Ou appelez le{' '}
          <a
            href={lienTel(agence.telephonePrincipal)}
            className="text-argent underline underline-offset-4 transition-colors hover:text-champagne"
          >
            {agence.telephonePrincipalAffiche}
          </a>
        </p>
      </div>
    </form>
  );
}
