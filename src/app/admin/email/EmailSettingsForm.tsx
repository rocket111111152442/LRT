"use client";

import { FormEvent, useEffect, useState } from "react";

type EmailSettingsFormState = {
  smtpEmail: string;
  smtpAppPassword: string;
  smtpHost: string;
  smtpPort: string;
  smtpSecure: boolean;
  smtpFromName: string;
  shopName: string;
  shopAddress: string;
  shopOpeningHours: string;
  shopPhone: string;
  googleReviewUrl: string;
  createdEmailTemplate: string;
  statusEmailTemplate: string;
  quoteEmailTemplate: string;
  reviewEmailTemplate: string;
};

type FieldHelp = {
  title: string;
  steps: string[];
  note?: string;
};

const emptySettings: EmailSettingsFormState = {
  smtpEmail: "",
  smtpAppPassword: "",
  smtpHost: "smtp.gmail.com",
  smtpPort: "465",
  smtpSecure: true,
  smtpFromName: "",
  shopName: "",
  shopAddress: "",
  shopOpeningHours: "",
  shopPhone: "",
  googleReviewUrl: "",
  createdEmailTemplate: "",
  statusEmailTemplate: "",
  quoteEmailTemplate: "",
  reviewEmailTemplate: "",
};

export function EmailSettingsForm() {
  const [values, setValues] = useState<EmailSettingsFormState>(emptySettings);
  const [hasAppPassword, setHasAppPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadSettings() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/admin/email-settings", {
          signal: controller.signal,
        });

        if (response.status === 401) {
          window.location.href = "/admin/login";
          return;
        }

        const payload = await response.json();

        if (!response.ok) {
          setError(payload.error ?? "Chargement impossible.");
          return;
        }

        setValues({
          smtpEmail: payload.settings.smtpEmail ?? "",
          smtpAppPassword: "",
          smtpHost: payload.settings.smtpHost ?? "smtp.gmail.com",
          smtpPort: String(payload.settings.smtpPort ?? 465),
          smtpSecure: Boolean(payload.settings.smtpSecure),
          smtpFromName: payload.settings.smtpFromName ?? "",
          shopName: payload.settings.shopName ?? "",
          shopAddress: payload.settings.shopAddress ?? "",
          shopOpeningHours: payload.settings.shopOpeningHours ?? "",
          shopPhone: payload.settings.shopPhone ?? "",
          googleReviewUrl: payload.settings.googleReviewUrl ?? "",
          createdEmailTemplate: payload.settings.createdEmailTemplate ?? "",
          statusEmailTemplate: payload.settings.statusEmailTemplate ?? "",
          quoteEmailTemplate: payload.settings.quoteEmailTemplate ?? "",
          reviewEmailTemplate: payload.settings.reviewEmailTemplate ?? "",
        });
        setHasAppPassword(Boolean(payload.settings.hasAppPassword));
      } catch {
        if (!controller.signal.aborted) {
          setError("Chargement impossible.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadSettings();

    return () => controller.abort();
  }, []);

  function updateField(
    name: keyof EmailSettingsFormState,
    value: string | boolean,
  ) {
    setValues((current) => ({ ...current, [name]: value }));
    setError("");
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/email-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          smtpPort: Number(values.smtpPort),
        }),
      });
      const payload = await response.json();

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        setError(payload.error ?? "Enregistrement impossible.");
        return;
      }

      setValues((current) => ({
        ...current,
        smtpAppPassword: "",
      }));
      setHasAppPassword(Boolean(payload.settings.hasAppPassword));
      setMessage("Configuration email enregistree.");
    } catch {
      setError("Enregistrement impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Chargement...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <fieldset className="grid gap-4">
        <legend className="mb-2 text-base font-semibold text-slate-950">
          Envoi email
        </legend>
        <div className="rounded-md border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-950">
          <p className="font-semibold">Les emails clients partent de l&apos;adresse du magasin.</p>
          <p>
            Cette configuration est utilisée pour les tickets, devis, changements de
            statut, retards, rappels et demandes d&apos;avis. Si elle est absente ou
            incorrecte, aucun de ces messages ne sera envoyé depuis la boîte Qoravo.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="smtp-email"
            label="Adresse email"
            value={values.smtpEmail}
            type="email"
            autoComplete="email"
            onChange={(value) => updateField("smtpEmail", value)}
          />
          <TextField
            id="smtp-password"
            label={
              hasAppPassword
                ? "Nouveau mot de passe d'application"
                : "Mot de passe d'application"
            }
            value={values.smtpAppPassword}
            type="password"
            autoComplete="new-password"
            onChange={(value) => updateField("smtpAppPassword", value)}
            help={{
              title: "Trouver le mot de passe d'application Gmail",
              steps: [
                "Ce n'est pas le mot de passe normal de Gmail.",
                "Ouvrez myaccount.google.com/security avec le compte email du magasin.",
                "Activez la validation en 2 etapes si elle n'est pas encore active.",
                "Dans Securite, cherchez Mots de passe d'application.",
                "Creez un mot de passe pour l'application Mail, puis copiez le code genere.",
                "Collez ce code ici. Les espaces seront retires automatiquement.",
              ],
              note: "Si Google n'affiche pas ce menu, le compte peut etre gere par une entreprise ou la validation en 2 etapes n'est pas terminee.",
            }}
          />
          <TextField
            id="smtp-from-name"
            label="Nom expediteur"
            value={values.smtpFromName}
            onChange={(value) => updateField("smtpFromName", value)}
          />
          <TextField
            id="smtp-host"
            label="Serveur SMTP"
            value={values.smtpHost}
            onChange={(value) => updateField("smtpHost", value)}
            help={{
              title: "Choisir le serveur SMTP",
              steps: [
                "Pour Gmail, gardez smtp.gmail.com.",
                "Avec Gmail, utilisez le port 465 et laissez Connexion securisee cochee.",
                "Certains fournisseurs utilisent le port 587 avec Connexion securisee decochee.",
                "Pour Outlook, Orange, OVH ou autre, cherchez dans l'aide du fournisseur : serveur SMTP, port SMTP et securite.",
                "L'adresse email au-dessus sert d'identifiant SMTP.",
              ],
              note: "Si l'envoi echoue, verifiez d'abord le serveur, le port, la case securisee et le mot de passe d'application.",
            }}
          />
          <TextField
            id="smtp-port"
            label="Port SMTP"
            value={values.smtpPort}
            type="number"
            onChange={(value) => updateField("smtpPort", value)}
          />
          <label className="flex min-h-11 items-center gap-3 self-end rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800">
            <input
              type="checkbox"
              checked={values.smtpSecure}
              onChange={(event) =>
                updateField("smtpSecure", event.target.checked)
              }
              className="h-4 w-4"
            />
            Connexion securisee
          </label>
        </div>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-2 text-base font-semibold text-slate-950">
          Modeles de messages
        </legend>
        <p className="text-sm leading-6 text-slate-600">
          Variables possibles : {"{{prenom}}"}, {"{{ticket}}"}, {"{{appareil}}"},{" "}
          {"{{statut}}"}, {"{{prix}}"}, {"{{lien_suivi}}"},{" "}
          {"{{lien_devis}}"}, {"{{lien_acceptation}}"}, {"{{lien_refus}}"},{" "}
          {"{{lien_avis}}"}.
        </p>
        <div className="grid gap-4">
          <TextAreaField
            id="template-created"
            label="Email de depot / ticket"
            value={values.createdEmailTemplate}
            onChange={(value) => updateField("createdEmailTemplate", value)}
          />
          <TextAreaField
            id="template-status"
            label="Email changement de statut"
            value={values.statusEmailTemplate}
            onChange={(value) => updateField("statusEmailTemplate", value)}
          />
          <TextAreaField
            id="template-quote"
            label="Email de devis"
            value={values.quoteEmailTemplate}
            onChange={(value) => updateField("quoteEmailTemplate", value)}
          />
          <TextAreaField
            id="template-review"
            label="Email avis client"
            value={values.reviewEmailTemplate}
            onChange={(value) => updateField("reviewEmailTemplate", value)}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-2 text-base font-semibold text-slate-950">
          Magasin
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="shop-name"
            label="Nom du magasin"
            value={values.shopName}
            onChange={(value) => updateField("shopName", value)}
          />
          <TextField
            id="shop-phone"
            label="Telephone"
            value={values.shopPhone}
            onChange={(value) => updateField("shopPhone", value)}
          />
          <TextField
            id="shop-address"
            label="Adresse"
            value={values.shopAddress}
            onChange={(value) => updateField("shopAddress", value)}
          />
          <TextField
            id="shop-opening-hours"
            label="Horaires"
            value={values.shopOpeningHours}
            onChange={(value) => updateField("shopOpeningHours", value)}
          />
          <TextField
            id="google-review-url"
            label="Lien Google Avis"
            value={values.googleReviewUrl}
            onChange={(value) => updateField("googleReviewUrl", value)}
            help={{
              title: "Lien Google optionnel",
              steps: [
                "Qoravo envoie deja un lien d'avis interne au client quand une reparation passe a RECUPERE.",
                "Ce champ reste optionnel pour conserver votre lien Google dans les reglages.",
                "Si ce champ est vide, l'email d'avis utilise quand meme le lien Qoravo unique du client.",
              ],
            }}
          />
        </div>
      </fieldset>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="min-h-11 rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  help,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  help?: FieldHelp;
}) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="text-sm font-medium text-slate-800">
          {label}
        </label>
        {help ? (
          <button
            type="button"
            onClick={() => setIsHelpOpen((current) => !current)}
            aria-expanded={isHelpOpen}
            aria-controls={`${id}-help`}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
          >
            ?
          </button>
        ) : null}
      </div>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
      />
      {help && isHelpOpen ? (
        <div
          id={`${id}-help`}
          className="rounded-md border border-sky-200 bg-sky-50 p-3 text-xs leading-5 text-slate-700"
        >
          <p className="font-semibold text-slate-950">{help.title}</p>
          <ol className="mt-2 grid list-decimal gap-1 pl-4">
            {help.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {help.note ? (
            <p className="mt-2 rounded bg-white px-2 py-1">{help.note}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="grid gap-2 text-sm font-medium text-slate-800">
      {label}
      <textarea
        id={id}
        value={value}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
      />
    </label>
  );
}
