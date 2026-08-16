"use client";

import { useState } from "react";

type Errors = Record<string, string>;

export function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [errors, setErrors] = useState<Errors>({});

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "loading") return;

    setState("loading");
    setErrors({});

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
        }),
      });

      const data = (await response.json()) as { errors?: Errors; error?: string };

      if (!response.ok) {
        setErrors(data.errors ?? { form: data.error ?? "Envoi impossible." });
        setState("idle");
        return;
      }

      setState("done");
    } catch {
      setErrors({ form: "Connexion impossible. Réessayez dans un instant." });
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <div className="border border-[color:var(--color-ink)] p-8">
        <p className="display-lg mb-4">Message envoyé</p>
        <p className="text-sm leading-relaxed text-[color:var(--color-smoke)]">
          On revient vers vous sous 24 à 48 heures ouvrées, à l&apos;adresse
          indiquée. Pensez à vérifier vos spams.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {errors.form && (
        <p className="border border-[color:var(--color-ink)] px-4 py-3 text-sm" role="alert">
          {errors.form}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="field-label">
            Nom *
          </label>
          <input
            id="contact-name"
            name="name"
            required
            autoComplete="name"
            className={`field ${errors.name ? "field-error" : ""}`}
          />
          {errors.name && (
            <p className="label-sm mt-2" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className="field-label">
            E-mail *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`field ${errors.email ? "field-error" : ""}`}
          />
          {errors.email && (
            <p className="label-sm mt-2" role="alert">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="field-label">
          Sujet *
        </label>
        <input
          id="contact-subject"
          name="subject"
          required
          className={`field ${errors.subject ? "field-error" : ""}`}
          placeholder="Commande NB-000123"
        />
        {errors.subject && (
          <p className="label-sm mt-2" role="alert">
            {errors.subject}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className="field-label">
          Message *
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={7}
          maxLength={4000}
          className={`field resize-y ${errors.message ? "field-error" : ""}`}
        />
        {errors.message && (
          <p className="label-sm mt-2" role="alert">
            {errors.message}
          </p>
        )}
      </div>

      <p className="text-xs text-[color:var(--color-smoke)]">
        Les informations transmises servent uniquement à traiter votre demande.
        Elles ne sont ni revendues ni utilisées à des fins publicitaires.
      </p>

      <button type="submit" disabled={state === "loading"} className="btn">
        {state === "loading" ? "Envoi…" : "Envoyer le message"}
      </button>
    </form>
  );
}
