"use client";

import { useState } from "react";
import { MAX_PAR_LIGNE } from "@/lib/shop";

/**
 * Sélecteur de quantité, partagé par la fiche produit, le tiroir et le panier.
 *
 * Il était recopié trois fois, avec trois comportements différents : un plafond
 * silencieux ici, aucun là, et nulle part le moyen de saisir un nombre. Cliquer
 * cinquante fois sur « + » n'est pas une façon de commander cinquante pièces.
 *
 * Le champ accepte donc la frappe directe, et les deux boutons s'éteignent aux
 * bornes plutôt que de rester actifs sans effet.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = MAX_PAR_LIGNE,
  size = "md",
  disabled = false,
}: {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  disabled?: boolean;
}) {
  // Le champ garde son propre texte pendant la saisie : sans cela, effacer pour
  // taper « 12 » renverrait la quantité à 1 dès le premier caractère retiré.
  const [saisie, setSaisie] = useState(String(value));

  // Quand la quantité change ailleurs — bouton « + », autre onglet, réponse du
  // serveur — le champ suit. L'ajustement se fait pendant le rendu : c'est la
  // forme recommandée pour un état dérivé d'une prop, et elle évite le rendu
  // intermédiaire qu'un effet provoquerait.
  const [valeurVue, setValeurVue] = useState(value);

  if (valeurVue !== value) {
    setValeurVue(value);
    setSaisie(String(value));
  }

  const borner = (quantite: number) => Math.min(max, Math.max(min, quantite));

  const valider = () => {
    const nombre = Number.parseInt(saisie.replace(/\D/g, ""), 10);

    // Champ vide ou illisible : on revient à la quantité en cours plutôt que
    // d'inventer une valeur.
    if (!Number.isFinite(nombre)) {
      setSaisie(String(value));
      return;
    }

    const borne = borner(nombre);
    setSaisie(String(borne));
    if (borne !== value) onChange(borne);
  };

  const bouton =
    size === "sm"
      ? "h-9 w-9 text-sm"
      : "h-full w-11";

  const classeBouton = `${bouton} transition-colors hover:bg-[color:var(--color-ink)] hover:text-[color:var(--color-paper)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit`;

  return (
    <div className="flex items-center border border-[color:var(--color-hairline)]">
      <button
        type="button"
        onClick={() => onChange(borner(value - 1))}
        disabled={disabled || value <= min}
        className={classeBouton}
        aria-label="Diminuer la quantité"
      >
        −
      </button>

      <input
        type="text"
        // `inputMode` ouvre le pavé numérique sur téléphone ; `type="number"`
        // ajouterait les flèches du navigateur par-dessus nos deux boutons.
        inputMode="numeric"
        autoComplete="off"
        value={saisie}
        disabled={disabled}
        onChange={(event) => setSaisie(event.target.value)}
        onBlur={valider}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        aria-label="Quantité"
        className={`${
          size === "sm" ? "w-9 text-xs" : "w-12 text-sm"
        } bg-transparent text-center font-mono outline-none focus:underline`}
      />

      <button
        type="button"
        onClick={() => onChange(borner(value + 1))}
        disabled={disabled || value >= max}
        className={classeBouton}
        aria-label="Augmenter la quantité"
        title={value >= max ? `Maximum ${max} par référence` : undefined}
      >
        +
      </button>
    </div>
  );
}
