import Link from "next/link";
import { QoravoLogo } from "@/components/QoravoLogo";
import { PrintButton } from "@/components/PrintButton";
import { prisma } from "@/lib/prisma";
import { verifyRepairAccessToken } from "@/lib/repairAccess";
import type { Prisma } from "../../../../generated/prisma/client";

type DocumentsPageProps = {
  params: Promise<{ ticket: string }>;
  searchParams: Promise<{ access?: string }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = {
  robots: { index: false, follow: false },
};

function normalizeTicket(value: string) {
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (/^QOR\d{6}$/.test(normalized)) {
    return `QOR-${normalized.slice(3)}`;
  }

  if (/^LRT\d{6}$/.test(normalized)) {
    return `LRT-${normalized.slice(3)}`;
  }

  return normalized;
}

function formatPrice(cents: number | null | undefined) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format((cents ?? 0) / 100);
}

function formatDate(value: Date | string | number | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  }).format(date);
}

function documentRepairSelect() {
  return {
    id: true,
    ticketNumber: true,
    firstName: true,
    lastName: true,
    phone: true,
    email: true,
    deviceType: true,
    brand: true,
    model: true,
    issueDescription: true,
    status: true,
    estimatedPriceCents: true,
    paidAmountCents: true,
    paymentStatus: true,
    warrantyUntil: true,
    createdAt: true,
  } as const;
}

type DocumentRepair = Prisma.RepairGetPayload<{
  select: ReturnType<typeof documentRepairSelect>;
}>;

export default async function DocumentsPage({
  params,
  searchParams,
}: DocumentsPageProps) {
  const { ticket } = await params;
  const { access = "" } = await searchParams;
  const ticketNumber = normalizeTicket(ticket);
  let repair: DocumentRepair | null;

  try {
    repair = await prisma.repair.findUnique({
      where: { ticketNumber },
      select: documentRepairSelect(),
    });
  } catch (error) {
    console.error("Documents lookup failed", error);
    return (
      <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-xl gap-4 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          <p className="font-semibold">Document impossible a charger.</p>
          <p>
            La base de donnees n&apos;a pas repondu correctement. Rechargez la page
            dans quelques minutes.
          </p>
          <Link
            href="/suivi"
            className="font-semibold text-red-950 underline-offset-4 hover:underline"
          >
            Retour au suivi
          </Link>
        </div>
      </main>
    );
  }

  if (!repair || !verifyRepairAccessToken(repair, access)) {
    return (
      <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          Document introuvable.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-3xl gap-5">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/suivi"
            className="font-semibold text-slate-950 underline-offset-4 hover:underline"
          >
            Retour au suivi
          </Link>
          <PrintButton label="Imprimer / PDF" />
        </div>

        <article className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
          <header className="grid gap-3 border-b border-slate-200 pb-4">
            <QoravoLogo />
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Documents client
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              {repair.ticketNumber}
            </h1>
            <p className="text-sm text-slate-600">
              Cree le {formatDate(repair.createdAt)}
            </p>
          </header>

          <dl className="grid gap-4 sm:grid-cols-2">
            <DocumentItem label="Client" value={`${repair.firstName} ${repair.lastName}`} />
            <DocumentItem label="Contact" value={`${repair.phone} - ${repair.email}`} />
            <DocumentItem label="Statut" value={repair.status} />
            <DocumentItem label="Paiement" value={repair.paymentStatus} />
            <DocumentItem
              label="Appareil"
              value={`${repair.deviceType} ${repair.brand} ${repair.model}`}
              wide
            />
            <DocumentItem label="Probleme" value={repair.issueDescription} wide />
            <DocumentItem label="Prix estime" value={formatPrice(repair.estimatedPriceCents)} />
            <DocumentItem label="Deja paye" value={formatPrice(repair.paidAmountCents)} />
            <DocumentItem label="Garantie" value={formatDate(repair.warrantyUntil)} />
          </dl>
        </article>
      </div>
    </main>
  );
}

function DocumentItem({
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
      <dd className="whitespace-pre-wrap text-sm text-slate-950">{value}</dd>
    </div>
  );
}
