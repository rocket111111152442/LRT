import type { Metadata } from 'next';

import DonneesStructurees from '@/components/DonneesStructurees';
import PageLocale from '@/components/PageLocale';
import { villeParId } from '@/content/villes';
import { SITE_URL } from '@/content/site';
import { jsonLdFilAriane, type MailleFil } from '@/lib/jsonld';
import { construireMeta } from '@/lib/seo';

const ville = villeParId('geneve');

const maillons: readonly MailleFil[] = [
  { nom: 'Accueil', chemin: '/' },
  { nom: 'Implantations', chemin: '/detective-geneve/' },
  { nom: ville.bureau.ville, chemin: ville.chemin },
];

export const metadata: Metadata = construireMeta({
  titre: ville.metaTitre,
  description: ville.metaDescription,
  chemin: ville.chemin,
});

/**
 * Fiche d'établissement local. Elle reprend l'identifiant déjà déclaré par
 * l'organisation dans la mise en page racine, afin que les deux descriptions
 * du même bureau ne se contredisent pas.
 */
function jsonLdEtablissement() {
  const { bureau } = ville;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#bureau-${bureau.id}`,
    name: `Agence ADIMEN — ${bureau.ville}`,
    url: `${SITE_URL}${ville.chemin}`,
    description: ville.metaDescription,
    address: {
      '@type': 'PostalAddress',
      streetAddress: bureau.rue,
      postalCode: bureau.npa,
      addressLocality: bureau.localite,
      addressRegion: bureau.canton,
      addressCountry: 'CH',
    },
    geo: { '@type': 'GeoCoordinates', latitude: bureau.lat, longitude: bureau.lng },
    ...(bureau.telephone ? { telephone: bureau.telephone } : {}),
    areaServed: ville.secteurs.map((secteur) => ({ '@type': 'Place', name: secteur })),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '20:00',
    },
  };
}

export default function DetectiveGeneve() {
  return (
    <>
      <DonneesStructurees donnees={jsonLdFilAriane(maillons)} />
      <DonneesStructurees donnees={jsonLdEtablissement()} />
      <PageLocale ville={ville} maillons={maillons} />
    </>
  );
}
