import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[70vh] flex-col justify-center py-24">
      <p className="label mb-8 text-[color:var(--color-smoke)]">(Erreur 404)</p>

      <h1 className="display-hero mb-10 leading-[0.8]">404</h1>

      <p className="mb-10 max-w-[46ch] text-base leading-relaxed text-[color:var(--color-smoke)]">
        Cette page n&apos;existe pas, ou plus. La série a peut-être été retirée
        de la vente.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link href="/boutique" className="btn">
          Voir la collection
        </Link>
        <Link href="/" className="btn btn-outline">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
