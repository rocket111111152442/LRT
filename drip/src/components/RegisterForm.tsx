"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type FormState } from "@/app/actions/auth";
import { Checkbox, Field, FormError, SubmitButton } from "@/components/forms";

const initialState: FormState = {};

export function RegisterForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="suite" value={next ?? "/compte"} />

      <FormError message={state.errors?.form} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Prénom"
          name="firstName"
          required
          autoComplete="given-name"
          error={state.errors?.firstName}
          defaultValue={state.values?.firstName}
        />
        <Field
          label="Nom"
          name="lastName"
          autoComplete="family-name"
          error={state.errors?.lastName}
          defaultValue={state.values?.lastName}
        />
      </div>

      <Field
        label="Adresse e-mail"
        name="email"
        type="email"
        required
        autoComplete="email"
        error={state.errors?.email}
        defaultValue={state.values?.email}
        placeholder="vous@exemple.com"
      />

      <Field
        label="Mot de passe"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        error={state.errors?.password}
        hint="12 caractères minimum recommandés."
      />

      <div className="space-y-3 pt-2">
        <Checkbox
          name="acceptsTerms"
          error={state.errors?.acceptsTerms}
          defaultChecked={state.values?.acceptsTerms === "on"}
          label={
            <>
              J&apos;accepte les{" "}
              <Link href="/cgv" className="link-underline">
                conditions générales de vente
              </Link>{" "}
              et la{" "}
              <Link href="/confidentialite" className="link-underline">
                politique de confidentialité
              </Link>
              .
            </>
          }
        />

        <Checkbox
          name="acceptsMarketing"
          defaultChecked={state.values?.acceptsMarketing === "on"}
          label="Je veux être prévenu des sorties et des restocks (désinscription en un clic)."
        />
      </div>

      <SubmitButton pendingLabel="Création…">Créer mon compte</SubmitButton>
    </form>
  );
}
