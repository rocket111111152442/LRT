"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  CUSTOMER_TYPES,
  PART_STATUSES,
  REPAIR_PAYMENT_STATUSES,
  REPAIR_STATUSES,
  type CustomerType,
  type PartStatus,
  type RepairPaymentStatus,
  type RepairStatus,
} from "@/lib/repairValidation";
import { compressImages as readFiles } from "@/lib/imageCompress";

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
  urgent: boolean;
  expressMode: boolean;
  estimatedPriceCents: number | null;
  partsCostCents: number | null;
  paidAmountCents: number;
  depositCents: number;
  paymentStatus: RepairPaymentStatus;
  warrantyUntil: string | null;
  warrantyReturn: boolean;
  expectedPickupAt: string | null;
  technicianName: string | null;
  timeSpentMinutes: number;
  checklistDiagnostic: boolean;
  checklistBackup: boolean;
  checklistFunctionalTest: boolean;
  checklistCleaning: boolean;
  customerType: CustomerType;
  satisfactionRating: number | null;
  satisfactionComment: string | null;
  reviewRespondedAt: string | null;
  supplierOrderNote: string | null;
  partsUsed: string | null;
  usedInventoryItemId: string | null;
  usedInventoryItemName: string | null;
  usedInventoryQuantity: number;
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

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  unitCostCents: number;
};

type CustomerHistoryItem = {
  id: string;
  ticketNumber: string | null;
  deviceType: string;
  brand: string;
  model: string;
  status: string;
  createdAt: string;
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
  if (cents === null) {
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

function dateToInput(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function dateTimeToInput(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
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

export function RepairDetailClient({ repairId }: RepairDetailClientProps) {
  const [repair, setRepair] = useState<RepairDetail | null>(null);
  const [events, setEvents] = useState<RepairEvent[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [customerHistory, setCustomerHistory] = useState<CustomerHistoryItem[]>([]);
  const [status, setStatus] = useState<RepairStatus>("PAS_ENCORE_EN_REPARATION");
  const [internalNotes, setInternalNotes] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [expressMode, setExpressMode] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [partsCost, setPartsCost] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [deposit, setDeposit] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState<RepairPaymentStatus>("NON_PAYE");
  const [warrantyUntil, setWarrantyUntil] = useState("");
  const [warrantyReturn, setWarrantyReturn] = useState(false);
  const [expectedPickupAt, setExpectedPickupAt] = useState("");
  const [technicianName, setTechnicianName] = useState("");
  const [timeSpentMinutes, setTimeSpentMinutes] = useState("0");
  const [checklistDiagnostic, setChecklistDiagnostic] = useState(false);
  const [checklistBackup, setChecklistBackup] = useState(false);
  const [checklistFunctionalTest, setChecklistFunctionalTest] = useState(false);
  const [checklistCleaning, setChecklistCleaning] = useState(false);
  const [customerType, setCustomerType] = useState<CustomerType>("STANDARD");
  const [supplierOrderNote, setSupplierOrderNote] = useState("");
  const [partsUsed, setPartsUsed] = useState("");
  const [usedInventoryItemId, setUsedInventoryItemId] = useState("");
  const [usedInventoryQuantity, setUsedInventoryQuantity] = useState("0");
  const [partsStatus, setPartsStatus] = useState<PartStatus>("NONE");
  const [partsDescription, setPartsDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function syncRepair(
    payloadRepair: RepairDetail,
    payloadEvents?: RepairEvent[],
    payloadInventoryItems?: InventoryItem[],
    payloadCustomerHistory?: CustomerHistoryItem[],
  ) {
    setRepair(payloadRepair);
    setStatus(payloadRepair.status);
    setInternalNotes(payloadRepair.internalNotes ?? "");
    setUrgent(payloadRepair.urgent);
    setExpressMode(payloadRepair.expressMode);
    setEstimatedPrice(centsToInput(payloadRepair.estimatedPriceCents));
    setPartsCost(centsToInput(payloadRepair.partsCostCents));
    setPaidAmount(centsToInput(payloadRepair.paidAmountCents));
    setDeposit(centsToInput(payloadRepair.depositCents));
    setPaymentStatus(payloadRepair.paymentStatus);
    setWarrantyUntil(dateToInput(payloadRepair.warrantyUntil));
    setWarrantyReturn(payloadRepair.warrantyReturn);
    setExpectedPickupAt(dateTimeToInput(payloadRepair.expectedPickupAt));
    setTechnicianName(payloadRepair.technicianName ?? "");
    setTimeSpentMinutes(String(payloadRepair.timeSpentMinutes ?? 0));
    setChecklistDiagnostic(payloadRepair.checklistDiagnostic);
    setChecklistBackup(payloadRepair.checklistBackup);
    setChecklistFunctionalTest(payloadRepair.checklistFunctionalTest);
    setChecklistCleaning(payloadRepair.checklistCleaning);
    setCustomerType(payloadRepair.customerType);
    setSupplierOrderNote(payloadRepair.supplierOrderNote ?? "");
    setPartsUsed(payloadRepair.partsUsed ?? "");
    setUsedInventoryItemId(payloadRepair.usedInventoryItemId ?? "");
    setUsedInventoryQuantity(String(payloadRepair.usedInventoryQuantity ?? 0));
    setPartsStatus(payloadRepair.partsStatus);
    setPartsDescription(payloadRepair.partsDescription ?? "");
    setPhotos(payloadRepair.photos ?? []);

    if (payloadEvents) {
      setEvents(payloadEvents);
    }

    if (payloadInventoryItems) {
      setInventoryItems(payloadInventoryItems);
    }

    if (payloadCustomerHistory) {
      setCustomerHistory(payloadCustomerHistory);
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

      syncRepair(
        payload.repair,
        payload.events ?? [],
        payload.inventoryItems ?? [],
        payload.customerHistory ?? [],
      );
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

      syncRepair(
        payload.repair,
        payload.events ?? [],
        payload.inventoryItems ?? [],
        payload.customerHistory ?? [],
      );

      if (payload.mail?.reviewAttempted && payload.mail?.reviewSent) {
        setMessage("Mise a jour enregistree. Email d'avis envoye au client.");
      } else if (payload.mail?.reviewAttempted && !payload.mail?.reviewSent) {
        setMessage(
          "Mise a jour enregistree. L'email d'avis n'a pas ete envoye; verifiez la configuration SMTP.",
        );
      } else if (
        payload.mail?.acceptedTicketAttempted &&
        payload.mail?.acceptedTicketSent
      ) {
        setMessage("Demande acceptee. Le ticket a ete envoye au client.");
      } else if (
        payload.mail?.acceptedTicketAttempted &&
        !payload.mail?.acceptedTicketSent
      ) {
        setMessage(
          "Demande acceptee. L'email de ticket n'a pas ete envoye; verifiez la configuration SMTP.",
        );
      } else if (payload.mail?.quoteAttempted) {
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
      urgent,
      expressMode,
      estimatedPriceCents: inputToCents(estimatedPrice),
      partsCostCents: inputToCents(partsCost),
      paidAmountCents: inputToCents(paidAmount) ?? 0,
      depositCents: inputToCents(deposit) ?? 0,
      paymentStatus,
      warrantyUntil: warrantyUntil || null,
      warrantyReturn,
      expectedPickupAt: expectedPickupAt || null,
      technicianName,
      timeSpentMinutes: Number(timeSpentMinutes || 0),
      checklistDiagnostic,
      checklistBackup,
      checklistFunctionalTest,
      checklistCleaning,
      customerType,
      supplierOrderNote,
      partsUsed,
      usedInventoryItemId: usedInventoryItemId || "",
      usedInventoryQuantity: Number(usedInventoryQuantity || 0),
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

  async function handleAcceptClientRequest() {
    await patchRepair({
      acceptClientRequest: true,
      internalNotes: internalNotes || "Demande client acceptee par l'atelier.",
    });
  }

  async function handleRefuseClientRequest() {
    const confirmed = window.confirm(
      "Refuser cette demande client et l'annuler ?",
    );

    if (!confirmed) {
      return;
    }

    await patchRepair({
      refuseClientRequest: true,
      internalNotes: internalNotes || "Demande client refusee par l'atelier.",
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
  const remainingBalanceCents = Math.max(
    (repair.estimatedPriceCents ?? 0) - (repair.paidAmountCents ?? 0),
    0,
  );
  const trackingUrl =
    typeof window === "undefined"
      ? "/suivi"
      : `${window.location.origin}/suivi`;
  const signatureUrl =
    typeof window === "undefined"
      ? `/signature/${repair.ticketNumber ?? repair.id}`
      : `${window.location.origin}/signature/${repair.ticketNumber ?? repair.id}`;

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
          <Link
            href={`/admin/repairs/${repair.id}/invoice`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Facture
          </Link>
          <Link
            href={`/admin/repairs/${repair.id}/label`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Étiquette QR
          </Link>
          <CopyTrackingLinkButton ticket={repair.ticketNumber ?? repair.id} />
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
              <DetailItem label="Priorite" value={repair.urgent ? "Urgent" : "Normal"} />
              <DetailItem label="Mode express" value={repair.expressMode ? "Oui" : "Non"} />
              <DetailItem label="Client" value={`${repair.firstName} ${repair.lastName}`} />
              <DetailItem label="Type client" value={repair.customerType} />
              <DetailItem label="Telephone" value={repair.phone} />
              <DetailItem label="Email" value={repair.email} />
              <DetailItem label="Type" value={repair.deviceType} />
              <DetailItem label="Marque" value={repair.brand} />
              <DetailItem label="Modele" value={repair.model} />
              <DetailItem label="Prix estime" value={formatPrice(repair.estimatedPriceCents)} />
              <DetailItem label="Cout pieces" value={formatPrice(repair.partsCostCents)} />
              <DetailItem label="Acompte" value={formatPrice(repair.depositCents)} />
              <DetailItem label="Paye" value={formatPrice(repair.paidAmountCents)} />
              <DetailItem label="Reste a payer" value={formatPrice(remainingBalanceCents)} />
              <DetailItem label="Statut paiement" value={repair.paymentStatus} />
              <DetailItem
                label="Benefice reel estime"
                value={
                  repair.estimatedPriceCents
                    ? formatPrice(Math.max(estimatedProfitCents, 0))
                    : "-"
                }
              />
              <DetailItem label="Devis" value={repair.quoteStatus} />
              <DetailItem label="Technicien" value={repair.technicianName || "-"} />
              <DetailItem label="Temps passe" value={`${repair.timeSpentMinutes} min`} />
              <DetailItem label="Recuperation prevue" value={formatDate(repair.expectedPickupAt)} />
              <DetailItem label="Fin garantie" value={formatDate(repair.warrantyUntil)} />
              <DetailItem label="Retour garantie" value={repair.warrantyReturn ? "Oui" : "Non"} />
              <DetailItem label="Piece utilisee" value={repair.usedInventoryItemName || repair.partsUsed || "-"} />
              <DetailItem
                label="Quantite piece"
                value={repair.usedInventoryQuantity ? String(repair.usedInventoryQuantity) : "-"}
              />
              <DetailItem label="Email PRET envoye" value={repair.readyEmailSent ? "Oui" : "Non"} />
              <DetailItem label="Avis envoye" value={repair.reviewEmailSent ? "Oui" : "Non"} />
              <DetailItem label="Avis recu le" value={formatDate(repair.reviewRespondedAt)} />
              <DetailItem
                label="Client satisfait"
                value={repair.satisfactionRating ? `${repair.satisfactionRating}/5` : "-"}
              />
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
              <DetailItem
                label="Commande fournisseur"
                value={repair.supplierOrderNote || "-"}
                wide
              />
              <DetailItem
                label="Avis client"
                value={repair.satisfactionComment || "-"}
                wide
              />
            </dl>
          </div>

          <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">
              Documents client
            </h2>
            <div className="grid gap-2 text-sm text-slate-700">
              <p>
                Suivi client :{" "}
                <span className="font-semibold text-slate-950">{trackingUrl}</span>
              </p>
              <p>
                Signature recuperation :{" "}
                <span className="break-all font-semibold text-slate-950">
                  {signatureUrl}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/repairs/${repair.id}/receipt`}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Recu depot
              </Link>
              <Link
                href={`/admin/repairs/${repair.id}/invoice`}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Facture
              </Link>
              <Link
                href={`/documents/${repair.ticketNumber ?? repair.id}`}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Page documents client
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">
              Historique client
            </h2>
            <div className="grid gap-2">
              {customerHistory.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/repairs/${item.id}`}
                  className="flex flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition hover:bg-slate-100 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-semibold text-slate-950">
                    {item.ticketNumber ?? item.id.slice(0, 8)}
                  </span>
                  <span className="text-slate-700">
                    {item.deviceType} {item.brand} {item.model}
                  </span>
                  <span className="text-slate-500">{item.status}</span>
                  <span className="text-slate-500">
                    {formatDate(item.createdAt)}
                  </span>
                </Link>
              ))}
              {customerHistory.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Aucune autre reparation trouvee pour ce client.
                </p>
              ) : null}
            </div>
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
                // eslint-disable-next-line @next/next/no-img-element -- data URL base64, non optimisable par next/image
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
          {repair.status === "PAS_ENCORE_RECU_CLIENT" &&
          repair.quoteStatus !== "ACCEPTED" ? (
            <div className="grid gap-3 rounded-md border border-sky-200 bg-sky-50 p-3">
              <div>
                <p className="text-sm font-semibold text-sky-950">
                  Demande client avant depot
                </p>
                <p className="mt-1 text-xs leading-5 text-sky-800">
                  Si aucun prix n&apos;est necessaire, acceptez la demande : le
                  client recevra son ticket et pourra deposer l&apos;appareil.
                  Si un prix doit etre valide, renseignez le prix puis envoyez
                  le devis par email.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAcceptClientRequest}
                  disabled={isSaving}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Accepter sans prix
                </button>
                <button
                  type="button"
                  onClick={handleRefuseClientRequest}
                  disabled={isSaving}
                  className="rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  Refuser
                </button>
              </div>
            </div>
          ) : null}
          <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <CheckField
              label="Priorite urgente"
              checked={urgent}
              onChange={setUrgent}
            />
            <CheckField
              label="Mode reparation express"
              checked={expressMode}
              onChange={setExpressMode}
            />
          </div>
          <SelectField
            id="repair-status"
            label="Statut"
            value={status}
            options={REPAIR_STATUSES}
            onChange={(value) => setStatus(value as RepairStatus)}
          />
          <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-950">Agenda atelier</p>
            <TextField
              id="expected-pickup"
              label="Date prevue de recuperation"
              type="datetime-local"
              value={expectedPickupAt}
              onChange={setExpectedPickupAt}
            />
            <TextField
              id="technician-name"
              label="Technicien"
              value={technicianName}
              onChange={setTechnicianName}
            />
            <TextField
              id="time-spent"
              label="Temps passe minutes"
              type="number"
              value={timeSpentMinutes}
              onChange={setTimeSpentMinutes}
            />
          </div>
          <TextField
            id="estimated-price"
            label="Prix estime EUR"
            type="number"
            value={estimatedPrice}
            onChange={setEstimatedPrice}
          />
          <SelectField
            id="payment-status"
            label="Paiement"
            value={paymentStatus}
            options={REPAIR_PAYMENT_STATUSES}
            onChange={(value) => setPaymentStatus(value as RepairPaymentStatus)}
          />
          <TextField
            id="deposit"
            label="Acompte EUR"
            type="number"
            value={deposit}
            onChange={setDeposit}
          />
          <TextField
            id="paid-amount"
            label="Montant paye EUR"
            type="number"
            value={paidAmount}
            onChange={setPaidAmount}
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
          <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-950">Garantie client</p>
            <TextField
              id="warranty-until"
              label="Fin de garantie"
              type="date"
              value={warrantyUntil}
              onChange={setWarrantyUntil}
            />
            <CheckField
              label="Retour sous garantie"
              checked={warrantyReturn}
              onChange={setWarrantyReturn}
            />
            <SelectField
              id="customer-type"
              label="Type client"
              value={customerType}
              options={CUSTOMER_TYPES}
              onChange={(value) => setCustomerType(value as CustomerType)}
            />
          </div>
          <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-950">Checklist</p>
            <CheckField
              label="Diagnostic effectue"
              checked={checklistDiagnostic}
              onChange={setChecklistDiagnostic}
            />
            <CheckField
              label="Sauvegarde / donnees verifiees"
              checked={checklistBackup}
              onChange={setChecklistBackup}
            />
            <CheckField
              label="Tests fonctionnels effectues"
              checked={checklistFunctionalTest}
              onChange={setChecklistFunctionalTest}
            />
            <CheckField
              label="Nettoyage final"
              checked={checklistCleaning}
              onChange={setChecklistCleaning}
            />
          </div>
          <SelectField
            id="parts-status"
            label="Piece"
            value={partsStatus}
            options={PART_STATUSES}
            onChange={(value) => setPartsStatus(value as PartStatus)}
          />
          <SelectField
            id="used-inventory-item"
            label="Piece sortie du stock"
            value={usedInventoryItemId}
            options={["", ...inventoryItems.map((item) => item.id)]}
            optionLabels={{
              "": "Aucune piece du stock",
              ...Object.fromEntries(
                inventoryItems.map((item) => [
                  item.id,
                  `${item.name} (${item.quantity} dispo - ${formatPrice(item.unitCostCents)})`,
                ]),
              ),
            }}
            onChange={setUsedInventoryItemId}
          />
          <TextField
            id="used-inventory-quantity"
            label="Quantite utilisee"
            type="number"
            value={usedInventoryQuantity}
            onChange={setUsedInventoryQuantity}
          />
          <TextField
            id="parts-cost"
            label="Cout des pieces EUR"
            type="number"
            value={partsCost}
            onChange={setPartsCost}
          />
          <TextAreaField
            id="parts-description"
            label="Details piece"
            value={partsDescription}
            onChange={setPartsDescription}
            rows={4}
          />
          <TextAreaField
            id="parts-used"
            label="Pieces utilisees"
            value={partsUsed}
            onChange={setPartsUsed}
            rows={3}
          />
          <TextAreaField
            id="supplier-order"
            label="Commande fournisseur"
            value={supplierOrderNote}
            onChange={setSupplierOrderNote}
            rows={3}
          />
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
            L&apos;avis client est en lecture seule dans l&apos;admin. Il est
            enregistre uniquement depuis le lien envoye au client quand la
            reparation passe a RECUPERE.
          </div>
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
  optionLabels,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  optionLabels?: Record<string, string>;
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
            {optionLabels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300"
      />
      {label}
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
        // eslint-disable-next-line @next/next/no-img-element -- data URL (signature), non optimisable par next/image
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

function CopyTrackingLinkButton({ ticket }: { ticket: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/suivi?ticket=${encodeURIComponent(ticket)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiez le lien de suivi :", url);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
    >
      {copied ? "Lien copié ✓" : "Copier le lien de suivi"}
    </button>
  );
}
