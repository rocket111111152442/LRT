import type { Metadata } from "next";
import Link from "next/link";
import { QoravoLogo } from "@/components/QoravoLogo";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Activation du compte professionnel",
  robots: { index: false, follow: false },
};

type PremiumPageProps = {
  searchParams: Promise<{ compte?: string }>;
};

export default async function PremiumPage({ searchParams }: PremiumPageProps) {
  const { compte } = await searchParams;
  const account = compte
    ? await prisma.proAccount.findUnique({
        where: { slug: compte },
        select: { companyName: true, slug: true, referralCode: true },
      })
    : null;

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-xl gap-5 rounded-lg border border-emerald-200 bg-white p-6 shadow-sm">
        <QoravoLogo />
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Acces premium active
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">
          Votre compte pro est actif.
        </h1>
        <p className="text-sm leading-6 text-slate-700">
          Le compte {compte ? <strong>{compte}</strong> : "pro"} a acces a
          l espace admin. Vous pouvez maintenant vous connecter avec l email et
          le mot de passe choisis pendant l inscription.
        </p>
        {account ? (
          <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p>
              Vitrine :{" "}
              <Link
                href={`/atelier/${account.slug}`}
                className="font-semibold text-slate-950 underline-offset-4 hover:underline"
              >
                /atelier/{account.slug}
              </Link>
            </p>
            <p>
              Formulaire client :{" "}
              <Link
                href={`/nouvelle-reparation?compte=${account.slug}`}
                className="font-semibold text-slate-950 underline-offset-4 hover:underline"
              >
                /nouvelle-reparation?compte={account.slug}
              </Link>
            </p>
            <p>
              Code parrainage :{" "}
              <strong className="text-slate-950">
                {account.referralCode ?? `${account.slug.toUpperCase()}-Qoravo`}
              </strong>
            </p>
          </div>
        ) : null}
        <Link
          href="/admin/login"
          className="rounded-md bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Aller a la connexion admin
        </Link>
      </div>
    </main>
  );
}
