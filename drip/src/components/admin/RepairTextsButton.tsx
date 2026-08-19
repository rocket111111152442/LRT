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
      <p className="label mb-3">Textes à corriger</p>
      <p className="mb-5 max-w-[62ch] text-sm leading-relaxed">
        {nombre} texte{nombre > 1 ? "s" : ""} importé{nombre > 1 ? "s" : ""} de
        Printify {nombre > 1 ? "sont" : "est"} à reprendre : accents et
        apostrophes restés codés (« L&amp;rsquo;instinct » au lieu de
        « L&apos;instinct »), coloris et tailles encore en anglais
        (« Black / One size »). Un clic les remet d&apos;aplomb — les textes
        que vous avez écrits vous-même ne sont pas touchés.
      </p>

      <form action={action} className="flex flex-col gap-4">
        <FormError message={etat.errors?.form} />
        <FormSuccess message={etat.message} />
        <SubmitButton className="btn btn-sm self-start" pendingLabel="Correction…">
          Corriger les textes
        </SubmitButton>
      </form>
    </section>
  );
}
