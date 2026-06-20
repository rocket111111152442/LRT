"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  emptyRepairInput,
  RepairInput,
  RepairInputErrors,
  validateRepairInput,
} from "@/lib/repairValidation";

type TextFieldName = Exclude<
  keyof RepairInput,
  "photos" | "customerDropOffSignature"
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

async function readFiles(files: FileList | null) {
  if (!files) {
    return [];
  }

  const selectedFiles = Array.from(files).slice(0, 3);

  return Promise.all(
    selectedFiles.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    ),
  );
}

export function AdminRepairCreateForm() {
  const router = useRouter();
  const [values, setValues] = useState<RepairInput>(() => emptyRepairInput());
  const [expressMode, setExpressMode] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [errors, setErrors] = useState<RepairInputErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name: keyof RepairInput, value: string | string[]) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitError("");
  }

  async function updatePhotos(files: FileList | null) {
    const photos = await readFiles(files);
    updateField("photos", photos);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    const validation = validateRepairInput(values);

    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/repairs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...validation.data, expressMode, urgent }),
      });
      const payload = await response.json();

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        setErrors(payload.errors ?? {});
        setSubmitError(payload.error ?? "Creation impossible.");
        return;
      }

      router.push(`/admin/repairs/${payload.repair.id}`);
    } catch {
      setSubmitError("Creation impossible.");
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
      <fieldset className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
        <legend className="text-base font-semibold text-slate-950">
          Mode rapide
        </legend>
        <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            checked={expressMode}
            onChange={(event) => setExpressMode(event.target.checked)}
            className="h-4 w-4"
          />
          Reparation express
        </label>
        <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            checked={urgent}
            onChange={(event) => setUrgent(event.target.checked)}
            className="h-4 w-4"
          />
          Priorite urgente
        </label>
      </fieldset>

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

      <fieldset className="grid gap-4">
        <legend className="mb-3 text-base font-semibold text-slate-950">
          Photos de l&apos;appareil
        </legend>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => void updatePhotos(event.target.files)}
          className="text-sm"
        />
        {errors.photos ? (
          <p className="text-sm text-red-700">{errors.photos}</p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-3">
          {(values.photos ?? []).map((photo, index) => (
            <img
              key={`${photo.slice(0, 24)}-${index}`}
              src={photo}
              alt={`Photo ${index + 1}`}
              className="aspect-[4/3] w-full rounded-md border border-slate-200 object-cover"
            />
          ))}
          {(values.photos ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Aucune photo ajoutee.</p>
          ) : null}
        </div>
      </fieldset>

      {submitError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {submitError}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Creation..." : "Creer la reparation"}
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
  const id = `admin-repair-${field.name}`;
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
          rows={field.name === "issueDescription" ? 5 : 3}
          onChange={(event) => onChange(field.name, event.target.value)}
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
