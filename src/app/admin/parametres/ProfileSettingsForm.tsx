"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  parseShopOpeningHours,
  SHOP_DAYS,
  ShopDayKey,
  stringifyShopOpeningHours,
} from "@/lib/shopHours";

type Profile = {
  companyName: string;
  slug: string;
  ownerEmail: string;
  publicDescription: string | null;
  shopAddress: string | null;
  shopPostalCode: string | null;
  shopCity: string | null;
  shopCountry: string | null;
  shopPhone: string | null;
  shopEmail: string | null;
  shopOpeningHours: string | null;
};

type FormValues = Record<keyof Omit<Profile, "slug" | "ownerEmail">, string>;

const emptyValues: FormValues = {
  companyName: "",
  publicDescription: "",
  shopAddress: "",
  shopPostalCode: "",
  shopCity: "",
  shopCountry: "",
  shopPhone: "",
  shopEmail: "",
  shopOpeningHours: stringifyShopOpeningHours(parseShopOpeningHours(null)),
};

function valuesFromProfile(profile: Profile): FormValues {
  return {
    companyName: profile.companyName ?? "",
    publicDescription: profile.publicDescription ?? "",
    shopAddress: profile.shopAddress ?? "",
    shopPostalCode: profile.shopPostalCode ?? "",
    shopCity: profile.shopCity ?? "",
    shopCountry: profile.shopCountry ?? "",
    shopPhone: profile.shopPhone ?? "",
    shopEmail: profile.shopEmail ?? profile.ownerEmail ?? "",
    shopOpeningHours: stringifyShopOpeningHours(
      parseShopOpeningHours(profile.shopOpeningHours),
    ),
  };
}

export function ProfileSettingsForm() {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [publicSlug, setPublicSlug] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      try {
        const response = await fetch("/api/admin/profile");
        const payload = await response.json();

        if (!response.ok) {
          setError(payload.error ?? "Chargement impossible.");
          return;
        }

        if (!ignore && payload.profile) {
          setValues(valuesFromProfile(payload.profile));
          setPublicSlug(payload.profile.slug ?? "");
        }
      } catch {
        if (!ignore) {
          setError("Chargement impossible.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  function updateField(name: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setMessage("");
    setError("");
  }

  function updateOpeningHours(
    day: ShopDayKey,
    patch: Partial<{ open: boolean; opensAt: string; closesAt: string }>,
  ) {
    setValues((current) => {
      const schedule = parseShopOpeningHours(current.shopOpeningHours);

      return {
        ...current,
        shopOpeningHours: stringifyShopOpeningHours({
          ...schedule,
          [day]: { ...schedule[day], ...patch },
        }),
      };
    });
    setMessage("");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Enregistrement impossible.");
        return;
      }

      setValues(valuesFromProfile(payload.profile));
      setMessage("Parametres enregistres.");
    } catch {
      setError("Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Chargement des parametres...
      </div>
    );
  }

  const openingHours = parseShopOpeningHours(values.shopOpeningHours);

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {publicSlug ? (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Lien public : <strong>/nouvelle-reparation?compte={publicSlug}</strong>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="companyName" label="Nom du magasin" value={values.companyName} onChange={updateField} />
        <Field name="shopPhone" label="Telephone public" value={values.shopPhone} onChange={updateField} />
        <Field name="shopEmail" label="Email public" value={values.shopEmail} onChange={updateField} />
        <Field name="shopAddress" label="Adresse" value={values.shopAddress} onChange={updateField} />
        <Field name="shopPostalCode" label="Code postal" value={values.shopPostalCode} onChange={updateField} />
        <Field name="shopCity" label="Ville" value={values.shopCity} onChange={updateField} />
        <Field name="shopCountry" label="Pays" value={values.shopCountry} onChange={updateField} />
        <Field name="publicDescription" label="Description publique" value={values.publicDescription} onChange={updateField} multiline />
      </div>

      <section className="grid gap-3 rounded-xl border border-sky-100 bg-sky-50/60 p-4">
        <div className="grid gap-1">
          <h2 className="text-base font-semibold text-slate-950">
            Horaires d&apos;ouverture
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            Cochez les jours ouverts. Ces horaires servent a proposer votre
            magasin uniquement quand il est ouvert.
          </p>
        </div>
        <div className="grid gap-3">
          {SHOP_DAYS.map((day) => {
            const dayHours = openingHours[day.key];

            return (
              <div
                key={day.key}
                className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[160px_1fr_1fr] sm:items-center"
              >
                <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-900">
                  <input
                    type="checkbox"
                    checked={dayHours.open}
                    onChange={(event) =>
                      updateOpeningHours(day.key, { open: event.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-sky-600"
                  />
                  {day.label}
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ouverture
                  <input
                    type="time"
                    value={dayHours.opensAt}
                    disabled={!dayHours.open}
                    onChange={(event) =>
                      updateOpeningHours(day.key, { opensAt: event.target.value })
                    }
                    className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-950 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </label>
                <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Fermeture
                  <input
                    type="time"
                    value={dayHours.closesAt}
                    disabled={!dayHours.open}
                    onChange={(event) =>
                      updateOpeningHours(day.key, { closesAt: event.target.value })
                    }
                    className="min-h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-950 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </label>
              </div>
            );
          })}
        </div>
      </section>

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="min-h-11 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
}: {
  name: keyof FormValues;
  label: string;
  value: string;
  onChange: (name: keyof FormValues, value: string) => void;
  type?: string;
  multiline?: boolean;
}) {
  const id = `profile-${name}`;
  const className =
    "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

  return (
    <label className={`grid gap-2 text-sm font-medium text-slate-800 ${multiline ? "sm:col-span-2" : ""}`} htmlFor={id}>
      {label}
      {multiline ? (
        <textarea
          id={id}
          rows={4}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          className={className}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          className={className}
        />
      )}
    </label>
  );
}
