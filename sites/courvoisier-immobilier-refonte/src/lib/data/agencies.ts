import type { Agency } from "./types";

/** Adresses et téléphone sourcés — voir docs/courvoisier-audit.md §1. */
export const agencies: Agency[] = [
  {
    id: "lausanne",
    name: "Courvoisier Immobilier — Lausanne",
    street: "Place de la Navigation 2",
    postalCode: "1006",
    city: "Lausanne",
    phone: "+41 21 728 50 50",
    phoneHref: "tel:+41217285050",
    mapsHref:
      "https://www.google.com/maps/search/?api=1&query=Place+de+la+Navigation+2%2C+1006+Lausanne",
    hours: "Lundi – vendredi, sur rendez-vous",
  },
  {
    id: "rolle",
    name: "Courvoisier Immobilier — Rolle",
    street: "Rue du Temple 7A",
    postalCode: "1180",
    city: "Rolle",
    phone: "+41 21 728 50 50",
    phoneHref: "tel:+41217285050",
    mapsHref:
      "https://www.google.com/maps/search/?api=1&query=Rue+du+Temple+7A%2C+1180+Rolle",
    hours: "Lundi – vendredi, sur rendez-vous",
  },
  {
    id: "lonay",
    name: "Courvoisier Immobilier — Lonay",
    street: "Route de Denges 10",
    postalCode: "1027",
    city: "Lonay",
    phone: "+41 21 728 50 50",
    phoneHref: "tel:+41217285050",
    mapsHref:
      "https://www.google.com/maps/search/?api=1&query=Route+de+Denges+10%2C+1027+Lonay",
    hours: "Lundi – vendredi, sur rendez-vous",
  },
];

export function getAgency(id: Agency["id"]): Agency {
  const agency = agencies.find((a) => a.id === id);
  if (!agency) throw new Error(`Agence inconnue : ${id}`);
  return agency;
}
