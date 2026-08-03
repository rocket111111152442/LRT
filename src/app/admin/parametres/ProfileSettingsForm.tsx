"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  parseShopOpeningHours,
  stringifyShopOpeningHours,
} from "@/lib/shopHours";
import { OpeningHoursEditor } from "@/components/OpeningHoursEditor";
import { GuideTaskHint, useGuideTask } from "../GuideTaskHint";

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
  shopLatitude: number | null;
  shopLongitude: number | null;
  shopSlotDurationMinutes: number;
  shopMaxAppointmentsPerSlot: number;
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
  shopLatitude: "",
  shopLongitude: "",
  shopSlotDurationMinutes: "60",
  shopMaxAppointmentsPerSlot: "1",
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
    shopLatitude:
      typeof profile.shopLatitude === "number" ? String(profile.shopLatitude) : "",
    shopLongitude:
      typeof profile.shopLongitude === "number" ? String(profile.shopLongitude) : "",
    shopSlotDurationMinutes: String(profile.shopSlotDurationMinutes ?? 60),
    shopMaxAppointmentsPerSlot: String(profile.shopMaxAppointmentsPerSlot ?? 1),
  };
}

export function ProfileSettingsForm({
  paymentStatus,
}: {
  paymentStatus?: string | null;
}) {
  const guideTask = useGuideTask(0);
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [publicSlug, setPublicSlug] = useState("");
  const [publicListed, setPublicListed] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const canPublish = paymentStatus === "PAID";
  const isPubliclyVisible = canPublish && publicListed;

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
          setPublicListed(payload.profile.publicListed !== false);
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

  function useCurrentPositionForShop() {
    setMessage("");
    setError("");

    if (!navigator.geolocation) {
      setError("Votre navigateur ne permet pas d'enregistrer la position GPS.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setValues((current) => ({
          ...current,
          shopLatitude: String(result.coords.latitude),
          shopLongitude: String(result.coords.longitude),
        }));
        setMessage(
          "Position GPS ajoutee. Cliquez sur Enregistrer pour la publier.",
        );
      },
      () => setError("Position GPS refusee ou indisponible."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
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
        body: JSON.stringify({
          ...values,
          publicListed: canPublish ? publicListed : false,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Enregistrement impossible.");
        return;
      }

      setValues(valuesFromProfile(payload.profile));
      setPublicListed(payload.profile.publicListed !== false);
      setMessage("Parametres enregistres.");
      if (guideTask.active) {
        guideTask.complete();
        return;
      }
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

      <section className={`grid gap-2 rounded-xl border p-4 transition ${
        isPubliclyVisible ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60"
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <h2 className="text-base font-semibold text-slate-950">
              Afficher ma boutique aux clients
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              {isPubliclyVisible
                ? "Votre boutique apparaît dans la recherche publique des réparateurs."
                : canPublish
                  ? "Votre boutique est masquée : elle n'apparaît plus dans la recherche publique. Votre lien direct reste fonctionnel."
                  : "Le référencement public de votre boutique est réservé aux abonnés Qoravo."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPubliclyVisible}
            aria-label={
              canPublish
                ? "Afficher ou masquer ma boutique"
                : "S'abonner pour afficher ma boutique"
            }
            onClick={() => {
              if (!canPublish) {
                window.location.href = `/pro/paiement?${new URLSearchParams({
                  compte: publicSlug,
                  raison: "boutique",
                }).toString()}`;
                return;
              }

              setPublicListed((value) => !value);
              setMessage("");
              setError("");
            }}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
              isPubliclyVisible ? "bg-emerald-500" : "bg-slate-300"
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
              isPubliclyVisible ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {isPubliclyVisible
            ? "Visible"
            : canPublish
              ? "Masquée"
              : "Abonnement requis - cliquez pour vous abonner"}
        </p>
      </section>

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

      <section className="grid gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
        <div className="grid gap-1">
          <h2 className="text-base font-semibold text-slate-950">
            Disponibilites et rendez-vous
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            Ces reglages servent a dire si le magasin a encore de la place.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            name="shopSlotDurationMinutes"
            label="Duree d'un creneau en minutes"
            type="number"
            value={values.shopSlotDurationMinutes}
            onChange={updateField}
          />
          <Field
            name="shopMaxAppointmentsPerSlot"
            label="Rendez-vous maximum par creneau"
            type="number"
            value={values.shopMaxAppointmentsPerSlot}
            onChange={updateField}
          />
        </div>
      </section>

      <section className="grid gap-3 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
        <div className="grid gap-1">
          <h2 className="text-base font-semibold text-slate-950">
            Position du magasin
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            Elle sert uniquement a classer votre boutique par distance quand un
            client cherche un reparateur proche de lui.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={useCurrentPositionForShop}
            className="min-h-10 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            Enregistrer ma position actuelle
          </button>
          <span className="text-sm text-slate-600">
            {values.shopLatitude && values.shopLongitude
              ? "Position GPS prete a etre enregistree."
              : "Aucune position GPS enregistree."}
          </span>
        </div>
      </section>

      <section className="grid gap-3 rounded-xl border border-sky-100 bg-sky-50/60 p-4">
        <div className="grid gap-1">
          <h2 className="text-base font-semibold text-slate-950">
            Horaires d&apos;ouverture
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            Ajoutez une ou plusieurs plages par jour. Entre deux plages, votre
            boutique est consideree comme fermee et aucun rendez-vous ne sera
            propose.
          </p>
        </div>
        <OpeningHoursEditor
          value={values.shopOpeningHours}
          onChange={(nextValue) =>
            updateField("shopOpeningHours", nextValue)
          }
        />
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
        <div className="grid justify-items-end">
          <GuideTaskHint active={guideTask.active}>
            Renseignez les informations de votre boutique, puis cliquez sur Enregistrer. Le guide reprendra automatiquement après la sauvegarde.
          </GuideTaskHint>
          <button
            type="submit"
            disabled={isSaving}
            className="min-h-11 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
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
