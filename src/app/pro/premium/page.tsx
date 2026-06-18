import Link from "next/link";

type PremiumPageProps = {
  searchParams: Promise<{ compte?: string }>;
};

export default async function PremiumPage({ searchParams }: PremiumPageProps) {
  const { compte } = await searchParams;

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-xl gap-5 rounded-lg border border-emerald-200 bg-white p-6 shadow-sm">
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
