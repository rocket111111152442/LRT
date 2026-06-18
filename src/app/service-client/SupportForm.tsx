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

export function SupportForm() {
  const [values, setValues] = useState<SupportValues>(initialValues);
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
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors(payload.errors ?? {});
        setSubmitError(payload.error ?? "Message impossible a envoyer.");
        return;
      }

      setValues(initialValues);
      setErrors({});
      setStatusMessage(payload.message ?? "Message envoye.");
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
