"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { TextField, TextAreaField } from "./FormField";
import { getPropertyBySlug } from "@/lib/data/properties";

function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ContactForm() {
  const searchParams = useSearchParams();
  const propertySlug = searchParams.get("bien");
  const property = propertySlug ? getPropertyBySlug(propertySlug) : undefined;

  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: property ? `Je suis intéressé·e par : ${property.title} (${property.city}).` : "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitted) rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [submitted]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!values.fullName.trim()) nextErrors.fullName = "Indiquez votre nom.";
    if (!isEmailValid(values.email)) nextErrors.email = "Indiquez une adresse e-mail valide.";
    if (!values.message.trim()) nextErrors.message = "Écrivez-nous quelques mots sur votre projet.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div ref={rootRef} className="border border-stone p-10 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pine text-paper">
          <Check size={20} strokeWidth={1.75} />
        </span>
        <h2 className="mt-6 font-serif text-2xl text-ink">Message envoyé</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
          Merci, {values.fullName.split(" ")[0]}. Nous revenons vers vous rapidement. Ceci est une démonstration :
          aucune donnée n&rsquo;est transmise ni conservée.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <TextField
          id="fullName"
          label="Nom complet"
          value={values.fullName}
          onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
          error={errors.fullName}
        />
        <TextField
          id="email"
          type="email"
          label="E-mail"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          error={errors.email}
        />
      </div>
      <TextField
        id="phone"
        type="tel"
        label="Téléphone (facultatif)"
        value={values.phone}
        onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
      />
      <TextAreaField
        id="message"
        label="Votre message"
        rows={6}
        value={values.message}
        onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
      />
      {errors.message ? <p className="text-xs text-alert">{errors.message}</p> : null}
      <button type="submit" className="bg-pine px-7 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-pine-dim">
        Envoyer le message
      </button>
    </form>
  );
}
