import type { Metadata } from 'next';
import Link from 'next/link';

import DonneesStructurees from '@/components/DonneesStructurees';
import HeroPage from '@/components/HeroPage';
import { agence, bureauPrincipal } from '@/content/site';
import { jsonLdFilAriane, type MailleFil } from '@/lib/jsonld';
import { construireMeta } from '@/lib/seo';

const CHEMIN = '/politique-de-confidentialite/';

const maillons: readonly MailleFil[] = [
  { nom: 'Accueil', chemin: '/' },
  { nom: 'Politique de confidentialité', chemin: CHEMIN },
];

export const metadata: Metadata = construireMeta({
  titre: 'Politique de confidentialité',
  description:
    'Quelles données nous collectons via ce site, pourquoi, combien de temps nous les conservons et quels droits vous pouvez exercer, conformément à la loi fédérale sur la protection des données.',
  chemin: CHEMIN,
});

export default function PolitiqueConfidentialite() {
  return (
    <>
      <DonneesStructurees donnees={jsonLdFilAriane(maillons)} />

      <HeroPage
        etiquette="Protection des données"
        titre={['Politique de', 'confidentialité']}
        chapeau="Ce document décrit le traitement des données personnelles effectué à travers ce site. Il ne concerne pas les données recueillies dans le cadre d'une mission d'investigation, qui relèvent du mandat conclu avec le client et font l'objet d'un régime distinct."
        maillons={maillons}
      />

      <section className="section">
        <div className="cadre-etroit">
          <div className="prose max-w-none">
            <h2>Responsable du traitement</h2>
            <p>
              {agence.nomLegal}, {bureauPrincipal.rue}, {bureauPrincipal.npa}{' '}
              {bureauPrincipal.localite}, Suisse.
              <br />
              Contact : <a href={`mailto:${agence.email}`}>{agence.email}</a>
            </p>

            <h2>Données collectées par ce site</h2>
            <p>Ce site ne collecte des données que lorsque vous nous écrivez. Concrètement :</p>
            <ul>
              <li>
                <strong>Formulaire de contact</strong> — nom, adresse e-mail, numéro de téléphone
                (facultatif), moyen de contact préféré, nature de la demande, secteur géographique,
                disponibilités et contenu de votre message.
              </li>
              <li>
                <strong>Journaux techniques</strong> — l’infrastructure d’hébergement enregistre les
                requêtes reçues (adresse IP, horodatage, page demandée) pour assurer le
                fonctionnement et la sécurité du service.
              </li>
            </ul>
            <p>
              Aucun outil de mesure d’audience, aucun traceur publicitaire et aucun bouton de réseau
              social n’est installé sur ce site.
            </p>

            <h2>Finalités et bases légales</h2>
            <ul>
              <li>
                <strong>Répondre à votre demande</strong> et, le cas échéant, préparer une offre. Le
                traitement repose sur votre consentement, recueilli explicitement lors de l’envoi du
                formulaire, et sur les mesures précontractuelles que vous sollicitez.
              </li>
              <li>
                <strong>Assurer la sécurité du site</strong> et prévenir les envois automatisés
                abusifs. Le traitement repose sur notre intérêt légitime à protéger le service.
              </li>
            </ul>

            <h2>Destinataires</h2>
            <p>
              Vos données sont traitées par l’agence. Elles peuvent être transmises au prestataire
              qui assure l’acheminement technique des messages et à l’hébergeur du site, agissant
              tous deux sur nos instructions.{' '}
              <strong>Aucune donnée n’est vendue, louée ni cédée à des fins publicitaires.</strong>
            </p>

            <h2>Durée de conservation</h2>
            <ul>
              <li>
                Demandes n’ayant pas donné lieu à un mandat : conservées douze mois au maximum, puis
                supprimées.
              </li>
              <li>
                Demandes ayant donné lieu à un mandat : conservées pendant la durée du dossier, puis
                selon les délais légaux de conservation applicables.
              </li>
              <li>Journaux techniques : conservés sur une durée courte, à des fins de sécurité.</li>
            </ul>

            <h2>Sécurité</h2>
            <p>
              Les échanges avec ce site sont chiffrés en transit. Les informations recueillies dans
              le cadre de nos investigations sont conservées sur des serveurs sécurisés situés en
              Suisse pendant toute la durée des investigations. L’accès aux dossiers est limité aux
              personnes qui en ont besoin pour leur exécution.
            </p>

            <h2>Vos droits</h2>
            <p>
              Conformément à la loi fédérale sur la protection des données, vous disposez d’un droit
              d’accès, de rectification, d’effacement et d’opposition, ainsi que du droit de retirer
              votre consentement à tout moment. Vous pouvez exercer ces droits en écrivant à{' '}
              <a href={`mailto:${agence.email}`}>{agence.email}</a>.
            </p>
            <p>
              L’exercice de ces droits peut être limité lorsqu’un intérêt prépondérant s’y oppose,
              notamment lorsque les données sont liées à un mandat d’investigation en cours ou à une
              obligation légale de conservation. Le cas échéant, nous vous en indiquons le motif.
            </p>
            <p>
              Vous pouvez également saisir le Préposé fédéral à la protection des données et à la
              transparence.
            </p>

            <h2>Cookies</h2>
            <p>
              L’usage des cookies sur ce site est décrit dans la{' '}
              <Link href="/gestion-des-cookies/">page dédiée</Link>.
            </p>

            <h2>Modifications</h2>
            <p>
              Cette politique peut évoluer, notamment si de nouveaux outils sont ajoutés au site.
              Toute modification substantielle sera signalée sur cette page.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
