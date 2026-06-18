import Link from "next/link";
import { LrtLogo } from "@/components/LrtLogo";

export default function ProThanksPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-xl gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <LrtLogo />
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Paiement recu
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">
          Paiement valide
        </h1>
        <p className="text-sm leading-6 text-slate-700">
          Stripe confirme le paiement via webhook. Dans quelques instants, vous
          pourrez vous connecter a l&apos;espace admin avec l&apos;email et le mot de
          passe choisis pendant l&apos;inscription.
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
