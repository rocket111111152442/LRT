import {
  SITE_URL,
  agence,
  bureauPrincipal,
  bureaux,
  horaires,
  tarifs,
  zonesIntervention,
} from '@/content/site';

/**
 * Données structurées JSON-LD.
 *
 * Règle appliquée : aucune note, aucun avis, aucun chiffre non vérifié n'est
 * publié. Les propriétés `aggregateRating` et `review` sont volontairement
 * absentes — les renseigner sans avis réels constituerait un balisage trompeur.
 */

const IDENTIFIANT_ORGANISATION = `${SITE_URL}/#organisation`;

export function jsonLdOrganisation() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': IDENTIFIANT_ORGANISATION,
    name: agence.nom,
    legalName: agence.nomLegal,
    url: SITE_URL,
    email: agence.email,
    telephone: agence.telephonePrincipal,
    description:
      "Agence de détectives privés agréée par le Conseil d'État à Genève. Enquêtes privées et commerciales, filature, surveillance et contre-mesures électroniques en Suisse romande.",
    slogan: agence.baseline,
    knowsLanguage: ['fr-CH'],
    sameAs: [agence.facebook],
    address: {
      '@type': 'PostalAddress',
      streetAddress: bureauPrincipal.rue,
      postalCode: bureauPrincipal.npa,
      addressLocality: bureauPrincipal.localite,
      addressRegion: bureauPrincipal.canton,
      addressCountry: 'CH',
    },
    areaServed: zonesIntervention.map((zone) => ({ '@type': 'AdministrativeArea', name: zone })),
    location: bureaux.map((bureau) => ({
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#bureau-${bureau.id}`,
      name: `${agence.nom} — ${bureau.ville}`,
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
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '20:00',
      },
      parentOrganization: { '@id': IDENTIFIANT_ORGANISATION },
    })),
    priceRange: `${tarifs.devise} ${tarifs.min}–${tarifs.max} ${tarifs.unite}`,
    openingHours: 'Mo-Fr 08:00-20:00',
    availableLanguage: 'fr',
    additionalProperty: {
      '@type': 'PropertyValue',
      name: 'Intervention terrain',
      value: horaires.terrain,
    },
  };
}

export function jsonLdSiteWeb() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#site`,
    url: SITE_URL,
    name: agence.nom,
    inLanguage: 'fr-CH',
    publisher: { '@id': IDENTIFIANT_ORGANISATION },
  };
}

export type MailleFil = { nom: string; chemin: string };

export function jsonLdFilAriane(maillons: readonly MailleFil[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: maillons.map((maillon, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: maillon.nom,
      item: `${SITE_URL}${maillon.chemin}`,
    })),
  };
}

export function jsonLdService(nom: string, description: string, chemin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: nom,
    description,
    url: `${SITE_URL}${chemin}`,
    serviceType: 'Enquête privée',
    provider: { '@id': IDENTIFIANT_ORGANISATION },
    areaServed: zonesIntervention.map((zone) => ({ '@type': 'AdministrativeArea', name: zone })),
  };
}

/**
 * FAQPage — à n'utiliser que sur une page où les questions et réponses sont
 * réellement visibles par le visiteur, conformément aux règles de Google.
 */
export function jsonLdFaq(questions: readonly { question: string; reponse: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.reponse },
    })),
  };
}
