import Link from "next/link";
import { AdminHeader } from "../../../AdminHeader";
import { PrintButton } from "@/components/PrintButton";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type InvoicePageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  }).format(date);
}

function toCents(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatPrice(cents: unknown) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(toCents(cents) / 100);
}

export default async function RepairInvoicePage({ params }: InvoicePageProps) {
  const admin = await requireAdminPage();
  const { id } = await params;
  const repair = await prisma.repair.findUnique({
    where: { id },
    select: {
      id: true,
      proAccountId: true,
      ticketNumber: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      deviceType: true,
      brand: true,
      model: true,
      issueDescription: true,
      estimatedPriceCents: true,
      partsCostCents: true,
      paidAmountCents: true,
      depositCents: true,
      paymentStatus: true,
      warrantyUntil: true,
      createdAt: true,
    },
  });

  if (!repair || (admin.proAccountId && repair.proAccountId !== admin.proAccountId)) {
    return (
      <>
        <AdminHeader
          email={admin.email}
          supportIncluded={admin.supportIncluded}
          paymentStatus={admin.paymentStatus}
          trialEndsAt={admin.trialEndsAt}
          proAccountSlug={admin.proAccountSlug}
        />
        <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            Facture introuvable.
          </div>
        </main>
      </>
    );
  }

  const totalCents = toCents(repair.estimatedPriceCents);
  const paidAmountCents = toCents(repair.paidAmountCents);
  const depositCents = toCents(repair.depositCents);
  const remainingCents = Math.max(totalCents - paidAmountCents, 0);

  return (
    <>
      <AdminHeader
        email={admin.email}
        supportIncluded={admin.supportIncluded}
        paymentStatus={admin.paymentStatus}
        trialEndsAt={admin.trialEndsAt}
        proAccountSlug={admin.proAccountSlug}
      />
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-3xl gap-5">
          <div className="no-print flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`/admin/repairs/${repair.id}`}
              className="font-semibold text-slate-950 underline-offset-4 hover:underline"
            >
              Retour a la fiche
            </Link>
            <PrintButton label="Imprimer / PDF" />
          </div>

          <article className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
            <header className="grid gap-2 border-b border-slate-200 pb-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Facture Qoravo
              </p>
              <h1 className="text-3xl font-semibold text-slate-950">
                {repair.ticketNumber ?? repair.id}
              </h1>
              <p className="text-sm text-slate-600">
                Date : {formatDate(repair.createdAt)}
              </p>
            </header>

            <section className="grid gap-4 sm:grid-cols-2">
              <InvoiceItem
                label="Client"
                value={`${repair.firstName ?? ""} ${repair.lastName ?? ""}`.trim() || "-"}
              />
              <InvoiceItem
                label="Contact"
                value={`${repair.phone ?? "-"} - ${repair.email ?? "-"}`}
              />
              <InvoiceItem
                label="Appareil"
                value={`${repair.deviceType ?? ""} ${repair.brand ?? ""} ${
                  repair.model ?? ""
                }`.trim() || "-"}
                wide
              />
              <InvoiceItem
                label="Intervention"
                value={repair.issueDescription ?? "-"}
                wide
              />
            </section>

            <section className="overflow-hidden rounded-md border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Ligne</th>
                    <th className="px-4 py-3 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-200">
                    <td className="px-4 py-3">Reparation</td>
                    <td className="px-4 py-3 text-right">{formatPrice(totalCents)}</td>
                  </tr>
                  <tr className="border-t border-slate-200">
                    <td className="px-4 py-3">Cout pieces interne</td>
                    <td className="px-4 py-3 text-right">{formatPrice(repair.partsCostCents)}</td>
                  </tr>
                  <tr className="border-t border-slate-200">
                    <td className="px-4 py-3">Acompte</td>
                    <td className="px-4 py-3 text-right">{formatPrice(depositCents)}</td>
                  </tr>
                  <tr className="border-t border-slate-200">
                    <td className="px-4 py-3">Deja paye</td>
                    <td className="px-4 py-3 text-right">{formatPrice(paidAmountCents)}</td>
                  </tr>
                  <tr className="border-t border-slate-200 bg-slate-50 font-semibold">
                    <td className="px-4 py-3">Reste a payer</td>
                    <td className="px-4 py-3 text-right">{formatPrice(remainingCents)}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <footer className="text-sm leading-6 text-slate-600">
              <p>Statut paiement : {repair.paymentStatus}</p>
              <p>Fin de garantie : {formatDate(repair.warrantyUntil)}</p>
            </footer>
          </article>
        </div>
      </main>
    </>
  );
}

function InvoiceItem({
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
