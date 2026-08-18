"use client";

import { useActionState } from "react";
import { repairTextsAction } from "@/app/actions/admin";
import { FormError, FormSuccess, SubmitButton } from "@/components/forms";
import type { FormState } from "@/lib/formAction";

const etatInitial: FormState = {};

/**
 * Proposé uniquement quand il y a quelque chose à réparer : un bouton qui ne
 * sert à rien la plupart du temps finit par ne plus être lu.
 */
export function RepairTextsButton({ nombre }: { nombre: number }) {
  const [etat, action] = useActionState(async () => repairTextsAction(), etatInitial);

  if (nombre === 0 && !etat.message) return null;

  return (
    <section className="border border-[color:var(--color-ink)] p-5">
      <p className="label mb-3">Textes à réparer</p>
      <p className="mb-5 max-w-[62ch] text-sm leading-relaxed">
        {nombre} fiche{nombre > 1 ? "s" : ""} contien{nombre > 1 ? "nent" : "t"} du
        texte importé où les accents et les apostrophes sont restés codés
        (« L&amp;rsquo;instinct » au lieu de « L&apos;instinct »). Un clic les
        remet d&apos;aplomb — les textes que vous avez écrits ne sont pas
        touchés.
      </p>

      <form action={action} className="flex flex-col gap-4">
        <FormError message={etat.errors?.form} />
        <FormSuccess message={etat.message} />
        <SubmitButton className="btn btn-sm self-start" pendingLabel="Réparation…">
          Réparer les textes
        </SubmitButton>
      </form>
    </section>
  );
}
