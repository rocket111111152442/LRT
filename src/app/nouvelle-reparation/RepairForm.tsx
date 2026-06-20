"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { RepairIntakeExtras } from "@/components/RepairIntakeExtras";
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

type RepairerRating = {
  companyName: string;
  average: number;
  count: number;
};

type TextFieldName = Exclude<
  keyof RepairInput,
  | "photos"
  | "customerDropOffSignature"
  | "requestedAppointmentAt"
  | "wantsPriceBeforeDeposit"
>;

type FieldConfig = {
  name: TextFieldName;
  label: string;
  type?: string;
  multiline?: boolean;
  autoComplete?: string;
};

const customerFields: FieldConfig[] = [
  { name: "firstName", label: "Prenom", autoComplete: "given-name" },
  { name: "lastName", label: "Nom", autoComplete: "family-name" },
  { name: "phone", label: "Telephone", type: "tel", autoComplete: "tel" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
];

const deviceFields: FieldConfig[] = [
  { name: "deviceType", label: "Type d'appareil" },
  { name: "brand", label: "Marque" },
  { name: "model", label: "Modele" },
  {
    name: "issueDescription",
    label: "Description du probleme",
    multiline: true,
  },
  {
    name: "unlockCodeOrNote",
    label: "Code ou note de deverrouillage",
    multiline: true,
  },
];

const issueTemplates = [
  "Ecran casse ou tactile defectueux",
  "Batterie qui se decharge trop vite",
  "Connecteur de charge defectueux",
  "Telephone oxyde ou tombe dans l'eau",
  "Probleme logiciel ou demarrage bloque",
];

export function RepairForm({
  proAccountSlug = "",
  repairerRating,
  requestedAppointmentAt = "",
}: {
  proAccountSlug?: string;
  repairerRating?: RepairerRating | null;
  requestedAppointmentAt?: string;
}) {
  const [values, setValues] = useState<RepairInput>(() => ({
    ...emptyRepairInput(),
    requestedAppointmentAt,
  }));
  const [errors, setErrors] = useState<RepairInputErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRepair, setCreatedRepair] = useState<CreatedRepair | null>(null);
  const [submitError, setSubmitError] = useState("");

  function updateField(name: keyof RepairInput, value: string | string[]) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError("");
    setCreatedRepair(null);
  }

  function updateBooleanField(name: keyof RepairInput, value: boolean) {
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
              : "La demande n'a pas pu etre enregistree."),
        );
        return;
      }

      setValues(emptyRepairInput());
      setErrors({});
      setCreatedRepair(payload.repair);
    } catch {
      setSubmitError("La demande n'a pas pu etre envoyee.");
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
      {repairerRating ? <RepairerRatingCard rating={repairerRating} /> : null}

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
        <div className="flex max-w-3xl flex-wrap gap-2">
          {issueTemplates.map((template) => (
            <button
              key={template}
              type="button"
              onClick={() => updateField("issueDescription", template)}
              className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold leading-5 text-sky-900 transition hover:border-sky-300 hover:bg-sky-100"
            >
              {template}
            </button>
          ))}
        </div>
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

      <RepairIntakeExtras
        photos={values.photos ?? []}
        signature={values.customerDropOffSignature ?? ""}
        photoError={errors.photos}
        signatureError={errors.customerDropOffSignature}
        onPhotosChange={(photos) => updateField("photos", photos)}
        onSignatureChange={(signature) =>
          updateField("customerDropOffSignature", signature)
        }
      />

      <section className="grid gap-4 rounded-lg border border-sky-100 bg-sky-50/70 p-4">
        <div className="grid gap-1">
          <h2 className="text-base font-semibold text-slate-950">
            Devis et disponibilite
          </h2>
          {values.requestedAppointmentAt ? (
            <p className="text-sm text-slate-700">
              Creneau demande :{" "}
              <strong>{formatAppointment(values.requestedAppointmentAt)}</strong>
            </p>
          ) : (
            <p className="text-sm text-slate-700">
              Aucun creneau precis choisi. Le magasin vous proposera une date.
            </p>
          )}
        </div>
        <label className="flex items-start gap-3 rounded-md border border-white bg-white p-3 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={Boolean(values.wantsPriceBeforeDeposit)}
            onChange={(event) =>
              updateBooleanField("wantsPriceBeforeDeposit", event.target.checked)
            }
            className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600"
          />
          <span>
            Je veux recevoir un prix avant de deposer mon appareil. Le reparateur
            pourra accepter la demande ou m&apos;envoyer un devis par email.
          </span>
        </label>
        {errors.requestedAppointmentAt ? (
          <p className="text-sm text-red-700">{errors.requestedAppointmentAt}</p>
        ) : null}
      </section>

      {submitError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {submitError}
        </p>
      ) : null}

      {createdRepair ? (
        <div className="grid gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p>
            Reparation creee. Ticket :{" "}
            <strong>{createdRepair.ticketNumber ?? createdRepair.id}</strong>.
          </p>
          <Link
            href="/suivi"
            className="w-fit font-semibold text-emerald-950 underline-offset-4 hover:underline"
          >
            Suivre une reparation
          </Link>
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Enregistrement..." : "Creer la reparation"}
        </button>
      </div>
    </form>
  );
}

function formatAppointment(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function RepairerRatingCard({ rating }: { rating: RepairerRating }) {
  const averageLabel =
    rating.count > 0 ? rating.average.toFixed(1).replace(".", ",") : "-";

  return (
    <section className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Note du reparateur
      </p>
      <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-950">
            {rating.companyName}
          </p>
          <p className="text-sm text-slate-600">
            {rating.count > 0
              ? `${averageLabel}/5 de moyenne sur ${rating.count} avis client(s)`
              : "Ce reparateur n'a pas encore recu d'avis client."}
          </p>
        </div>
        {rating.count > 0 ? (
          <strong className="text-2xl font-semibold text-slate-950">
            {averageLabel}/5
          </strong>
        ) : null}
      </div>
    </section>
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
    <div className={field.multiline ? "grid gap-2 sm:col-span-2" : "grid gap-2"}>
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
