"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { REPAIR_STATUSES } from "@/lib/repairValidation";
import type { RepairStatus } from "@/lib/repairValidation";

type RepairDetail = {
  id: string;
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

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function RepairDetailClient({ repairId }: RepairDetailClientProps) {
  const [repair, setRepair] = useState<RepairDetail | null>(null);
  const [status, setStatus] = useState<RepairStatus>("PAS_ENCORE_EN_REPARATION");
  const [internalNotes, setInternalNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

      setRepair(payload.repair);
      setStatus(payload.repair.status);
      setInternalNotes(payload.repair.internalNotes ?? "");
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

      setRepair(payload.repair);
      setStatus(payload.repair.status);
      setInternalNotes(payload.repair.internalNotes ?? "");

      if (payload.mail?.attempted && payload.mail?.sent) {
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

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Details</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Reference" value={repair.id} />
            <DetailItem label="Statut" value={repair.status} />
            <DetailItem
              label="Client"
              value={`${repair.firstName} ${repair.lastName}`}
            />
            <DetailItem label="Telephone" value={repair.phone} />
            <DetailItem label="Email" value={repair.email} />
            <DetailItem label="Type" value={repair.deviceType} />
            <DetailItem label="Marque" value={repair.brand} />
            <DetailItem label="Modele" value={repair.model} />
            <DetailItem
              label="Email PRET envoye"
              value={repair.readyEmailSent ? "Oui" : "Non"}
            />
            <DetailItem label="Archivee le" value={formatDate(repair.archivedAt)} />
            <DetailItem label="Creee le" value={formatDate(repair.createdAt)} />
            <DetailItem label="Mise a jour le" value={formatDate(repair.updatedAt)} />
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
          </dl>
        </div>

        <form
          onSubmit={handleSave}
          className="grid content-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-slate-950">Gestion</h2>
          <div className="grid gap-2">
            <label htmlFor="repair-status" className="text-sm font-medium text-slate-800">
              Statut
            </label>
            <select
              id="repair-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as RepairStatus)}
              className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            >
              {REPAIR_STATUSES.map((repairStatus) => (
                <option key={repairStatus} value={repairStatus}>
                  {repairStatus}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="repair-internal-notes"
              className="text-sm font-medium text-slate-800"
            >
              Notes internes
            </label>
            <textarea
              id="repair-internal-notes"
              value={internalNotes}
              onChange={(event) => setInternalNotes(event.target.value)}
              rows={8}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
            />
          </div>

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
