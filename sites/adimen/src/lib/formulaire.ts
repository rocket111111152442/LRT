/**
 * Schéma et validation du formulaire de contact.
 *
 * Le même module est utilisé par le composant et par la route d'API : les
 * règles ne peuvent donc pas diverger entre le navigateur et le serveur. La
 * validation serveur reste la seule qui fasse foi.
 */

export const MOYENS_CONTACT = [
  { valeur: 'email', label: 'E-mail' },
  { valeur: 'telephone', label: 'Téléphone' },
  { valeur: 'whatsapp', label: 'WhatsApp' },
] as const;

export const TYPES_DEMANDE = [
  { valeur: 'particulier', label: 'Situation personnelle' },
  { valeur: 'entreprise', label: 'Demande d’entreprise' },
  { valeur: 'parents', label: 'Situation familiale' },
  { valeur: 'contre-mesures', label: 'Contre-mesures' },
  { valeur: 'emploi', label: 'Candidature' },
  { valeur: 'autre', label: 'Autre demande' },
] as const;

export const SECTEURS = [
  { valeur: 'geneve', label: 'Genève' },
  { valeur: 'lausanne', label: 'Lausanne' },
  { valeur: 'montreux', label: 'Montreux / Riviera' },
  { valeur: 'sion', label: 'Sion / Valais' },
  { valeur: 'suisse', label: 'Ailleurs en Suisse' },
  { valeur: 'etranger', label: 'À l’étranger' },
] as const;

export type ChampFormulaire =
  | 'nom'
  | 'email'
  | 'telephone'
  | 'moyenContact'
  | 'typeDemande'
  | 'secteur'
  | 'disponibilites'
  | 'message'
  | 'consentement';

export type DonneesFormulaire = Record<ChampFormulaire, string> & {
  /** Champ piège : rempli uniquement par un automate. */
  societe?: string;
};

export type Erreurs = Partial<Record<ChampFormulaire, string>>;

const LIMITES: Record<ChampFormulaire, number> = {
  nom: 120,
  email: 180,
  telephone: 40,
  moyenContact: 30,
  typeDemande: 30,
  secteur: 30,
  disponibilites: 300,
  message: 4000,
  consentement: 10,
};

/* Validation d'adresse volontairement large : les cas exotiques mais valides
   ne doivent pas être rejetés. Le rôle de ce contrôle est d'attraper la faute
   de frappe, pas de trancher la conformité RFC. */
const MOTIF_EMAIL = /^[^\s@]+@[^\s@,]+\.[a-z]{2,}$/i;

function estDansListe(valeur: string, liste: readonly { valeur: string }[]): boolean {
  return liste.some((entree) => entree.valeur === valeur);
}

export function valider(donnees: Partial<DonneesFormulaire>): Erreurs {
  const erreurs: Erreurs = {};

  const nom = (donnees.nom ?? '').trim();
  if (nom.length < 2) {
    erreurs.nom = 'Indiquez le nom sous lequel nous devons vous joindre.';
  } else if (nom.length > LIMITES.nom) {
    erreurs.nom = `Ce champ est limité à ${LIMITES.nom} caractères.`;
  }

  const email = (donnees.email ?? '').trim();
  if (!email) {
    erreurs.email = 'Une adresse e-mail est nécessaire pour vous répondre.';
  } else if (!MOTIF_EMAIL.test(email) || email.length > LIMITES.email) {
    erreurs.email = 'Cette adresse e-mail ne semble pas valide.';
  }

  const telephone = (donnees.telephone ?? '').trim();
  if (telephone) {
    if (telephone.length > LIMITES.telephone || !/^[\d\s+().-]{6,}$/.test(telephone)) {
      erreurs.telephone = 'Ce numéro ne semble pas valide.';
    }
  }

  const moyen = (donnees.moyenContact ?? '').trim();
  if (!moyen || !estDansListe(moyen, MOYENS_CONTACT)) {
    erreurs.moyenContact = 'Choisissez la façon dont vous préférez être recontacté.';
  }

  // Un rappel téléphonique suppose un numéro.
  if (!erreurs.telephone && (moyen === 'telephone' || moyen === 'whatsapp') && !telephone) {
    erreurs.telephone = 'Indiquez un numéro pour que nous puissions vous joindre ainsi.';
  }

  const type = (donnees.typeDemande ?? '').trim();
  if (!type || !estDansListe(type, TYPES_DEMANDE)) {
    erreurs.typeDemande = 'Précisez la nature de votre demande.';
  }

  const secteur = (donnees.secteur ?? '').trim();
  if (!secteur || !estDansListe(secteur, SECTEURS)) {
    erreurs.secteur = 'Indiquez la ville ou le secteur concerné.';
  }

  if ((donnees.disponibilites ?? '').length > LIMITES.disponibilites) {
    erreurs.disponibilites = `Ce champ est limité à ${LIMITES.disponibilites} caractères.`;
  }

  const message = (donnees.message ?? '').trim();
  if (message.length < 20) {
    erreurs.message = 'Décrivez votre situation en quelques lignes (20 caractères au minimum).';
  } else if (message.length > LIMITES.message) {
    erreurs.message = `Ce champ est limité à ${LIMITES.message} caractères.`;
  }

  if (donnees.consentement !== 'oui') {
    erreurs.consentement = 'Votre accord est nécessaire pour que nous traitions votre demande.';
  }

  return erreurs;
}

export function libelleDe(
  liste: readonly { valeur: string; label: string }[],
  valeur: string,
): string {
  return liste.find((entree) => entree.valeur === valeur)?.label ?? valeur;
}
