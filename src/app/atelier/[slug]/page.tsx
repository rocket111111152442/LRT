import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QoravoLogo } from "@/components/QoravoLogo";
import { isProAccountActive } from "@/lib/accountStatus";
import { prisma } from "@/lib/prisma";

type AtelierPageProps = {
  params: Promise<{ slug: string }>;
};

async function getAtelier(slug: string) {
  return prisma.proAccount.findUnique({
    where: { slug },
    select: {
      companyName: true,
      slug: true,
      publicDescription: true,
      publicPhone: true,
      publicAddress: true,
      shopAddress: true,
      shopPostalCode: true,
      shopCity: true,
      shopCountry: true,
      shopPhone: true,
      shopEmail: true,
      paymentStatus: true,
      trialEndsAt: true,
      publicListed: true,
    },
  });
}

export async function generateMetadata({ params }: AtelierPageProps): Promise<Metadata> {
  const { slug } = await params;
  const account = await getAtelier(slug);
  if (!account || !isProAccountActive(account) || account.publicListed === false) {
    return { title: "Atelier introuvable", robots: { index: false, follow: false } };
  }
  const location = [account.shopCity, account.shopCountry].filter(Boolean).join(", ");
  return {
    title: `${account.companyName} — Réparateur${location ? ` à ${location}` : ""}`,
    description:
      account.publicDescription ||
      `Découvrez ${account.companyName}, atelier de réparation référencé sur Qoravo. Envoyez une demande et suivez votre appareil en ligne.`,
    alternates: { canonical: `/atelier/${account.slug}` },
  };
}

export default async function AtelierPage({ params }: AtelierPageProps) {
  const { slug } = await params;
  const account = await getAtelier(slug);

  if (!account || !isProAccountActive(account) || account.publicListed === false) {
    notFound();
  }

  const address = [
    account.shopAddress ?? account.publicAddress,
    account.shopPostalCode,
    account.shopCity,
    account.shopCountry,
  ].filter(Boolean).join(", ");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: account.companyName,
    description: account.publicDescription ?? undefined,
    url: `https://www.qoravo.fr/atelier/${account.slug}`,
    telephone: account.shopPhone ?? account.publicPhone ?? undefined,
    email: account.shopEmail ?? undefined,
    address: address
      ? {
          "@type": "PostalAddress",
          streetAddress: account.shopAddress ?? account.publicAddress ?? undefined,
          postalCode: account.shopPostalCode ?? undefined,
          addressLocality: account.shopCity ?? undefined,
          addressCountry: account.shopCountry ?? undefined,
        }
      : undefined,
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <section className="border-b border-slate-200 bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-4xl gap-6">
          <QoravoLogo textClassName="text-white" />
          <div className="grid gap-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Atelier de reparation
            </p>
            <h1 className="text-4xl font-semibold">{account.companyName}</h1>
            <p className="max-w-2xl text-base leading-7 text-slate-200">
              {account.publicDescription ||
                "Deposez votre demande de reparation en quelques minutes et suivez ensuite l'avancement avec votre numero de ticket."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/nouvelle-reparation?compte=${account.slug}`}
              className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Demander une reparation
            </Link>
            <Link
              href="/suivi"
              className="rounded-md border border-white/60 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Suivre mon ticket
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
          <InfoCard label="Atelier" value={account.companyName} />
          <InfoCard label="Telephone" value={account.shopPhone || account.publicPhone || "Voir en magasin"} />
          <InfoCard label="Adresse" value={address || "Voir en magasin"} />
        </div>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}
