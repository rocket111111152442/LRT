"use client";

import { useActionState } from "react";
import { updateProgrammeAction } from "@/app/actions/admin";
import { Field, FormError, FormSuccess, SubmitButton } from "@/components/forms";
import type { FormState } from "@/lib/formAction";

const etatInitial: FormState = {};

/**
 * Réglage du programme « portez-le, publiez-le ».
 *
 * La récompense est un choix commercial : elle se change ici, pas dans le code.
 * Le texte saisi s'affiche tel quel sur la page publique.
 */
export function ProgrammeForm({
  actif,
  recompense,
  delai,
}: {
  actif: boolean;
  recompense: string;
  delai: string;
}) {
  const [etat, action] = useActionState(updateProgrammeAction, etatInitial);

  return (
    <form action={action} className="space-y-5">
      {etat.success && <FormSuccess message={etat.message} />}
      <FormError message={etat.errors?.form} />

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="actif"
          defaultChecked={actif}
          className="h-4 w-4 accent-[color:var(--color-ink)]"
        />
        Programme visible sur la boutique
      </label>

      <Field
        label="Récompense annoncée"
        name="recompense"
        defaultValue={recompense}
        required
        error={etat.errors?.recompense}
        hint="Affiché en grand sur la page. Exemple : « −15 % sur votre prochaine commande »."
      />

      <Field
        label="Délai de réponse annoncé"
        name="delai"
        defaultValue={delai}
        required
        error={etat.errors?.delai}
        hint="Exemple : « 48 heures ouvrées »."
      />

      <SubmitButton className="btn btn-sm self-start" pendingLabel="Enregistrement…">
        Enregistrer le programme
      </SubmitButton>
    </form>
  );
}
