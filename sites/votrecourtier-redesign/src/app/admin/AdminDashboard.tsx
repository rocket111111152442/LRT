import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { formatChf, propertyStatusLabels, propertyTypeLabels, type Property } from "@/lib/data/properties";
import { LogoutButton } from "./LogoutButton";
import { AddPropertyForm } from "./AddPropertyForm";

export function AdminDashboard({ properties, blobConfigured }: { properties: Property[]; blobConfigured: boolean }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8">
      <div className="flex items-center justify-between border-b border-stone pb-6">
        <Logo />
        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-ink-soft transition-colors hover:text-ink">
            Voir le site ↗
          </Link>
          <LogoutButton />
        </div>
      </div>

      <h1 className="mt-10 font-serif text-2xl text-ink">Administration — biens</h1>

      {!blobConfigured ? (
        <div className="mt-6 border border-clay-line bg-clay-soft/20 p-5 text-sm leading-relaxed text-ink">
          <p className="font-medium">Le stockage n&rsquo;est pas encore connecté.</p>
          <p className="mt-1.5 text-ink-soft">
            Pour pouvoir ajouter des biens et des photos, connectez un Blob store à ce projet Vercel : Vercel
            Dashboard → projet <strong>votrecourtier-redesign</strong> → onglet Storage → Create Database → Blob →
            Connect Project. La variable <code className="text-xs">BLOB_READ_WRITE_TOKEN</code> est ajoutée
            automatiquement ; redéployez ensuite une fois (ou attendez le prochain déploiement).
          </p>
        </div>
      ) : null}

      <section className="mt-12">
        <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-faint">
          Biens ajoutés ({properties.length})
        </p>
        {properties.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">Aucun bien ajouté pour le moment.</p>
        ) : (
          <ul className="mt-4 divide-y divide-stone border-y border-stone">
            {properties.map((p) => (
              <li key={p.slug} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <Link href={`/tous-nos-biens/${p.slug}`} className="font-serif text-lg text-ink hover:text-clay">
                    {p.title}
                  </Link>
                  <p className="mt-1 text-xs text-ink-faint">
                    {p.city} — {p.canton} · {propertyTypeLabels[p.type]} · {propertyStatusLabels[p.status]} ·{" "}
                    {p.photos?.length ?? 0} photo{(p.photos?.length ?? 0) > 1 ? "s" : ""}
                  </p>
                </div>
                <p className="font-feature-numeric text-sm text-ink">CHF {formatChf(p.priceChf)}.—</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14">
        <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-faint">Ajouter un bien</p>
        <div className="mt-4 border border-stone bg-paper p-6 sm:p-8">
          <AddPropertyForm disabled={!blobConfigured} />
        </div>
      </section>
    </div>
  );
}
