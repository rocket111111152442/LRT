/**
 * Helpers de dates isolés dans leur module : appelés depuis un composant, ils
 * gardent le rendu lisible et évitent de disséminer des calculs d'horodatage
 * dans les pages.
 */

export function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export function formatDateFr(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
