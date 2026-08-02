"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";

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
  shopSlotDurationMinutes: "60",
  shopMaxAppointmentsPerSlot: "1",
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
  const usesFreeAccessCode = isFreeAccessCode(values.promoCode);
  const usesDiscountCode = isPremiumDiscountCode(values.promoCode);
  const trialAvailable = true;

  function updateField(name: keyof ProSignupInput, value: string) {
    setValues((current) => {
      const next = {
        ...current,
        [name]: name === "slug" ? normalizeSlug(value) : value,
      };

      if (name === "companyName") {
        next.slug = normalizeSlug(value);
      }

      if (name === "ownerEmail" && !current.shopEmail) {
        next.shopEmail = value;
      }

      return next;
    });
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
      track("signup_code_sent");
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

    if (!codeSent) {
      await sendSignupCode(validation.data);
      return;
    }

    if (
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

      track("paid_checkout_started");
      window.location.href = payload.redirectUrl;
    } catch {
      setSubmitError("Inscription impossible.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTrialStart() {
    setSubmitError("");
    setMessage("");

    if (!trialAvailable) {
      setSubmitError("L'offre d'essai gratuit est terminée.");
      return;
    }

    const validation = validateProSignupInput(values);

    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    if (!codeSent) {
      const sent = await sendSignupCode(validation.data);

      if (sent) {
        setMessage(
          "Code envoye. Entrez-le ci-dessous pour démarrer vos 14 jours d'essai.",
        );
      }

      return;
    }

    if (
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
        body: JSON.stringify({ ...validation.data, startTrial: true }),
      });
      const payload = await response.json();

      if (!response.ok) {
        const apiErrors = payload.errors ?? {};

        setErrors(apiErrors);
        setSubmitError(
          payload.error ??
            (Object.keys(apiErrors).length > 0
              ? "Corrigez les champs indiques en rouge."
              : "Essai gratuit impossible."),
        );
        return;
      }

      track("trial_started");
      window.location.href = payload.redirectUrl;
    } catch {
      setSubmitError("Essai gratuit impossible.");
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
        <div className="grid gap-4">
          <TextField
            name="companyName"
            label="Nom de l'atelier"
            value={values.companyName}
            error={errors.companyName}
            onChange={updateField}
          />
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
        <p className="rounded-md border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-900">
          C&apos;est tout pour commencer. L&apos;adresse, les horaires, le QR code et
          les réglages email seront configurés depuis votre espace admin.
        </p>
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

      {codeSent ? (
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

      <div className="grid gap-4 border-t border-slate-200 pt-5">
        <div className="grid max-w-[200px] gap-1">
          <label htmlFor="pro-promoCode" className="text-xs font-medium text-slate-600">
            Code promo (optionnel)
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

        {!usesFreeAccessCode ? (
          <div className="grid gap-3">
            {trialAvailable ? (
              <>
                <button
                  type="button"
                  onClick={handleTrialStart}
                  disabled={isSubmitting || isSendingCode}
                  className="q-btn q-btn-primary w-full text-base disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSendingCode
                    ? "Envoi du code..."
                    : isSubmitting
                      ? "Démarrage de l'essai..."
                      : codeSent
                        ? "Valider le code et démarrer l'essai de 14 jours"
                        : "Continuer avec l'essai gratuit de 14 jours"}
                </button>
                <p className="text-center text-xs text-slate-500">
                  14 jours gratuits, sans carte bancaire. Vous pourrez vous
                  abonner à tout moment et reprendre où vous en étiez.
                </p>
              </>
            ) : (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
                L&apos;offre d&apos;essai gratuit est terminée. Abonnez-vous
                directement pour accéder à Qoravo.
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting || isSendingCode}
              className={`min-h-11 rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed ${
                trialAvailable
                  ? "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 disabled:text-slate-400"
                  : "q-btn q-btn-primary text-base disabled:opacity-60"
              }`}
            >
              {isSendingCode
                ? "Envoi du code..."
                : isSubmitting
                  ? "Validation..."
                  : codeSent
                    ? "Valider le code et m'abonner (89,99 €/an)"
                    : "M'abonner directement (89,99 €/an)"}
            </button>
          </div>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting || isSendingCode}
            className="q-btn q-btn-primary w-full text-base disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSendingCode
              ? "Envoi du code..."
              : isSubmitting
                ? "Activation..."
                : codeSent
                  ? "Valider le code et activer gratuitement"
                  : "Continuer gratuitement"}
          </button>
        )}
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
