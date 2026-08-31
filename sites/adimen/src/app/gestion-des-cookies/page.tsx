import type { Metadata } from 'next';
import Link from 'next/link';

import DonneesStructurees from '@/components/DonneesStructurees';
import HeroPage from '@/components/HeroPage';
import { agence } from '@/content/site';
import { jsonLdFilAriane, type MailleFil } from '@/lib/jsonld';
import { construireMeta } from '@/lib/seo';

const CHEMIN = '/gestion-des-cookies/';

const maillons: readonly MailleFil[] = [
  { nom: 'Accueil', chemin: '/' },
  { nom: 'Gestion des cookies', chemin: CHEMIN },
];

export const metadata: Metadata = construireMeta({
  titre: 'Gestion des cookies',
  description:
    "Ce site ne dépose aucun cookie de mesure d'audience ni de publicité. Détail de ce qui est stocké dans votre navigateur et de la manière de l'effacer.",
  chemin: CHEMIN,
});

export default function GestionCookies() {
  return (
    <>
      <DonneesStructurees donnees={jsonLdFilAriane(maillons)} />

      <HeroPage
        etiquette="Cookies et stockage local"
        titre={['Gestion', 'des cookies']}
        chapeau="Ce site ne dépose aucun cookie de mesure d'audience, de profilage ou de publicité. Il n'affiche donc pas de bandeau de consentement : il n'y a rien à accepter ni à refuser."
        maillons={maillons}
      />

      <section className="section">
        <div className="cadre-etroit">
          <div className="prose max-w-none">
            <h2>Ce qui est réellement stocké</h2>
            <p>
              Une seule information est enregistrée dans votre navigateur, et uniquement le temps de
              votre visite :
            </p>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9375rem',
                marginTop: '1rem',
              }}
            >
              <thead>
                <tr>
                  <th
                    scope="col"
                    style={{
                      textAlign: 'left',
                      padding: '0.75rem 0',
                      borderBottom: '1px solid var(--trait)',
                      color: 'var(--color-ivoire)',
                    }}
                  >
                    Clé
                  </th>
                  <th
                    scope="col"
                    style={{
                      textAlign: 'left',
                      padding: '0.75rem 0',
                      borderBottom: '1px solid var(--trait)',
                      color: 'var(--color-ivoire)',
                    }}
                  >
                    Rôle
                  </th>
                  <th
                    scope="col"
                    style={{
                      textAlign: 'left',
                      padding: '0.75rem 0',
                      borderBottom: '1px solid var(--trait)',
                      color: 'var(--color-ivoire)',
                    }}
                  >
                    Durée
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.75rem 1rem 0.75rem 0', verticalAlign: 'top' }}>
                    <code>adimen-intro-vue</code>
                  </td>
                  <td style={{ padding: '0.75rem 1rem 0.75rem 0', verticalAlign: 'top' }}>
                    Mémorise que l’animation d’ouverture a déjà été jouée, afin de ne pas la rejouer
                    à chaque page.
                  </td>
                  <td style={{ padding: '0.75rem 0', verticalAlign: 'top' }}>
                    Effacée à la fermeture de l’onglet
                  </td>
                </tr>
              </tbody>
            </table>
            <p>
              Il ne s’agit pas d’un cookie mais d’une entrée de <em>sessionStorage</em>&nbsp;: elle
              n’est jamais transmise au serveur, ne permet aucune identification et disparaît dès
              que vous fermez l’onglet.
            </p>

            <h2>Ce que ce site n’utilise pas</h2>
            <ul>
              <li>aucun outil de mesure d’audience ;</li>
              <li>aucun traceur publicitaire ni cookie de reciblage ;</li>
              <li>aucun bouton ni widget de réseau social ;</li>
              <li>
                aucune police de caractères chargée depuis un serveur tiers — les polices sont
                servies depuis ce site, ce qui évite de communiquer votre adresse IP à un
                fournisseur externe.
              </li>
            </ul>

            <h2>Contenus externes</h2>
            <p>
              Si des vidéos ou des reportages hébergés par des tiers venaient à être intégrés au
              site, ils ne seraient chargés qu’après une action explicite de votre part, afin
              qu’aucune donnée ne soit transmise à ces tiers sans votre accord.
            </p>

            <h2>Effacer ces données</h2>
            <p>
              Fermer l’onglet suffit. Vous pouvez également vider le stockage du site depuis les
              réglages de confidentialité de votre navigateur, ou naviguer en fenêtre privée.
            </p>

            <h2>En savoir plus</h2>
            <p>
              Le traitement de vos données personnelles est décrit dans notre{' '}
              <Link href="/politique-de-confidentialite/">politique de confidentialité</Link>. Pour
              toute question, écrivez à <a href={`mailto:${agence.email}`}>{agence.email}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
