import type { Property } from "./types";

/**
 * IMPORTANT — biens de démonstration.
 * L’environnement d’exécution de ce concept ne permet pas d’accéder au
 * flux réel des biens Courvoisier (voir docs/courvoisier-audit.md §0 et
 * §6). Les biens ci-dessous illustrent le gabarit (listing, filtres, fiche
 * détail) avec des adresses volontairement génériques (aucun numéro de
 * rue), des prix arrondis et un marquage `isDemoContent: true` répercuté
 * dans l’interface. Ils ne doivent jamais être présentés comme des
 * annonces réelles — à remplacer par la connexion au flux/CRM réel de
 * l’agence avant toute mise en production.
 */
export const properties: Property[] = [
  {
    slug: "maison-contemporaine-rolle",
    transaction: "vente",
    category: "Maison",
    title: "Maison contemporaine avec vue sur le lac",
    locality: "Rolle",
    canton: "VD",
    price: 2450000,
    rooms: 6.5,
    surface: 220,
    landSurface: 650,
    yearBuilt: 2019,
    description:
      "Une architecture contemporaine ouverte sur le Léman, plain-pied sur jardin, matériaux nobles et grandes baies vitrées orientées sud-ouest.",
    highlights: ["Vue lac dégagée", "Jardin paysager", "Garage double"],
    agencyId: "rolle",
    featured: true,
    isDemoContent: true,
  },
  {
    slug: "attique-lausanne-ouchy",
    transaction: "vente",
    category: "Appartement",
    title: "Attique avec terrasse panoramique",
    locality: "Lausanne — Ouchy",
    canton: "VD",
    price: 1850000,
    rooms: 4.5,
    surface: 145,
    yearBuilt: 2015,
    description:
      "Dernier étage d’une résidence de standing à deux pas du lac, terrasse traversante, prestations haut de gamme et double parking en sous-sol.",
    highlights: ["Terrasse de 60 m²", "Deux places de parc", "Cave"],
    agencyId: "lausanne",
    featured: true,
    isDemoContent: true,
  },
  {
    slug: "immeuble-rendement-lonay",
    transaction: "vente",
    category: "Immeuble",
    title: "Immeuble de rendement, six unités locatives",
    locality: "Lonay",
    canton: "VD",
    price: 4200000,
    rooms: 0,
    surface: 720,
    yearBuilt: 1998,
    description:
      "Immeuble entièrement loué, six appartements de 2.5 à 4.5 pièces, entretien régulier et rendement locatif stable sur le long terme.",
    highlights: ["Rendement net stable", "Entretien à jour", "Proche gare"],
    agencyId: "lonay",
    isDemoContent: true,
  },
  {
    slug: "appartement-location-lausanne-centre",
    transaction: "location",
    category: "Appartement",
    title: "3.5 pièces rénové en hyper-centre",
    locality: "Lausanne — Centre",
    canton: "VD",
    price: 2450,
    rooms: 3.5,
    surface: 78,
    yearBuilt: 1932,
    description:
      "Cachet de l’ancien préservé — parquet, moulures, hauteur sous plafond — et cuisine entièrement rénovée, à deux pas de la place Saint-François.",
    highlights: ["Cachet de l’ancien", "Cuisine rénovée", "Balcon"],
    agencyId: "lausanne",
    featured: true,
    isDemoContent: true,
  },
  {
    slug: "villa-location-lonay",
    transaction: "location",
    category: "Maison",
    title: "Villa individuelle avec jardin clos",
    locality: "Lonay",
    canton: "VD",
    price: 4200,
    rooms: 5.5,
    surface: 180,
    landSurface: 400,
    yearBuilt: 2008,
    description:
      "Villa individuelle sur parcelle close, quatre chambres, bureau indépendant et garage, dans un quartier résidentiel calme.",
    highlights: ["Jardin clos", "Bureau indépendant", "Quartier calme"],
    agencyId: "lonay",
    isDemoContent: true,
  },
  {
    slug: "terrain-a-batir-la-cote",
    transaction: "vente",
    category: "Terrain",
    title: "Terrain à bâtir, vue dégagée sur le Léman",
    locality: "La Côte",
    canton: "VD",
    price: null,
    priceOnRequest: true,
    rooms: 0,
    surface: 0,
    landSurface: 950,
    description:
      "Parcelle équipée en zone villa, orientation sud, potentiel de construction à confirmer selon règlement communal en vigueur.",
    highlights: ["Vue dégagée", "Zone villa", "Orientation sud"],
    agencyId: "rolle",
    isDemoContent: true,
  },
];

export function getProperty(slug: string): Property | undefined {
  return properties.find((p) => p.slug === slug);
}

export function getSimilarProperties(property: Property, limit = 3): Property[] {
  return properties
    .filter(
      (p) =>
        p.slug !== property.slug &&
        p.transaction === property.transaction &&
        p.category === property.category
    )
    .slice(0, limit)
    .concat(
      properties.filter(
        (p) => p.slug !== property.slug && p.transaction === property.transaction
      )
    )
    .filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i)
    .slice(0, limit);
}
