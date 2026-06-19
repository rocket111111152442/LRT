"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  PART_STATUSES,
  REPAIR_STATUSES,
  type PartStatus,
  type RepairStatus,
} from "@/lib/repairValidation";

type RepairEvent = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
};

type RepairDetail = {
  id: string;
  ticketNumber: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  deviceType: string;
  brand: string;
  model: string;
  issueDescription: string;
  unlockCodeOrNote: string | null;
  status: RepairStatus;
  internalNotes: string | null;
  readyEmailSent: boolean;
  reviewEmailSent: boolean;
  readyReminderSentAt: string | null;
  estimatedPriceCents: number | null;
  partsCostCents: number | null;
  quoteStatus: "NONE" | "SENT" | "ACCEPTED" | "REFUSED";
  quoteSentAt: string | null;
  quoteRespondedAt: string | null;
  photos: string[];
  customerDropOffSignature: string | null;
  customerPickupSignature: string | null;
  partsStatus: PartStatus;
  partsDescription: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type RepairDetailClientProps = {
  repairId: string;
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatPrice(cents: number | null) {
  if (!cents) {
    return "-";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function centsToInput(cents: number | null) {
  return cents ? String((cents / 100).toFixed(2)) : "";
}

function inputToCents(value: string) {
  if (!value.trim()) {
    return null;
  }

  const numberValue = Number(value.replace(",", "."));

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return null;
  }

  return Math.round(numberValue * 100);
}

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

export function RepairDetailClient({ repairId }: RepairDetailClientProps) {
  const [repair, setRepair] = useState<RepairDetail | null>(null);
  const [events, setEvents] = useState<RepairEvent[]>([]);
  const [status, setStatus] = useState<RepairStatus>("PAS_ENCORE_EN_REPARATION");
  const [internalNotes, setInternalNotes] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [partsCost, setPartsCost] = useState("");
  const [partsStatus, setPartsStatus] = useState<PartStatus>("NONE");
  const [partsDescription, setPartsDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function syncRepair(payloadRepair: RepairDetail, payloadEvents?: RepairEvent[]) {
    setRepair(payloadRepair);
    setStatus(payloadRepair.status);
    setInternalNotes(payloadRepair.internalNotes ?? "");
    setEstimatedPrice(centsToInput(payloadRepair.estimatedPriceCents));
    setPartsCost(centsToInput(payloadRepair.partsCostCents));
    setPartsStatus(payloadRepair.partsStatus);
    setPartsDescription(payloadRepair.partsDescription ?? "");
    setPhotos(payloadRepair.photos ?? []);

    if (payloadEvents) {
      setEvents(payloadEvents);
    }
  }

  const loadRepair = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/repairs/${repairId}`, { signal });

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Chargement impossible.");
        return;
      }

      syncRepair(payload.repair, payload.events ?? []);
    } catch {
      if (!signal?.aborted) {
        setError("Chargement impossible.");
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [repairId]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void loadRepair(controller.signal);
    }, 0);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [loadRepair]);

  async function patchRepair(body: Record<string, unknown>) {
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/repairs/${repairId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const payload = await response.json();

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return null;
      }

      if (!response.ok) {
        setError(payload.error ?? "Mise a jour impossible.");
        return null;
      }

      syncRepair(payload.repair, payload.events ?? []);

      if (payload.mail?.quoteAttempted) {
        setMessage("Devis enregistre et email tente.");
      } else if (payload.mail?.attempted && payload.mail?.sent) {
        setMessage("Mise a jour enregistree. Email envoye au client.");
      } else if (payload.mail?.attempted && !payload.mail?.sent) {
        setMessage(
          "Mise a jour enregistree. Aucun email n'a ete envoye; verifiez la configuration SMTP si besoin.",
        );
      } else {
        setMessage("Mise a jour enregistree.");
      }

      return payload.repair as RepairDetail;
    } catch {
      setError("Mise a jour impossible.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await patchRepair({
      status,
      internalNotes,
      estimatedPriceCents: inputToCents(estimatedPrice),
      partsCostCents: inputToCents(partsCost),
      partsStatus,
      partsDescription,
    });
  }

  async function handleSendQuote() {
    await patchRepair({
      estimatedPriceCents: inputToCents(estimatedPrice),
      partsCostCents: inputToCents(partsCost),
      sendQuote: true,
    });
  }

  async function handleArchive() {
    const updatedRepair = await patchRepair({ archived: true });

    if (updatedRepair) {
      setMessage("Reparation archivee.");
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Supprimer definitivement cette reparation ? Cette action est irreversible.",
    );

    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/repairs/${repairId}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        const payload = await response.json();
        setError(payload.error ?? "Suppression impossible.");
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("Suppression impossible.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePhotoChange(files: FileList | null) {
    const dataUrls = await readFiles(files);
    setPhotos(dataUrls);
    setMessage("");
    setError("");
  }

  async function savePhotos() {
    await patchRepair({ photos });
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Chargement...
      </div>
    );
  }

  if (!repair) {
    return (
      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-red-700">{error || "Reparation introuvable."}</p>
        <Link
          href="/admin"
          className="font-semibold text-slate-950 underline-offset-4 hover:underline"
        >
          Retour aux reparations
        </Link>
      </div>
    );
  }

  const estimatedProfitCents =
    (repair.estimatedPriceCents ?? 0) - (repair.partsCostCents ?? 0);

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin"
          className="font-semibold text-slate-950 underline-offset-4 hover:underline"
        >
          Retour aux reparations
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/repairs/${repair.id}/receipt`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Recu
          </Link>
          {!repair.archivedAt ? (
            <button
              type="button"
              onClick={handleArchive}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Archiver
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving}
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            Supprimer definitivement
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
        <div className="grid gap-6">
          <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Details</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Ticket" value={repair.ticketNumber ?? repair.id} />
              <DetailItem label="Statut" value={repair.status} />
              <DetailItem label="Client" value={`${repair.firstName} ${repair.lastName}`} />
              <DetailItem label="Telephone" value={repair.phone} />
              <DetailItem label="Email" value={repair.email} />
              <DetailItem label="Type" value={repair.deviceType} />
              <DetailItem label="Marque" value={repair.brand} />
              <DetailItem label="Modele" value={repair.model} />
              <DetailItem label="Prix estime" value={formatPrice(repair.estimatedPriceCents)} />
              <DetailItem label="Cout pieces" value={formatPrice(repair.partsCostCents)} />
              <DetailItem
                label="Benefice estime"
                value={
                  repair.estimatedPriceCents
                    ? formatPrice(Math.max(estimatedProfitCents, 0))
                    : "-"
                }
              />
              <DetailItem label="Devis" value={repair.quoteStatus} />
              <DetailItem label="Email PRET envoye" value={repair.readyEmailSent ? "Oui" : "Non"} />
              <DetailItem label="Avis envoye" value={repair.reviewEmailSent ? "Oui" : "Non"} />
              <DetailItem label="Piece" value={repair.partsStatus} />
              <DetailItem label="Archivee le" value={formatDate(repair.archivedAt)} />
              <DetailItem label="Creee le" value={formatDate(repair.createdAt)} />
              <DetailItem
                label="Description du probleme"
                value={repair.issueDescription}
                wide
              />
              <DetailItem
                label="Code ou note de deverrouillage"
                value={repair.unlockCodeOrNote || "-"}
                wide
              />
              <DetailItem
                label="Details piece"
                value={repair.partsDescription || "-"}
                wide
              />
            </dl>
          </div>

          <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Photos</h2>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => void handlePhotoChange(event.target.files)}
              className="text-sm"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {photos.map((photo, index) => (
                <img
                  key={`${photo.slice(0, 24)}-${index}`}
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="aspect-[4/3] w-full rounded-md border border-slate-200 object-cover"
                />
              ))}
              {photos.length === 0 ? (
                <p className="text-sm text-slate-500">Aucune photo.</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={savePhotos}
              disabled={isSaving}
              className="w-fit rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Enregistrer les photos
            </button>
          </div>

          <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Signatures</h2>
            <p className="text-sm leading-6 text-slate-600">
              Les signatures sont en lecture seule dans l&apos;admin. Seul le client
              peut signer depuis le formulaire client.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <SignaturePreview
                title="Depot client"
                value={repair.customerDropOffSignature}
              />
              <SignaturePreview
                title="Recuperation client"
                value={repair.customerPickupSignature}
              />
            </div>
          </div>

          <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Historique</h2>
            <div className="grid gap-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-slate-950">
                    {event.message}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {event.type} - {formatDate(event.createdAt)}
                  </p>
                </div>
              ))}
              {events.length === 0 ? (
                <p className="text-sm text-slate-500">Aucun historique.</p>
              ) : null}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="grid content-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-slate-950">Gestion</h2>
          <SelectField
            id="repair-status"
            label="Statut"
            value={status}
            options={REPAIR_STATUSES}
            onChange={(value) => setStatus(value as RepairStatus)}
          />
          <TextField
            id="estimated-price"
            label="Prix estime EUR"
            type="number"
            value={estimatedPrice}
            onChange={setEstimatedPrice}
          />
          <TextField
            id="parts-cost"
            label="Cout des pieces EUR"
            type="number"
            value={partsCost}
            onChange={setPartsCost}
          />
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Benefice estime :{" "}
            <strong className="text-slate-950">
              {formatPrice(
                Math.max(
                  (inputToCents(estimatedPrice) ?? 0) -
                    (inputToCents(partsCost) ?? 0),
                  0,
                ),
              )}
            </strong>
          </div>
          <button
            type="button"
            onClick={handleSendQuote}
            disabled={isSaving}
            className="min-h-11 rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Envoyer le devis
          </button>
          <SelectField
            id="parts-status"
            label="Piece"
            value={partsStatus}
            options={PART_STATUSES}
            onChange={(value) => setPartsStatus(value as PartStatus)}
          />
          <TextAreaField
            id="parts-description"
            label="Details piece"
            value={partsDescription}
            onChange={setPartsDescription}
            rows={4}
          />
          <TextAreaField
            id="repair-internal-notes"
            label="Notes internes"
            value={internalNotes}
            onChange={setInternalNotes}
            rows={7}
          />
          <button
            type="submit"
            disabled={isSaving}
            className="min-h-11 rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </section>
  );
}

function DetailItem({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "grid gap-1 sm:col-span-2" : "grid gap-1"}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="whitespace-pre-wrap break-words text-sm text-slate-900">
        {value}
      </dd>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label htmlFor={id} className="grid gap-2 text-sm font-medium text-slate-800">
      {label}
      <input
        id={id}
        type={type}
        value={value}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
      />
    </label>
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  rows,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label htmlFor={id} className="grid gap-2 text-sm font-medium text-slate-800">
      {label}
      <textarea
        id={id}
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
      />
    </label>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="grid gap-2 text-sm font-medium text-slate-800">
      {label}
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SignaturePreview({
  title,
  value,
}: {
  title: string;
  value: string | null;
}) {
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium text-slate-800">{title}</p>
      {value ? (
        <img
          src={value}
          alt={title}
          className="h-28 w-full rounded-md border border-slate-200 bg-white object-contain"
        />
      ) : (
        <div className="grid h-28 place-items-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
          Aucune signature.
        </div>
      )}
    </div>
  );
}
