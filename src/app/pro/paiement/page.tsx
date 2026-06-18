import Link from "next/link";
import { LrtLogo } from "@/components/LrtLogo";
import { PaymentClient } from "./PaymentClient";

type PaymentPageProps = {
  searchParams: Promise<{ compte?: string }>;
};

const reasons = [
  "Activation de votre espace admin professionnel",
  "QR code unique pour votre atelier",
  "Limitation des faux comptes et des abus",
  "Acces aux reparations, statuts, notes internes et emails client",
];

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const { compte } = await searchParams;

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-2xl gap-6">
        <Link
          href="/pro/inscription"
          className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
        >
          Retour a l inscription
        </Link>
        <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <header className="grid gap-2">
            <LrtLogo />
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Activation premium
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">
              Votre compte est pret, il reste l activation.
            </h1>
            <p className="text-sm leading-6 text-slate-700">
              Le paiement unique de 4,99 EUR sert a activer le compte pro et a
              eviter la creation massive de comptes inutiles. Apres paiement,
              vous pourrez vous connecter a l admin et utiliser votre QR code.
            </p>
          </header>

          <ul className="grid gap-3">
            {reasons.map((reason) => (
              <li
                key={reason}
                className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
              >
                {reason}
              </li>
            ))}
          </ul>

          <div className="rounded-md bg-slate-950 p-4 text-white">
            <p className="text-sm text-slate-300">Compte</p>
            <p className="mt-1 text-lg font-semibold">{compte || "Non precise"}</p>
          </div>

          <PaymentClient slug={compte ?? ""} />
        </section>
      </div>
    </main>
  );
}
