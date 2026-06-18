"use client";

import { FormEvent, useState } from "react";
import {
  emptyRepairInput,
  RepairInput,
  RepairInputErrors,
  validateRepairInput,
} from "@/lib/repairValidation";

type CreatedRepair = {
  id: string;
  ticketNumber?: string | null;
  status: string;
  createdAt: string;
};

type FieldConfig = {
  name: Exclude<keyof RepairInput, "photos">;
  label: string;
  type?: string;
  multiline?: boolean;
  autoComplete?: string;
};

const customerFields: FieldConfig[] = [
  { name: "firstName", label: "Prénom", autoComplete: "given-name" },
  { name: "lastName", label: "Nom", autoComplete: "family-name" },
  { name: "phone", label: "Téléphone", type: "tel", autoComplete: "tel" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
];

const deviceFields: FieldConfig[] = [
  { name: "deviceType", label: "Type d'appareil" },
  { name: "brand", label: "Marque" },
  { name: "model", label: "Modèle" },
  {
    name: "issueDescription",
    label: "Description du problème",
    multiline: true,
  },
  {
    name: "unlockCodeOrNote",
    label: "Code ou note de déverrouillage",
    multiline: true,
  },
];

export function RepairForm({ proAccountSlug = "" }: { proAccountSlug?: string }) {
  const [values, setValues] = useState<RepairInput>(() => emptyRepairInput());
  const [errors, setErrors] = useState<RepairInputErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRepair, setCreatedRepair] = useState<CreatedRepair | null>(
    null,
  );
  const [submitError, setSubmitError] = useState("");

  function updateField(name: keyof RepairInput, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError("");
    setCreatedRepair(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setCreatedRepair(null);

    const validation = validateRepairInput(values);

    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/repairs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...validation.data,
          proAccountSlug,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const apiErrors = payload.errors ?? {};

        setErrors(apiErrors);
        setSubmitError(
          payload.error ??
            (Object.keys(apiErrors).length > 0
              ? ""
              : "La demande n'a pas pu être enregistrée."),
        );
        return;
      }

      setValues(emptyRepairInput());
      setErrors({});
      setCreatedRepair(payload.repair);
    } catch {
      setSubmitError("La demande n'a pas pu être envoyée.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      noValidate
    >
      <fieldset className="grid gap-4">
        <legend className="mb-3 text-base font-semibold text-slate-950">
          Client
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {customerFields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={String(values[field.name] ?? "")}
              error={errors[field.name]}
              onChange={updateField}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-3 text-base font-semibold text-slate-950">
          Appareil
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {deviceFields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={String(values[field.name] ?? "")}
              error={errors[field.name]}
              onChange={updateField}
            />
          ))}
        </div>
      </fieldset>

      {submitError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {submitError}
        </p>
      ) : null}

      {createdRepair ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Réparation créée avec le statut {createdRepair.status}. Référence :{" "}
          {createdRepair.id}.
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Enregistrement..." : "Créer la réparation"}
        </button>
      </div>
    </form>
  );
}

function FormField({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldConfig;
  value: string;
  error?: string;
  onChange: (name: keyof RepairInput, value: string) => void;
}) {
  const id = `repair-${field.name}`;
  const inputClassName =
    "min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10";

  return (
    <div
      className={
        field.multiline ? "grid gap-2 sm:col-span-2" : "grid gap-2"
      }
    >
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {field.label}
      </label>
      {field.multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(field.name, event.target.value)}
          rows={field.name === "issueDescription" ? 5 : 3}
          className={inputClassName}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      ) : (
        <input
          id={id}
          type={field.type ?? "text"}
          value={value}
          autoComplete={field.autoComplete}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={inputClassName}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      )}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
