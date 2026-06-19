"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  normalizeSlug,
  ProSignupErrors,
  ProSignupInput,
  validateProSignupInput,
} from "@/lib/pro/signupValidation";
import {
  isFreeAccessCode,
  isPremiumDiscountCode,
} from "@/lib/pro/promoCodes";

const initialValues: ProSignupInput = {
  companyName: "",
  slug: "",
  ownerEmail: "",
  password: "",
  firebaseApiKey: "",
  firebaseProjectId: "",
  firebaseAppId: "",
  shopAddress: "",
  shopPostalCode: "",
  shopCity: "",
  shopCountry: "",
  shopPhone: "",
  shopEmail: "",
  shopOpeningHours: "",
  shopLatitude: "",
  shopLongitude: "",
  shopCapacityPerDay: "8",
  promoCode: "",
  emailCode: "",
  emailVerificationId: "",
};

export function ProSignupForm() {
  const [values, setValues] = useState<ProSignupInput>(initialValues);
  const [errors, setErrors] = useState<ProSignupErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [showQrHelp, setShowQrHelp] = useState(false);
  const usesFreeAccessCode = isFreeAccessCode(values.promoCode);
  const usesDiscountCode = isPremiumDiscountCode(values.promoCode);

  function updateField(name: keyof ProSignupInput, value: string) {
    setValues((current) => ({
      ...current,
      [name]: name === "slug" ? normalizeSlug(value) : value,
    }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError("");
    setMessage("");

    if (name !== "emailCode" && name !== "promoCode") {
      setCodeSent(false);
    }
  }

  async function sendSignupCode(data: ProSignupInput) {
    setSubmitError("");
    setMessage("");
    setIsSendingCode(true);

    try {
      const response = await fetch("/api/pro/email-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const apiErrors = payload.errors ?? {};

        setErrors(apiErrors);
        setSubmitError(
          payload.error ??
            (Object.keys(apiErrors).length > 0
              ? "Corrigez les champs indiques en rouge."
              : "Envoi du code impossible."),
        );
        return false;
      }

      setCodeSent(true);
      if (typeof payload.verificationId === "string") {
        setValues((current) => ({
          ...current,
          emailVerificationId: payload.verificationId,
        }));
      }
      setMessage(payload.message ?? "Code envoye. Verifiez votre boite email.");
      return true;
    } catch {
      setSubmitError("Envoi du code impossible.");
      return false;
    } finally {
      setIsSendingCode(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setMessage("");

    const validation = validateProSignupInput(values);

    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    if (!usesFreeAccessCode && !codeSent) {
      await sendSignupCode(validation.data);
      return;
    }

    if (
      !usesFreeAccessCode &&
      (!validation.data.emailCode || validation.data.emailCode.length < 6)
    ) {
      setErrors((current) => ({
        ...current,
        emailCode: "Code email requis.",
      }));
      setSubmitError("Entrez le code recu par email.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/pro/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
      });
      const payload = await response.json();

      if (!response.ok) {
        const apiErrors = payload.errors ?? {};

        setErrors(apiErrors);
        setSubmitError(
          payload.error ??
            (Object.keys(apiErrors).length > 0
              ? "Corrigez les champs indiques en rouge."
              : "Inscription impossible."),
        );
        return;
      }

      window.location.href = payload.redirectUrl;
    } catch {
      setSubmitError("Inscription impossible.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      noValidate
    >
      <fieldset className="grid gap-4">
        <legend className="mb-2 text-base font-semibold text-slate-950">
          Compte pro
        </legend>
        <p className="text-sm leading-6 text-slate-600">
          Vous avez deja un compte ?{" "}
          <Link
            href="/admin/login"
            className="font-semibold text-slate-950 underline-offset-4 hover:underline"
          >
            Se connecter
          </Link>
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="companyName"
            label="Nom de l'atelier"
            value={values.companyName}
            error={errors.companyName}
            onChange={updateField}
          />
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="pro-slug"
                className="text-sm font-medium text-slate-800"
              >
                Identifiant du QR code
              </label>
              <button
                type="button"
                onClick={() => setShowQrHelp((current) => !current)}
                aria-expanded={showQrHelp}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
              >
                ?
              </button>
            </div>
            <input
              id="pro-slug"
              type="text"
              value={values.slug}
              onChange={(event) => updateField("slug", event.target.value)}
              className="min-h-11 w-full min-w-0 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              aria-invalid={Boolean(errors.slug)}
            />
            {showQrHelp ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700">
                C est le nom court de votre atelier dans le lien du QR code.
                Exemple : si vous mettez <strong>atelier-centre</strong>, votre
                QR code enverra les clients vers le formulaire de cet atelier.
                Utilisez un nom simple, sans espace, sans accent, facile a
                reconnaitre.
              </div>
            ) : null}
            {errors.slug ? (
              <p className="text-sm text-red-700">{errors.slug}</p>
            ) : null}
          </div>
          <TextField
            name="ownerEmail"
            label="Email admin"
            type="email"
            value={values.ownerEmail}
            error={errors.ownerEmail}
            onChange={updateField}
          />
          <TextField
            name="password"
            label="Mot de passe admin"
            type="password"
            value={values.password}
            error={errors.password}
            onChange={updateField}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-2 text-base font-semibold text-slate-950">
          Informations du magasin
        </legend>
        <p className="text-sm leading-6 text-slate-600">
          Ces informations serviront a afficher votre boutique aux clients qui
          cherchent un reparateur proche d&apos;eux. Vous pourrez les modifier
          plus tard dans les parametres admin.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            name="shopAddress"
            label="Adresse"
            value={values.shopAddress ?? ""}
            error={errors.shopAddress}
            onChange={updateField}
          />
          <TextField
            name="shopPostalCode"
            label="Code postal"
            value={values.shopPostalCode ?? ""}
            error={errors.shopPostalCode}
            onChange={updateField}
          />
          <TextField
            name="shopCity"
            label="Ville"
            value={values.shopCity ?? ""}
            error={errors.shopCity}
            onChange={updateField}
          />
          <TextField
            name="shopCountry"
            label="Pays"
            value={values.shopCountry ?? ""}
            error={errors.shopCountry}
            onChange={updateField}
            placeholder="France, Belgique, Suisse..."
          />
          <TextField
            name="shopPhone"
            label="Telephone du magasin"
            type="tel"
            value={values.shopPhone ?? ""}
            error={errors.shopPhone}
            onChange={updateField}
          />
          <TextField
            name="shopEmail"
            label="Email public du magasin"
            type="email"
            value={values.shopEmail ?? ""}
            error={errors.shopEmail}
            onChange={updateField}
          />
          <TextField
            name="shopOpeningHours"
            label="Horaires d'ouverture"
            value={values.shopOpeningHours ?? ""}
            error={errors.shopOpeningHours}
            onChange={updateField}
            placeholder="Lun-sam 9h-19h"
          />
          <TextField
            name="shopCapacityPerDay"
            label="Places de reparation par jour"
            type="number"
            value={values.shopCapacityPerDay ?? "8"}
            error={errors.shopCapacityPerDay}
            onChange={updateField}
          />
          <TextField
            name="shopLatitude"
            label="Latitude optionnelle"
            value={values.shopLatitude ?? ""}
            error={errors.shopLatitude}
            onChange={updateField}
            placeholder="48.8566"
          />
          <TextField
            name="shopLongitude"
            label="Longitude optionnelle"
            value={values.shopLongitude ?? ""}
            error={errors.shopLongitude}
            onChange={updateField}
            placeholder="2.3522"
          />
        </div>
      </fieldset>

      {submitError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {submitError}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      {usesFreeAccessCode ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Code gratuit reconnu. Cliquez sur Activer gratuitement pour creer le
          compte sans paiement.
        </p>
      ) : null}

      {usesDiscountCode ? (
        <p className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          Code de reduction reconnu : -10% sur le premium pendant 1 an seulement.
          L&apos;assistance
          annuelle reste au prix normal.
        </p>
      ) : null}

      {codeSent && !usesFreeAccessCode ? (
        <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-4">
          <label
            htmlFor="pro-emailCode"
            className="text-sm font-medium text-slate-800"
          >
            Code recu par email
          </label>
          <input
            id="pro-emailCode"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={values.emailCode ?? ""}
            onChange={(event) =>
              updateField(
                "emailCode",
                event.target.value.replace(/\D/g, "").slice(0, 6),
              )
            }
            className="h-11 w-full max-w-[220px] rounded-md border border-slate-300 px-3 py-2 text-sm tracking-[0.2em] outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            aria-invalid={Boolean(errors.emailCode)}
          />
          {errors.emailCode ? (
            <p className="text-sm text-red-700">{errors.emailCode}</p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              const validation = validateProSignupInput(values);

              if (!validation.ok) {
                setErrors(validation.errors);
                return;
              }

              void sendSignupCode(validation.data);
            }}
            disabled={isSendingCode}
            className="w-fit text-sm font-semibold text-slate-950 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {isSendingCode ? "Envoi..." : "Renvoyer un code"}
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid max-w-[180px] gap-1">
          <label htmlFor="pro-promoCode" className="text-xs font-medium text-slate-600">
            Code promo
          </label>
          <input
            id="pro-promoCode"
            type="text"
            value={values.promoCode ?? ""}
            onChange={(event) => updateField("promoCode", event.target.value)}
            className="h-9 w-full rounded-md border border-slate-300 px-2 text-xs uppercase outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            aria-invalid={Boolean(errors.promoCode)}
          />
          {errors.promoCode ? (
            <p className="text-xs text-red-700">{errors.promoCode}</p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || isSendingCode}
          className="min-h-11 rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSendingCode
            ? "Envoi du code..."
            : isSubmitting
              ? usesFreeAccessCode
                ? "Activation..."
                : "Validation..."
              : usesFreeAccessCode
                ? "Activer gratuitement"
                : codeSent
                  ? "Valider le code"
                  : "Envoyer le code"}
        </button>
      </div>
    </form>
  );
}

function TextField({
  name,
  label,
  value,
  error,
  onChange,
  type = "text",
  placeholder,
}: {
  name: keyof ProSignupInput;
  label: string;
  value: string;
  error?: string;
  onChange: (name: keyof ProSignupInput, value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const id = `pro-${name}`;

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(name, event.target.value)}
        className="min-h-11 w-full min-w-0 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
        aria-invalid={Boolean(error)}
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
