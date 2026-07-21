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

async function loadRepair(id: string) {
  return prisma.repair.findUnique({
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
}

type ShopInfo = {
  name: string | null;
  addressLines: string[];
  phone: string | null;
  email: string | null;
  openingHours: string | null;
};

// Coordonnées de l'atelier pour l'en-tête de facture. On privilégie les réglages
// e-mail (que l'atelier configure pour ses clients), sinon la fiche ProAccount.
// Chaque atelier ne voit QUE ses propres infos (cloisonnement par proAccountId).
async function loadShopInfo(proAccountId: string | null): Promise<ShopInfo | null> {
  if (!proAccountId) {
    return null;
  }

  try {
    const [account, email] = await Promise.all([
      prisma.proAccount.findUnique({
        where: { id: proAccountId },
        select: {
          companyName: true,
          publicAddress: true,
          shopAddress: true,
          shopPostalCode: true,
          shopCity: true,
          shopPhone: true,
          publicPhone: true,
          shopEmail: true,
          ownerEmail: true,
        },
      }),
      prisma.emailSettings.findUnique({ where: { id: proAccountId } }),
    ]);

    const name = email?.shopName || account?.companyName || null;
    const cityLine = [account?.shopPostalCode, account?.shopCity]
      .filter(Boolean)
      .join(" ")
      .trim();
    const addressLines = [
      email?.shopAddress || account?.shopAddress || account?.publicAddress || null,
      cityLine || null,
    ].filter(Boolean) as string[];
    const phone = email?.shopPhone || account?.shopPhone || account?.publicPhone || null;
    const contactEmail = account?.shopEmail || account?.ownerEmail || null;
    const openingHours = email?.shopOpeningHours || null;

    if (!name && addressLines.length === 0 && !phone && !contactEmail) {
      return null;
    }

    return { name, addressLines, phone, email: contactEmail, openingHours };
  } catch (error) {
    console.error("Invoice shop info load failed", error);
    return null;
  }
}

export default async function RepairInvoicePage({ params }: InvoicePageProps) {
  const admin = await requireAdminPage();
  const { id } = await params;

  let repair: Awaited<ReturnType<typeof loadRepair>> = null;

  try {
    repair = await loadRepair(id);
  } catch (error) {
    console.error("Invoice load failed", error);

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
          <div className="mx-auto max-w-3xl rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            La facture n&apos;a pas pu être chargée pour le moment. Revenez à la
            fiche de réparation puis réessayez.
          </div>
        </main>
      </>
    );
  }

  if (!repair || (admin.proAccountId && repair.proAccountId && repair.proAccountId !== admin.proAccountId)) {
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

  const shop = await loadShopInfo(repair.proAccountId);

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
            <header className="grid gap-3 border-b border-slate-200 pb-4">
              {shop ? (
                <div className="grid gap-0.5">
                  {shop.name ? (
                    <p className="text-lg font-semibold text-slate-950">{shop.name}</p>
                  ) : null}
                  {shop.addressLines.map((line, index) => (
                    <p key={index} className="text-sm text-slate-600">
                      {line}
                    </p>
                  ))}
                  {shop.phone || shop.email ? (
                    <p className="text-sm text-slate-600">
                      {[shop.phone, shop.email].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                  {shop.openingHours ? (
                    <p className="text-xs text-slate-500">{shop.openingHours}</p>
                  ) : null}
                </div>
              ) : null}
              <div className="grid gap-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Facture
                </p>
                <h1 className="text-3xl font-semibold text-slate-950">
                  {repair.ticketNumber ?? repair.id}
                </h1>
                <p className="text-sm text-slate-600">
                  Date : {formatDate(repair.createdAt)}
                </p>
              </div>
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
