"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type FormState } from "@/app/actions/auth";
import { Field, FormError, FormSuccess, SubmitButton } from "@/components/forms";

const initialState: FormState = {};

export function LoginForm({
  next,
  notice,
}: {
  next?: string;
  notice?: string;
}) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="suite" value={next ?? "/compte"} />

      <FormSuccess message={notice} />
      <FormError message={state.errors?.form} />

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

      <div>
        <Field
          label="Mot de passe"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          error={state.errors?.password}
        />
        <Link
          href="/mot-de-passe-oublie"
          className="label-sm mt-3 inline-block text-[color:var(--color-smoke)] link-sweep"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      <SubmitButton pendingLabel="Connexion…">Se connecter</SubmitButton>
    </form>
  );
}
