/** Concatène des classes en ignorant les valeurs vides. */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Transforme un numéro affiché en lien `tel:` exploitable. */
export function lienTel(numero: string): string {
  return `tel:${numero.replace(/[^\d+]/g, '')}`;
}

/** Construit un lien Google Maps de recherche à partir d'une adresse. */
export function lienPlan(adresse: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresse)}`;
}
