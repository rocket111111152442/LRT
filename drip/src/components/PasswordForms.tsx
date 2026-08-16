"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  forgotPasswordAction,
  resetPasswordAction,
  updateProfileAction,
  type FormState,
} from "@/app/actions/auth";
import { Checkbox, Field, FormError, FormSuccess, SubmitButton } from "@/components/forms";

const initialState: FormState = {};

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, initialState);

  if (state.success) {
    return <FormSuccess message={state.message} />;
  }

  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state.errors?.form} />

      <Field
        label="Adresse e-mail"
        name="email"
        type="email"
        required
        autoComplete="email"
        error={state.errors?.email}
        placeholder="vous@exemple.com"
      />

      <SubmitButton pendingLabel="Envoi…">Recevoir le lien</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      <FormError message={state.errors?.form} />

      <Field
        label="Nouveau mot de passe"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        error={state.errors?.password}
        hint="10 caractères minimum."
      />

      <SubmitButton pendingLabel="Enregistrement…">
        Définir le mot de passe
      </SubmitButton>
    </form>
  );
}

export function ProfileForm({
  firstName,
  lastName,
  phone,
  acceptsMarketing,
}: {
  firstName: string;
  lastName: string;
  phone: string;
  acceptsMarketing: boolean;
}) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.success && <FormSuccess message={state.message} />}
      <FormError message={state.errors?.form} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Prénom"
          name="firstName"
          required
          defaultValue={firstName}
          error={state.errors?.firstName}
        />
        <Field label="Nom" name="lastName" defaultValue={lastName} error={state.errors?.lastName} />
      </div>

      <Field
        label="Téléphone"
        name="phone"
        type="tel"
        defaultValue={phone}
        error={state.errors?.phone}
        hint="Utilisé uniquement par le transporteur en cas de souci de livraison."
      />

      <Checkbox
        name="acceptsMarketing"
        defaultChecked={acceptsMarketing}
        label="Recevoir les annonces de sorties et de restocks."
      />

      <SubmitButton className="btn">Enregistrer</SubmitButton>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.success && <FormSuccess message={state.message} />}
      <FormError message={state.errors?.form} />

      <Field
        label="Mot de passe actuel"
        name="currentPassword"
        type="password"
        required
        autoComplete="current-password"
        error={state.errors?.currentPassword}
      />

      <Field
        label="Nouveau mot de passe"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        error={state.errors?.password}
        hint="10 caractères minimum."
      />

      <SubmitButton className="btn">Changer le mot de passe</SubmitButton>
    </form>
  );
}
