"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionary-type";

export function VisitRequestForm({ propertySlug, dict }: { propertySlug: string; dict: Dictionary }) {
  const t = dict.propertyDetail.agent;
  const contactForm = dict.contact.form;
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const renderedAt = useRef(0);
  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);
  const [values, setValues] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/visit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, propertySlug, website: "", renderedAt: renderedAt.current }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-ivy-100/70 p-4 text-sm text-ivy-700">
        <CheckCircle2 size={20} aria-hidden="true" />
        {contactForm.successDescription}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor={nameId} className="input-label">
          {contactForm.nameLabel}
        </label>
        <input id={nameId} required type="text" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} className="input-field" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={emailId} className="input-label">
            {contactForm.emailLabel}
          </label>
          <input id={emailId} required type="email" value={values.email} onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label htmlFor={phoneId} className="input-label">
            {contactForm.phoneLabel}
          </label>
          <input id={phoneId} required type="tel" value={values.phone} onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))} className="input-field" />
        </div>
      </div>
      {status === "error" ? <p className="text-xs text-error-600">{contactForm.errorDescription}</p> : null}
      <Button type="submit" className="w-full" disabled={status === "submitting"}>
        {t.ctaVisit}
      </Button>
    </form>
  );
}
