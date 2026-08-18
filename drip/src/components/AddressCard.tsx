"use client";

import { useState } from "react";
import { AddressForm } from "@/components/AddressForm";

const COUNTRY_NAMES = new Intl.DisplayNames(["fr"], { type: "region" });

type Address = {
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

export function AddressCard({
  address,
  deleteAction,
}: {
  address: Address;
  deleteAction: (formData: FormData) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (editing) {
    return (
      <div className="border-t border-[color:var(--color-hairline)] py-6 sm:pr-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="label">Modifier l&apos;adresse</h3>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="label-sm link-sweep text-[color:var(--color-smoke)]"
          >
            Annuler
          </button>
        </div>

        <AddressForm address={address} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <article className="border-t border-[color:var(--color-hairline)] py-6 sm:pr-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="label">{address.label || "Adresse"}</h3>
        {address.isDefault && <span className="tag">Par défaut</span>}
      </div>

      <address className="text-sm not-italic leading-relaxed text-[color:var(--color-ink-soft)]">
        {address.fullName}
        <br />
        {address.line1}
        {address.line2 && (
          <>
            <br />
            {address.line2}
          </>
        )}
        <br />
        {address.postalCode} {address.city}
        <br />
        {COUNTRY_NAMES.of(address.country) ?? address.country}
        {address.phone && (
          <>
            <br />
            {address.phone}
          </>
        )}
      </address>

      <div className="mt-4 flex items-center gap-5">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="label-sm link-sweep"
        >
          Modifier
        </button>

        {confirming ? (
          <form action={deleteAction} className="flex items-center gap-4">
            <input type="hidden" name="addressId" value={address.id} />
            <button type="submit" className="label-sm link-sweep">
              Confirmer
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="label-sm text-[color:var(--color-smoke)] link-sweep"
            >
              Annuler
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="label-sm text-[color:var(--color-smoke)] link-sweep"
          >
            Supprimer
          </button>
        )}
      </div>
    </article>
  );
}
