import type { Metadata } from "next";
import Link from "next/link";
import { checkInstallKey, expectedInstallKey, readInstallState } from "@/lib/install";
import { missingServices } from "@/lib/services";
import { printifyEnabled } from "@/lib/printify";
import { stripeEnabled } from "@/lib/stripe";
import { InstallPanel } from "@/components/InstallPanel";

export const metadata: Metadata = {
  title: "Installation",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function InstallationPage({
  searchParams,
}: {
  searchParams: Promise<{ cle?: string }>;
}) {
  const { cle } = await searchParams;
  const autorise = checkInstallKey(cle);
  const cleDisponible = expectedInstallKey() !== null;
  const etat = await readInstallState();
  const manquantes = missingServices().map((gap) => gap.variable);

  const reglages = [
    {
      cle: "DATABASE_URL",
      libelle: "Base de données",
      ok: etat.baseConfiguree,
      detail: "Posée automatiquement par l'intégration Supabase de Vercel.",
    },
    {
      cle: "AUTH_SECRET",
      libelle: "Secret des sessions",
      ok: !manquantes.includes("AUTH_SECRET"),
      detail: "Une longue suite de caractères au hasard, 32 minimum.",
    },
    {
      cle: "STRIPE_SECRET_KEY",
      libelle: "Paiement Stripe",
      ok: stripeEnabled(),
      detail: "Stripe > Développeurs > Clés API.",
    },
    {
      cle: "PRINTIFY_API_KEY",
      libelle: "Fabrication Printify",
      ok: printifyEnabled(),
      detail: "Printify > My profile > Connections > Generate token.",
    },
  ];

  return (
    <div className="section shell max-w-3xl">
      <p className="label mb-4 text-[color:var(--color-smoke)]">(Installation)</p>
      <h1 className="display-xl mb-8 max-w-[16ch]">Mise en route</h1>

      {!autorise ? (
        <div className="hairline hairline-b max-w-[60ch] py-10">
          <p className="display-lg mb-4">Clé demandée</p>
          {cleDisponible ? (
            <>
              <p className="mb-4 text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
                Cette page installe la boutique : elle ne s&apos;ouvre
                qu&apos;avec une clé, pour que personne d&apos;autre ne puisse
                s&apos;en servir.
              </p>
              <p className="mb-4 text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
                La clé, ce sont les <strong>dix premiers caractères</strong> de
                votre <code className="label-sm">AUTH_SECRET</code>. Sur Vercel :
                Settings → Environment Variables → œil pour révéler la valeur.
                Ajoutez-les à l&apos;adresse de cette page :
              </p>
              <p className="label-sm break-all border border-[color:var(--color-hairline)] px-4 py-3">
                /installation?cle=LES_DIX_PREMIERS_CARACTERES
              </p>
            </>
          ) : (
            <p className="max-w-[52ch] text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
              Renseignez d&apos;abord <code className="label-sm">AUTH_SECRET</code>{" "}
              sur Vercel (32 caractères minimum), puis relancez le site. C&apos;est
              cette valeur qui sert de clé d&apos;installation.
            </p>
          )}
        </div>
      ) : !etat.ouverte ? (
        <div className="hairline hairline-b py-10">
          <p className="display-lg mb-4">Installation terminée</p>
          <p className="mb-8 max-w-[52ch] text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
            La boutique compte {etat.comptesExistants} compte
            {etat.comptesExistants > 1 ? "s" : ""}. Cette page s&apos;est fermée
            d&apos;elle-même : elle ne sert qu&apos;une fois, et plus personne ne
            peut s&apos;en servir pour créer un administrateur.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="btn">
              Aller à l&apos;administration
            </Link>
            <Link href="/connexion" className="btn btn-outline">
              Se connecter
            </Link>
          </div>
        </div>
      ) : (
        <InstallPanel etat={etat} reglages={reglages} cle={cle ?? ""} />
      )}
    </div>
  );
}
