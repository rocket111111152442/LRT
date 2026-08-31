import type { Metadata } from 'next';

import DonneesStructurees from '@/components/DonneesStructurees';
import HeroPage from '@/components/HeroPage';
import { SITE_URL, agence, bureauPrincipal, bureaux } from '@/content/site';
import { jsonLdFilAriane, type MailleFil } from '@/lib/jsonld';
import { construireMeta } from '@/lib/seo';

const CHEMIN = '/mentions-legales/';

const maillons: readonly MailleFil[] = [
  { nom: 'Accueil', chemin: '/' },
  { nom: 'Mentions légales', chemin: CHEMIN },
];

export const metadata: Metadata = construireMeta({
  titre: 'Mentions légales',
  description:
    "Éditeur du site, coordonnées, hébergement, propriété intellectuelle et limitation de responsabilité de l'agence ADIMEN.",
  chemin: CHEMIN,
});

export default function MentionsLegales() {
  return (
    <>
      <DonneesStructurees donnees={jsonLdFilAriane(maillons)} />

      <HeroPage
        etiquette="Informations légales"
        titre={['Mentions légales']}
        chapeau="Identité de l'éditeur du site, conditions d'utilisation et limites de responsabilité."
        maillons={maillons}
      />

      <section className="section">
        <div className="cadre-etroit">
          <div className="prose max-w-none">
            <h2>Éditeur du site</h2>
            <p>
              <strong>{agence.nomLegal}</strong>
              <br />
              {bureauPrincipal.rue}
              <br />
              {bureauPrincipal.npa} {bureauPrincipal.localite}, Suisse
              <br />
              Numéro IDE : {agence.ide}
            </p>
            <p>
              Téléphone :{' '}
              <a href={`tel:${agence.telephonePrincipal.replace(/\s/g, '')}`}>
                {agence.telephonePrincipalAffiche}
              </a>
              <br />
              Courriel : <a href={`mailto:${agence.email}`}>{agence.email}</a>
              <br />
              Site : <a href={SITE_URL}>{SITE_URL.replace('https://', '')}</a>
            </p>

            <h2>Activité et autorisations</h2>
            <p>
              L’agence exerce une activité de détective privé. Elle est agréée par le Conseil d’État
              à Genève, et chacun de ses agents est titulaire de l’autorisation délivrée par le
              Département de la sécurité et de l’économie.
            </p>

            <h2>Établissements</h2>
            <ul>
              {bureaux.map((bureau) => (
                <li key={bureau.id}>
                  <strong>{bureau.ville}</strong> — {bureau.rue}, {bureau.npa} {bureau.localite}
                  {bureau.telephoneAffiche ? ` — ${bureau.telephoneAffiche}` : ''}
                </li>
              ))}
            </ul>

            <h2>Hébergement</h2>
            <p>
              Le site est hébergé par un prestataire d’infrastructure. Les coordonnées exactes de
              l’hébergeur sont à compléter par l’éditeur avant la mise en ligne, en fonction de
              l’hébergement retenu.
            </p>

            <h2>Propriété intellectuelle</h2>
            <p>
              L’ensemble des contenus de ce site — textes, illustrations, éléments graphiques,
              représentations tridimensionnelles et code — est protégé par le droit d’auteur. Toute
              reproduction, représentation ou adaptation, totale ou partielle, sur quelque support
              que ce soit, est interdite sans autorisation écrite préalable.
            </p>
            <p>
              Les illustrations et les représentations graphiques du territoire présentes sur ce
              site ont été produites spécifiquement pour lui. Elles ne représentent ni une personne
              réelle, ni un lieu d’intervention déterminé.
            </p>

            <h2>Limitation de responsabilité</h2>
            <p>
              Les informations publiées sur ce site sont fournies à titre indicatif. Elles décrivent
              des prestations dont les modalités précises, la faisabilité et le coût sont établis au
              cas par cas, lors d’un entretien et dans un devis écrit. Aucune information figurant
              sur ce site ne constitue un engagement contractuel, ni un conseil juridique.
            </p>
            <p>
              L’éditeur ne saurait être tenu responsable des dommages résultant de l’utilisation du
              site, d’une interruption de service, ou du contenu des sites tiers vers lesquels des
              liens sont proposés.
            </p>

            <h2>Liens sortants</h2>
            <p>
              Ce site peut renvoyer vers des ressources externes. Ces liens sont proposés pour la
              commodité du lecteur&nbsp;; l’éditeur n’exerce aucun contrôle sur leur contenu et n’en
              assume pas la responsabilité.
            </p>

            <h2>Droit applicable</h2>
            <p>
              Le présent site et son utilisation sont soumis au droit suisse. Le for est à Genève,
              sous réserve des dispositions impératives contraires.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
