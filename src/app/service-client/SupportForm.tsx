"use client";

import { FormEvent, useState } from "react";

type SupportValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type SupportErrors = Partial<Record<keyof SupportValues, string>>;

const initialValues: SupportValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const DEFAULT_CATEGORIES = [
  "Connexion / accès",
  "Paiement / facturation",
  "Emails / notifications",
  "QR code / suivi",
  "Réparations / fiches",
  "Stock / catalogue",
  "Comptabilité",
  "Agenda / rendez-vous",
  "Bug / erreur technique",
  "Autre",
];

export function SupportForm({
  prefillSubject = "",
  prefillMessage = "",
  offreId = "",
  categories = DEFAULT_CATEGORIES,
  onSent,
}: {
  prefillSubject?: string;
  prefillMessage?: string;
  offreId?: string;
  categories?: string[];
  onSent?: () => void;
} = {}) {
  // Les demandes d'extension (offreId présent) passent par /api/contact-offre
  // (endpoint public, pas d'auth requise) au lieu de /api/support.
  const endpoint = offreId ? "/api/contact-offre" : "/api/support";
  const showExtras = !offreId;
  const [values, setValues] = useState<SupportValues>({
    ...initialValues,
    subject: prefillSubject,
    message: prefillMessage,
  });
  const [category, setCategory] = useState(categories[0] ?? "");
  const [priority, setPriority] = useState<"NORMAL" | "URGENT">("NORMAL");
  const [ticketRef, setTicketRef] = useState("");
  const [errors, setErrors] = useState<SupportErrors>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name: keyof SupportValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setStatusMessage("");
    setSubmitError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setStatusMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          offre: offreId || undefined,
          ...(showExtras ? { category, priority, ticketRef: ticketRef.trim() || undefined } : {}),
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors(payload.errors ?? {});
        setSubmitError(payload.error ?? "Message impossible a envoyer.");
        return;
      }

      setValues(initialValues);
      setTicketRef("");
      setPriority("NORMAL");
      setErrors({});
      setStatusMessage(payload.message ?? "Message envoye.");
      onSent?.();
    } catch {
      setSubmitError("Message impossible a envoyer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="name"
          label="Nom"
          value={values.name}
          error={errors.name}
          onChange={updateField}
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          value={values.email}
          error={errors.email}
          onChange={updateField}
        />
      </div>

      <TextField
        name="subject"
        label="Sujet"
        value={values.subject}
        error={errors.subject}
        onChange={updateField}
      />

      {showExtras ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <label htmlFor="support-category" className="text-sm font-medium text-slate-800">
              Catégorie
            </label>
            <select
              id="support-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="support-priority" className="text-sm font-medium text-slate-800">
              Urgence
            </label>
            <select
              id="support-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value === "URGENT" ? "URGENT" : "NORMAL")}
              className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            >
              <option value="NORMAL">Normale</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="support-ticketref" className="text-sm font-medium text-slate-800">
              N° ticket concerné <span className="text-slate-400">(optionnel)</span>
            </label>
            <input
              id="support-ticketref"
              value={ticketRef}
              onChange={(event) => setTicketRef(event.target.value)}
              placeholder="Ex : A1B2C3"
              className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-2">
        <label
          htmlFor="support-message"
          className="text-sm font-medium text-slate-800"
        >
          Message
        </label>
        <textarea
          id="support-message"
          value={values.message}
          onChange={(event) => updateField("message", event.target.value)}
          rows={7}
          className="min-h-36 resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message ? (
          <p className="text-sm text-red-700">{errors.message}</p>
        ) : null}
      </div>

      {submitError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {submitError}
        </p>
      ) : null}

      {statusMessage ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {statusMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-11 rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? "Envoi..." : "Envoyer au service client"}
      </button>
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
}: {
  name: keyof SupportValues;
  label: string;
  value: string;
  error?: string;
  onChange: (name: keyof SupportValues, value: string) => void;
  type?: string;
}) {
  const id = `support-${name}`;

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
        aria-invalid={Boolean(error)}
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
