import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { QoravoLogo } from "@/components/QoravoLogo";
import { getAvailableSlots } from "@/lib/shopAvailability";
import { formatOpeningHours, isShopOpenAt, todayOpeningLabel } from "@/lib/shopHours";
import { prisma } from "@/lib/prisma";

type ShopPageProps = {
  params: Promise<{ slug: string }>;
};

function addressLabel(shop: {
  shopAddress: string | null;
  shopPostalCode: string | null;
  shopCity: string | null;
  shopCountry: string | null;
}) {
  return [
    shop.shopAddress,
    shop.shopPostalCode,
    shop.shopCity,
    shop.shopCountry,
  ]
    .filter(Boolean)
    .join(", ");
}

function formatSlot(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function ClientShopDetailPage({ params }: ShopPageProps) {
  const { slug } = await params;
  const shop = await prisma.proAccount.findUnique({
    where: { slug },
    select: {
      id: true,
      companyName: true,
      slug: true,
      ownerEmail: true,
      publicDescription: true,
      shopAddress: true,
      shopPostalCode: true,
      shopCity: true,
      shopCountry: true,
      shopPhone: true,
      shopEmail: true,
      shopOpeningHours: true,
      shopSlotDurationMinutes: true,
      shopMaxAppointmentsPerSlot: true,
      paymentStatus: true,
    },
  });

  if (!shop || shop.paymentStatus !== "PAID") {
    notFound();
  }

  const repairs = await prisma.repair.findMany({
    where: {
      proAccountId: shop.id,
      archivedAt: null,
      status: { notIn: ["RECUPERE", "ANNULE"] },
      expectedPickupAt: { not: null },
    },
    select: { expectedPickupAt: true },
  });
  const slots = getAvailableSlots({
    openingHours: shop.shopOpeningHours,
    scheduledDates: repairs.map((repair) => repair.expectedPickupAt),
    slotDurationMinutes: shop.shopSlotDurationMinutes,
    maxAppointmentsPerSlot: shop.shopMaxAppointmentsPerSlot,
    days: 14,
    limit: 12,
  });
  const isOpenNow = isShopOpenAt(shop.shopOpeningHours);
  const fullAddress = addressLabel(shop);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <QoravoLogo />
          <Link
            href="/client/magasins"
            className="w-fit rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Retour aux magasins
          </Link>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_360px]">
          <article className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="grid gap-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                  Atelier partenaire
                </p>
                <h1 className="text-3xl font-semibold text-slate-950">
                  {shop.companyName}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                  {shop.publicDescription ||
                    "Cet atelier peut recevoir votre demande de devis Qoravo."}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isOpenNow
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {isOpenNow ? "Ouvert maintenant" : "Ferme maintenant"}
              </span>
            </div>

            <div className="grid gap-3 text-sm text-slate-700">
              {fullAddress ? (
                <p className="inline-flex items-center gap-2">
                  <MapPin aria-hidden="true" className="h-4 w-4 text-sky-600" />
                  {fullAddress}
                </p>
              ) : null}
              {shop.shopPhone ? (
                <a
                  href={`tel:${shop.shopPhone}`}
                  className="inline-flex items-center gap-2 font-semibold text-slate-950"
                >
                  <Phone aria-hidden="true" className="h-4 w-4 text-emerald-600" />
                  {shop.shopPhone}
                </a>
              ) : null}
              <p className="inline-flex items-center gap-2">
                <Mail aria-hidden="true" className="h-4 w-4 text-cyan-600" />
                {shop.shopEmail ?? shop.ownerEmail}
              </p>
              <p className="inline-flex items-center gap-2">
                <Clock aria-hidden="true" className="h-4 w-4 text-amber-600" />
                {todayOpeningLabel(shop.shopOpeningHours)}
              </p>
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                {formatOpeningHours(shop.shopOpeningHours)}
              </p>
            </div>
          </article>

          <aside className="grid content-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Disponibilites
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                Choisir un creneau
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Le creneau est revu au moment de l&apos;envoi pour eviter les doublons.
              </p>
            </div>

            <div className="grid gap-2">
              {slots.map((slot) => (
                <Link
                  key={slot.toISOString()}
                  href={`/nouvelle-reparation?compte=${shop.slug}&creneau=${encodeURIComponent(slot.toISOString())}`}
                  className="inline-flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-100"
                >
                  {formatSlot(slot)}
                  <Send aria-hidden="true" className="h-4 w-4" />
                </Link>
              ))}
              {slots.length === 0 ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
                  Aucun creneau libre trouve sur les prochains jours.
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
