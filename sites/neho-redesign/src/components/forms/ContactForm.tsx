"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionary-type";

export function ContactForm({ dict }: { dict: Dictionary }) {
  const t = dict.contact.form;
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const subjectId = useId();
  const messageId = useId();
  const websiteId = useId();
  const renderedAt = useRef(0);
  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    subject: t.subjectOptions[0] ?? "",
    message: "",
    website: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, renderedAt: renderedAt.current }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-ivy-100/70 p-6 text-ivy-700">
        <CheckCircle2 size={22} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">{t.successTitle}</p>
          <p className="mt-1 text-sm">{t.successDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Honeypot anti-spam : champ caché des utilisateurs, visible des robots naïfs. */}
      <div className="absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
        <label htmlFor={websiteId}>{dict.form.honeypotLabel}</label>
        <input id={websiteId} type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => setValues((v) => ({ ...v, website: e.target.value }))} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={nameId} className="input-label">
            {t.nameLabel}
          </label>
          <input id={nameId} required type="text" autoComplete="name" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label htmlFor={emailId} className="input-label">
            {t.emailLabel}
          </label>
          <input id={emailId} required type="email" autoComplete="email" value={values.email} onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))} className="input-field" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={phoneId} className="input-label">
            {t.phoneLabel} <span className="text-ink-500">({dict.common.optional})</span>
          </label>
          <input id={phoneId} type="tel" autoComplete="tel" value={values.phone} onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label htmlFor={subjectId} className="input-label">
            {t.subjectLabel}
          </label>
          <select id={subjectId} value={values.subject} onChange={(e) => setValues((v) => ({ ...v, subject: e.target.value }))} className="input-field">
            {t.subjectOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={messageId} className="input-label">
          {t.messageLabel}
        </label>
        <textarea
          id={messageId}
          required
          rows={5}
          value={values.message}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
          className="input-field"
        />
      </div>

      {status === "error" ? (
        <div role="alert" className="flex items-center gap-2 text-sm text-error-600">
          <AlertCircle size={16} aria-hidden="true" /> {t.errorDescription}
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={status === "submitting"}>
        {status === "submitting" ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
