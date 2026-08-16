"use client";

import { useActionState, useState } from "react";
import { saveAddressAction } from "@/app/actions/account";
import type { FormState } from "@/app/actions/auth";
import { Checkbox, Field, FormError, FormSuccess, SubmitButton } from "@/components/forms";
import { SHIPPING_COUNTRIES } from "@/lib/shop";

const COUNTRY_NAMES = new Intl.DisplayNames(["fr"], { type: "region" });

const initialState: FormState = {};

export function AddressForm({
  address,
  onDone,
}: {
  address?: {
    id: string;
    label: string | null;
    fullName: string;
    line1: string;
    line2: string | null;
    postalCode: string;
    city: string;
    country: string;
    phone: string | null;
    isDefault: boolean;
  };
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState(saveAddressAction, initialState);
  const [dismissed, setDismissed] = useState(false);

  if (state.success && !dismissed) {
    return (
      <div className="space-y-4">
        <FormSuccess message={state.message} />
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            onDone?.();
          }}
          className="btn btn-outline btn-sm"
        >
          Fermer
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {address && <input type="hidden" name="addressId" value={address.id} />}

      <FormError message={state.errors?.form} />

      <Field
        label="Libellé"
        name="label"
        defaultValue={address?.label ?? ""}
        placeholder="Maison, bureau…"
        error={state.errors?.label}
      />

      <Field
        label="Nom complet"
        name="fullName"
        required
        autoComplete="name"
        defaultValue={address?.fullName}
        error={state.errors?.fullName}
      />

      <Field
        label="Adresse"
        name="line1"
        required
        autoComplete="address-line1"
        defaultValue={address?.line1}
        error={state.errors?.line1}
      />

      <Field
        label="Complément"
        name="line2"
        autoComplete="address-line2"
        defaultValue={address?.line2 ?? ""}
        error={state.errors?.line2}
      />

      <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
        <Field
          label="Code postal"
          name="postalCode"
          required
          autoComplete="postal-code"
          defaultValue={address?.postalCode}
          error={state.errors?.postalCode}
        />
        <Field
          label="Ville"
          name="city"
          required
          autoComplete="address-level2"
          defaultValue={address?.city}
          error={state.errors?.city}
        />
      </div>

      <div>
        <label htmlFor="address-country" className="field-label">
          Pays *
        </label>
        <select
          id="address-country"
          name="country"
          defaultValue={address?.country ?? "FR"}
          className="field"
          autoComplete="country"
        >
          {SHIPPING_COUNTRIES.map((code) => (
            <option key={code} value={code}>
              {COUNTRY_NAMES.of(code) ?? code}
            </option>
          ))}
        </select>
      </div>

      <Field
        label="Téléphone"
        name="phone"
        type="tel"
        autoComplete="tel"
        defaultValue={address?.phone ?? ""}
        error={state.errors?.phone}
        hint="Transmis au transporteur pour la livraison."
      />

      <Checkbox
        name="isDefault"
        defaultChecked={address?.isDefault}
        label="Utiliser comme adresse par défaut."
      />

      <SubmitButton className="btn">
        {address ? "Mettre à jour" : "Ajouter l'adresse"}
      </SubmitButton>
    </form>
  );
}
