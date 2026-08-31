"use client";

import { useEffect, useRef, useState } from "react";
import { agencies } from "@/lib/data/agencies";
import { IconCheck } from "@/components/ui/icons";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const renderedAt = useRef(0);
  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          subject: form.get("subject"),
          message: form.get("message"),
          agency: form.get("agency") || undefined,
          website: form.get("website"),
          renderedAt: renderedAt.current,
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-start gap-3 border border-[var(--color-stone-dark)] p-8">
        <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-green)]" />
        <p className="font-sans text-sm leading-relaxed">
          Votre message a bien été transmis. Nous revenons vers vous rapidement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
            Nom
          </span>
          <input
            required
            name="name"
            type="text"
            className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-2.5 font-sans text-base focus:border-[var(--color-ink)] focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
            E-mail
          </span>
          <input
            required
            name="email"
            type="email"
            className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-2.5 font-sans text-base focus:border-[var(--color-ink)] focus:outline-none"
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
            Téléphone (optionnel)
          </span>
          <input
            name="phone"
            type="tel"
            className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-2.5 font-sans text-base focus:border-[var(--color-ink)] focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
            Agence préférée (optionnel)
          </span>
          <select
            name="agency"
            defaultValue=""
            className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-2.5 font-sans text-base focus:border-[var(--color-ink)] focus:outline-none"
          >
            <option value="">Indifférent</option>
            {agencies.map((a) => (
              <option key={a.id} value={a.id}>
                {a.city}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
          Objet
        </span>
        <input
          required
          name="subject"
          type="text"
          className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-2.5 font-sans text-base focus:border-[var(--color-ink)] focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
          Message
        </span>
        <textarea
          required
          name="message"
          rows={5}
          className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-2.5 font-sans text-base focus:border-[var(--color-ink)] focus:outline-none"
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-[var(--color-ink)] px-8 py-3.5 font-sans text-sm text-[var(--color-ivory)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "loading" ? "Envoi en cours…" : "Envoyer le message"}
      </button>

      {status === "error" && (
        <p className="font-sans text-xs text-red-700">
          Une erreur est survenue. Contactez-nous directement par téléphone.
        </p>
      )}
    </form>
  );
}
