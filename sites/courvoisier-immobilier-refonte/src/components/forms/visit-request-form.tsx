"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck } from "@/components/ui/icons";

interface VisitRequestFormProps {
  propertySlug: string;
  propertyTitle: string;
}

type Status = "idle" | "loading" | "success" | "error";

export function VisitRequestForm({ propertySlug, propertyTitle }: VisitRequestFormProps) {
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
      const res = await fetch("/api/visit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertySlug,
          propertyTitle,
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          message: form.get("message"),
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
      <div className="flex items-start gap-3 border border-[var(--color-stone-dark)] p-6">
        <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-green)]" />
        <p className="font-sans text-sm leading-relaxed">
          Votre demande a bien été transmise. Un courtier vous recontacte
          rapidement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <label className="block">
        <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
          Nom
        </span>
        <input
          required
          name="name"
          type="text"
          className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-2 font-sans text-sm focus:border-[var(--color-ink)] focus:outline-none"
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
          className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-2 font-sans text-sm focus:border-[var(--color-ink)] focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
          Téléphone (optionnel)
        </span>
        <input
          name="phone"
          type="tel"
          className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-2 font-sans text-sm focus:border-[var(--color-ink)] focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-graphite-light)]">
          Message (optionnel)
        </span>
        <textarea
          name="message"
          rows={3}
          className="w-full border-b border-[var(--color-stone-dark)] bg-transparent py-2 font-sans text-sm focus:border-[var(--color-ink)] focus:outline-none"
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-[var(--color-ink)] py-3 font-sans text-sm text-[var(--color-ivory)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "loading" ? "Envoi en cours…" : "Demander une visite"}
      </button>

      {status === "error" && (
        <p className="font-sans text-xs text-red-700">
          Une erreur est survenue. Réessayez ou contactez-nous directement par téléphone.
        </p>
      )}
    </form>
  );
}
